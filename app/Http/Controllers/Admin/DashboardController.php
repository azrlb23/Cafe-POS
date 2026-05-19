<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ActivityLog;
use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemOption;
use App\Models\PettyCash;
use App\Models\RawMaterial;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));
        
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // 1. KPI Cards (Filtered by Range)
        $revenuePeriod = Order::whereBetween('created_at', [$start, $end])->where('status', 'completed')->sum('total');
        
        // Calculate comparison with previous equal period
        $daysDiff = $start->diffInDays($end) + 1;
        $prevStart = $start->copy()->subDays($daysDiff);
        $prevEnd = $start->copy()->subSecond();
        $revenuePrev = Order::whereBetween('created_at', [$prevStart, $prevEnd])->where('status', 'completed')->sum('total');
        $revenueChange = $revenuePrev > 0 ? (($revenuePeriod - $revenuePrev) / $revenuePrev) * 100 : 0;

        $transactionsPeriod = Order::whereBetween('created_at', [$start, $end])->where('status', 'completed')->count();
        $transactionsPrev = Order::whereBetween('created_at', [$prevStart, $prevEnd])->where('status', 'completed')->count();

        // Avg Basket Size (Revenue / Transactions)
        $avgBasketPeriod = $transactionsPeriod > 0 ? $revenuePeriod / $transactionsPeriod : 0;
        $avgBasketPrev = $transactionsPrev > 0 ? $revenuePrev / $transactionsPrev : 0;
        $avgBasketChange = $avgBasketPrev > 0 ? (($avgBasketPeriod - $avgBasketPrev) / $avgBasketPrev) * 100 : 0;
        $pettyCashPeriod = PettyCash::whereBetween('created_at', [$start, $end])->sum('amount');

        // Estimate current drawer balance (remains real-time)
        $activeShift = Shift::whereNull('end_time')->latest()->first();
        $estimatedBalance = $activeShift ? $activeShift->running_balance : 0;

        // 2. Sales Trend (Grouped by Day)
        $salesTrend = Order::where('status', 'completed')
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('DATE(created_at) as date, SUM(total) as revenue, COUNT(id) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // 3. Top 5 Best Selling Menus (Filtered by Range)
        $topMenus = OrderItem::select('menu_id', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(subtotal) as total_revenue'))
            ->whereHas('order', function ($query) use ($start, $end) {
                $query->where('status', 'completed')
                      ->whereBetween('created_at', [$start, $end]);
            })
            ->with('menu:id,name,category_id', 'menu.category:id,name')
            ->groupBy('menu_id')
            ->orderByDesc('total_quantity')
            ->take(5)
            ->get();

        // 4. Payment Methods Distribution
        $paymentMethods = Order::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed')
            ->select('payment_method', DB::raw('count(*) as count'), DB::raw('SUM(total) as total'))
            ->groupBy('payment_method')
            ->get();

        // 5. Peak Hours (Average across the period)
        // Using strftime for SQLite, adapt if using MySQL later
        $peakHours = Order::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed')
            ->selectRaw('strftime("%H", created_at) as hour, count(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // 6. Expense Trend (Petty Cash Daily)
        $expenseTrend = PettyCash::whereBetween('created_at', [$start, $end])
            ->selectRaw('DATE(created_at) as date, SUM(amount) as amount')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // 8. Dine-in vs Takeaway Distribution
        $orderTypes = Order::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed')
            ->select('order_type', DB::raw('count(*) as count'))
            ->groupBy('order_type')
            ->get();

        // 9. Revenue per Category
        $categoryRevenue = OrderItem::join('menus', 'order_items.menu_id', '=', 'menus.id')
            ->join('categories', 'menus.category_id', '=', 'categories.id')
            ->whereHas('order', function ($query) use ($start, $end) {
                $query->where('status', 'completed')
                      ->whereBetween('created_at', [$start, $end]);
            })
            ->select('categories.name as category_name', DB::raw('SUM(order_items.subtotal) as revenue'))
            ->groupBy('categories.name')
            ->orderByDesc('revenue')
            ->get();

        // 10. Void Audit (Summary)
        $voidStats = Order::whereBetween('created_at', [$start, $end])
            ->where('status', 'void')
            ->selectRaw('count(*) as count, SUM(total) as total')
            ->first();

        // 11. Cash Differences (Audit Shifts)
        $cashDifferences = Shift::whereBetween('closed_at', [$start, $end])
            ->selectRaw('SUM(closing_cash - expected_closing_cash) as total_diff')
            ->value('total_diff') ?? 0;

        // 12. Low Stock Alerts (Remains real-time)
        $lowStockItems = RawMaterial::whereColumn('current_stock', '<=', 'minimum_stock')
            ->where('minimum_stock', '>', 0)
            ->get();

        // 13. Meja Populer (Popular Tables)
        $popularTables = Order::whereBetween('created_at', [$start, $end])
            ->whereNotNull('cafe_table_id')
            ->where('status', 'completed')
            ->select('cafe_table_id', DB::raw('count(*) as count'))
            ->with('cafeTable:id,number')
            ->groupBy('cafe_table_id')
            ->orderByDesc('count')
            ->get();

        // 14. Menu Tidak Laku (Slow-moving Menus)
        $slowMenus = Menu::leftJoin('order_items', 'menus.id', '=', 'order_items.menu_id')
            ->select('menus.name', DB::raw('SUM(CASE WHEN order_items.id IS NOT NULL THEN order_items.quantity ELSE 0 END) as total_sold'))
            ->groupBy('menus.id', 'menus.name')
            ->orderBy('total_sold', 'asc')
            ->take(5)
            ->get();

        // 15. Proyeksi Stok (Stock Projection)
        $stockProjection = RawMaterial::select('id', 'name', 'current_stock', 'unit')
            ->get()
            ->map(function($item) use ($start, $end, $daysDiff) {
                $usage = DB::table('stock_mutations')
                    ->where('raw_material_id', $item->id)
                    ->where('type', 'out')
                    ->whereBetween('created_at', [$start, $end])
                    ->sum('quantity');
                $dailyUsage = $usage / max($daysDiff, 1);
                $item->days_remaining = $dailyUsage > 0 ? floor($item->current_stock / $dailyUsage) : 999;
                return $item;
            });

        // 16. Performa Kasir (Cashier Performance)
        $cashierPerformance = Order::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed')
            ->select('user_id', DB::raw('SUM(total) as revenue'), DB::raw('count(*) as orders'))
            ->with('user:id,name')
            ->groupBy('user_id')
            ->get();

        // 17. Kontribusi Varian (Variant Contribution)
        $variantContribution = OrderItemOption::join('order_items', 'order_item_options.order_item_id', '=', 'order_items.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('orders.status', 'completed')
            ->select('order_item_options.option_name', DB::raw('SUM(order_item_options.price_modifier * order_items.quantity) as revenue'))
            ->groupBy('order_item_options.option_name')
            ->orderByDesc('revenue')
            ->get();

        // 18. Recent Activities
        $recentOrders = Order::latest()->take(50)->with('user:id,name')->get();
        $recentPettyCash = PettyCash::latest()->take(50)->get();

        // 19. Profitability Analysis (COGS Calculation)
        $totalCogs = 0;
        $completedOrders = Order::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed')
            ->with('orderItems.menu.recipes.rawMaterial')
            ->get();

        foreach ($completedOrders as $order) {
            foreach ($order->orderItems as $item) {
                if (!$item->menu) continue;
                
                $itemCogs = 0;
                foreach ($item->menu->recipes as $recipe) {
                    if ($recipe->rawMaterial) {
                        $itemCogs += ($recipe->quantity * $recipe->rawMaterial->cost_per_unit);
                    }
                }
                $totalCogs += ($itemCogs * $item->quantity);
            }
        }

        return Inertia::render('Dashboard', [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'kpis' => [
                'financial' => [
                    'revenue' => (float) $revenuePeriod,
                    'revenueChange' => (float) $revenueChange,
                    'cogs' => (float) $totalCogs,
                    'grossProfit' => (float) ($revenuePeriod - $totalCogs),
                    'netProfit' => (float) ($revenuePeriod - $totalCogs - $pettyCashPeriod),
                ],
                'orders' => [
                    'total' => $transactionsPeriod,
                    'avgBasket' => (float) $avgBasketPeriod,
                    'avgBasketChange' => (float) $avgBasketChange,
                    'voidCount' => $voidStats->count ?? 0,
                    'voidTotal' => (float) ($voidStats->total ?? 0),
                ],
                'operations' => [
                    'estimatedBalance' => (float) $estimatedBalance,
                    'pettyCash' => (float) $pettyCashPeriod,
                    'cashDiff' => (float) $cashDifferences,
                    'lowStockCount' => $lowStockItems->count(),
                ]
            ],
            'salesTrend' => $salesTrend,
            'expenseTrend' => $expenseTrend,
            'topMenus' => $topMenus,
            'paymentMethods' => $paymentMethods,
            'peakHours' => $peakHours,
            'orderTypes' => $orderTypes,
            'categoryRevenue' => $categoryRevenue,
            'lowStockItems' => $lowStockItems,
            'popularTables' => $popularTables,
            'slowMenus' => $slowMenus,
            'stockProjection' => $stockProjection,
            'cashierPerformance' => $cashierPerformance,
            'variantContribution' => $variantContribution,
            'recentOrders' => $recentOrders,
            'recentPettyCash' => $recentPettyCash,
            'activeShift' => $activeShift ? $activeShift->load('user:id,name') : null,

            // Activity Log & Active Cashiers
            'activityLogs' => ActivityLog::with('user:id,name')
                ->whereDate('created_at', Carbon::today())
                ->latest()
                ->take(50)
                ->get(),
            'activeCashiers' => Shift::whereNull('closed_at')
                ->with('user:id,name')
                ->get(),
        ]);
    }
}
