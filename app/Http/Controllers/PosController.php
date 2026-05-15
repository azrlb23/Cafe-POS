<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Menu;
use App\Models\CafeTable;
use App\Models\Shift;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PosController extends Controller
{
    /**
     * Display the POS interface.
     */
    public function index()
    {
        $user = Auth::user();
        
        // Check for active shift
        $activeShift = Shift::where('user_id', $user->id)
            ->whereNull('closed_at')
            ->first();

        // Fetch today's history for the kasir
        $todayOrders = Order::with('orderItems')
            ->whereDate('created_at', now()->today())
            ->orderBy('created_at', 'desc')
            ->get();
            
        $todayPettyCash = \App\Models\PettyCash::with('user')
            ->whereDate('created_at', now()->today())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Pos', [
            'menus' => Menu::with(['category', 'menuOptionGroups.menuOptionItems'])->where('is_active', true)->get(),
            'categories' => Category::all(),
            'tables' => CafeTable::orderBy('name')->get(),
            'activeShift' => $activeShift,
            'todayOrders' => $todayOrders,
            'todayPettyCash' => $todayPettyCash,
        ]);
    }

    /**
     * Display the History interface.
     */
    public function history()
    {
        $todayOrders = Order::with(['orderItems', 'user'])
            ->whereDate('created_at', now()->today())
            ->orderBy('created_at', 'desc')
            ->get();
            
        $todayPettyCash = \App\Models\PettyCash::with('user')
            ->whereDate('created_at', now()->today())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Pos/History', [
            'todayOrders' => $todayOrders,
            'todayPettyCash' => $todayPettyCash,
        ]);
    }

    /**
     * Start a new shift.
     */
    public function startShift(Request $request)
    {
        $request->validate([
            'pin' => 'required|string',
            'opening_cash' => 'required|numeric|min:0',
        ]);

        $user = Auth::user();

        // Verify PIN
        if ($request->pin !== $user->pin) {
            return back()->withErrors(['pin' => 'PIN yang Anda masukkan salah.']);
        }

        // Check if there's already an active shift for this user
        $existingShift = Shift::where('user_id', $user->id)
            ->whereNull('closed_at')
            ->first();

        if ($existingShift) {
            return back()->withErrors(['shift' => 'Anda masih memiliki shift yang belum ditutup.']);
        }

        Shift::create([
            'user_id' => $user->id,
            'opened_at' => now(),
            'opening_cash' => $request->opening_cash,
        ]);

        return redirect()->route('pos')->with('success', 'Shift berhasil dibuka. Selamat bertugas!');
    }

    /**
     * Store a new order.
     */
    public function submitOrder(Request $request)
    {
        $request->validate([
            'shift_id' => 'required|exists:shifts,id',
            'cafe_table_id' => 'nullable|exists:cafe_tables,id',
            'order_type' => 'required|in:dine_in,takeaway',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|in:cash,qris,transfer',
            'payment_amount' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $user = Auth::user();
            
            // 1. Create Order
            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'shift_id' => $request->shift_id,
                'user_id' => $user->id,
                'cafe_table_id' => $request->cafe_table_id,
                'order_type' => $request->order_type,
                'subtotal' => 0, // Will calculate below
                'total' => 0,    // Will calculate below
                'payment_method' => $request->payment_method,
                'payment_amount' => $request->payment_amount,
                'status' => 'completed',
                'notes' => $request->notes,
            ]);

            $totalSubtotal = 0;

            // 2. Process Items
            foreach ($request->items as $itemData) {
                $menu = Menu::find($itemData['menu_id']);
                
                $orderItem = $order->orderItems()->create([
                    'menu_id' => $menu->id,
                    'menu_name' => $menu->name, // Snapshot
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $menu->base_price, // Snapshot
                    'subtotal' => $menu->base_price * $itemData['quantity'],
                ]);

                $itemTotalOptions = 0;

                // 3. Process Options for this Item
                if (!empty($itemData['options'])) {
                    foreach ($itemData['options'] as $optionData) {
                        // $optionData should have menu_option_item_id
                        $optionItem = \App\Models\MenuOptionItem::with('menuOptionGroup')->find($optionData['id']);
                        
                        $orderItem->orderItemOptions()->create([
                            'menu_option_item_id' => $optionItem->id,
                            'option_group_name' => $optionItem->menuOptionGroup->name, // Snapshot
                            'option_name' => $optionItem->name, // Snapshot
                            'price_modifier' => $optionItem->price_modifier, // Snapshot
                        ]);

                        $itemTotalOptions += $optionItem->price_modifier;
                    }
                }

                // Update item subtotal with options
                $finalItemSubtotal = ($menu->base_price + $itemTotalOptions) * $itemData['quantity'];
                $orderItem->update(['subtotal' => $finalItemSubtotal]);
                
                $totalSubtotal += $finalItemSubtotal;
            }

            // 4. Update Final Order Totals
            $order->update([
                'subtotal' => $totalSubtotal,
                'total' => $totalSubtotal,
                'change' => max(0, $request->payment_amount - $totalSubtotal),
            ]);

            // 4.5 Update Shift Totals
            $shift = Shift::find($request->shift_id);
            $shift->increment('total_sales', $totalSubtotal);
            if ($request->payment_method === 'cash') {
                $shift->increment('total_cash_sales', $totalSubtotal);
            }

            // 5. Deduct Stock
            $inventoryService = new \App\Services\InventoryService();
            $inventoryService->deductStockFromOrder($order);

            return redirect()->route('pos')->with('success', 'Pesanan #' . $order->order_number . ' berhasil disimpan.');
        });
    }

    /**
     * Void/Cancel an order.
     */
    public function voidOrder(Request $request, Order $order)
    {
        $request->validate([
            'void_reason' => 'required|string|max:255',
        ]);

        if ($order->status === 'void') {
            return back()->withErrors(['order' => 'Pesanan ini sudah dibatalkan sebelumnya.']);
        }

        DB::transaction(function () use ($request, $order) {
            // 1. Update Order Status
            $order->update([
                'status' => 'void',
                'void_reason' => $request->void_reason,
            ]);

            // 2. Adjust Shift Balance
            $shift = $order->shift;
            if ($shift) {
                $shift->decrement('total_sales', $order->total);
                if ($order->payment_method === 'cash') {
                    $shift->decrement('total_cash_sales', $order->total);
                }
            }

            // 3. Restore Stock
            $inventoryService = new \App\Services\InventoryService();
            $inventoryService->restoreStockFromOrder($order);
        });

        return back()->with('success', "Pesanan #{$order->order_number} berhasil dibatalkan.");
    }

    /**
     * Store petty cash entry.
     */
    public function storePettyCash(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100',
            'description' => 'required|string|max:255',
        ]);

        $user = Auth::user();

        $activeShift = Shift::where('user_id', $user->id)
            ->whereNull('closed_at')
            ->first();

        if (!$activeShift) {
            return back()->withErrors(['shift' => 'Tidak ada shift aktif untuk mencatat kas keluar.']);
        }

        DB::transaction(function () use ($request, $user, $activeShift) {
            \App\Models\PettyCash::create([
                'shift_id' => $activeShift->id,
                'user_id' => $user->id,
                'amount' => $request->amount,
                'description' => $request->description,
            ]);

            $activeShift->increment('total_petty_cash', $request->amount);
        });

        return redirect()->route('pos')->with('success', 'Kas keluar berhasil dicatat.');
    }

    /**
     * Close the current shift.
     */
    public function endShift(Request $request)
    {
        $request->validate([
            'closing_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $user = Auth::user();

        $activeShift = Shift::where('user_id', $user->id)
            ->whereNull('closed_at')
            ->first();

        if (!$activeShift) {
            return back()->withErrors(['shift' => 'Tidak ada shift aktif untuk ditutup.']);
        }

        // Expected cash in drawer = opening cash + total cash sales - petty cash
        $expectedClosingCash = $activeShift->opening_cash + $activeShift->total_cash_sales - $activeShift->total_petty_cash;

        $activeShift->update([
            'closed_at' => now(),
            'closing_cash' => $request->closing_cash, // The physical cash reported by cashier
            'expected_closing_cash' => $expectedClosingCash, // The system's calculation
            'total_sales' => $activeShift->total_sales, // Already updated per order
            'notes' => $request->notes,
        ]);

        // Logout after closing shift to allow the next cashier to login
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Shift berhasil ditutup. Total Penjualan: Rp ' . number_format($activeShift->total_sales, 0, ',', '.'));
    }
}
