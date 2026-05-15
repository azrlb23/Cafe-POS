<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Order;
use App\Models\OrderItem;
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

        // 4. Low Stock Alerts (Remains real-time)
        $lowStockItems = RawMaterial::whereColumn('current_stock', '<=', 'minimum_stock')
            ->where('minimum_stock', '>', 0)
            ->get();

        return Inertia::render('Dashboard', [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'kpis' => [
                'revenuePeriod' => (float) $revenuePeriod,
                'revenueChange' => (float) $revenueChange,
                'transactionsPeriod' => $transactionsPeriod,
                'pettyCashPeriod' => (float) $pettyCashPeriod,
                'estimatedBalance' => (float) $estimatedBalance,
            ],
            'salesTrend' => $salesTrend,
            'topMenus' => $topMenus,
            'lowStockItems' => $lowStockItems,
            'activeShift' => $activeShift ? $activeShift->load('user:id,name') : null,
        ]);
    }
}
