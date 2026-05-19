<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Shift;
use App\Models\Order;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class CashierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cashiers = User::where('role', 'kasir')
            ->with(['shifts' => function ($query) {
                $query->whereNull('closed_at');
            }])
            ->get()
            ->map(function ($user) {
                $activeShift = $user->shifts->first();
                $user->is_active = !is_null($activeShift);
                $user->active_shift_duration = $activeShift ? $activeShift->opened_at : null;
                return $user;
            });

        // 1. Statistics
        $totalCashiers = $cashiers->count();
        $activeCashiersCount = Shift::whereNull('closed_at')->count();
        $totalTransactionsToday = Order::whereDate('created_at', now()->today())
            ->where('status', 'completed')
            ->count();

        // 2. Activity Logs for Cashiers today
        $activityLogs = ActivityLog::with('user:id,name')
            ->whereDate('created_at', now()->today())
            ->latest()
            ->take(50)
            ->get();

        return Inertia::render('Admin/Cashiers/Index', [
            'cashiers' => $cashiers,
            'stats' => [
                'total_cashiers' => $totalCashiers,
                'active_cashiers' => $activeCashiersCount,
                'total_transactions_today' => $totalTransactionsToday,
            ],
            'activityLogs' => $activityLogs,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Cashiers/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'pin' => 'required|string|size:6|unique:users,pin',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'pin' => $request->pin,
            'password' => Hash::make($request->password),
            'role' => 'kasir',
        ]);

        // Assign 'kasir' spatie role
        $roleCashier = Role::firstOrCreate(['name' => 'kasir']);
        $user->assignRole($roleCashier);

        return redirect()->route('admin.cashiers.index')->with('success', 'Akun Kasir berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $cashier)
    {
        return Inertia::render('Admin/Cashiers/Edit', [
            'cashier' => $cashier,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $cashier)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $cashier->id,
            'pin' => 'required|string|size:6|unique:users,pin,' . $cashier->id,
            'password' => 'nullable|string|min:6',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'pin' => $request->pin,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $cashier->update($data);

        return redirect()->route('admin.cashiers.index')->with('success', 'Data Kasir berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $cashier)
    {
        // Safety checks for active shifts or completed orders
        if ($cashier->shifts()->exists() || $cashier->orders()->exists()) {
            return back()->withErrors([
                'error' => 'Tidak dapat menghapus Kasir ' . $cashier->name . ' karena kasir ini memiliki riwayat transaksi atau shift dalam database. Akun kasir hanya dapat dinonaktifkan / diubah kredensialnya demi integritas data laporan keuangan.'
            ]);
        }

        $cashier->delete();

        return redirect()->route('admin.cashiers.index')->with('success', 'Akun Kasir berhasil dihapus.');
    }
}
