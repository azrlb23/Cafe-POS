<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Shift;
use App\Models\PettyCash;
use App\Models\RawMaterial;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());
        $search = $request->input('search');

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // 1. Daily Sales Summary (No search filter usually needed for summary)
        $dailySales = Order::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total) as revenue')
            )
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get()
            ->map(function($item) {
                // Get petty cash for that day
                $item->petty_cash = PettyCash::whereDate('created_at', $item->date)->sum('amount');
                $item->net_profit = $item->revenue - $item->petty_cash;
                return $item;
            });

        // 2. Shift History with User relation
        $shifts = Shift::whereBetween('opened_at', [$start, $end])
            ->with('user:id,name')
            ->when($search, function($query, $search) {
                $query->whereHas('user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->select('*')
            ->selectSub(function($query) {
                $query->from('petty_cashes')
                    ->whereColumn('shift_id', 'shifts.id')
                    ->selectRaw('SUM(amount)');
            }, 'petty_cash_sum')
            ->orderBy('opened_at', 'desc')
            ->get()
            ->map(function($shift) {
                $shift->duration = $shift->closed_at 
                    ? Carbon::parse($shift->opened_at)->diffInMinutes(Carbon::parse($shift->closed_at))
                    : null;
                return $shift;
            });

        // 3. Void Logs
        $voidLogs = Order::whereBetween('created_at', [$start, $end])
            ->where('status', 'void')
            ->with('user:id,name')
            ->when($search, function($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhereHas('user', function($u) use ($search) {
                          $u->where('name', 'like', "%{$search}%");
                      })
                      ->orWhere('void_reason', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // 4. Menu Performance
        $menuPerformance = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menus', 'order_items.menu_id', '=', 'menus.id')
            ->join('categories', 'menus.category_id', '=', 'categories.id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('orders.status', 'completed')
            ->when($search, function($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('menus.name', 'like', "%{$search}%")
                      ->orWhere('categories.name', 'like', "%{$search}%");
                });
            })
            ->select(
                'menus.id',
                'menus.name',
                'categories.name as category_name',
                DB::raw('SUM(order_items.quantity) as total_qty'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->groupBy('menus.id', 'menus.name', 'category_name')
            ->orderBy('total_qty', 'desc')
            ->get()
            ->map(function($item) {
                // Find the menu and calculate its COGS per unit
                $menu = \App\Models\Menu::with('recipes.rawMaterial')->find($item->id);
                $cogsPerUnit = 0;
                if ($menu) {
                    foreach ($menu->recipes as $recipe) {
                        if ($recipe->rawMaterial) {
                            $cogsPerUnit += ($recipe->quantity * $recipe->rawMaterial->cost_per_unit);
                        }
                    }
                }
                $item->total_cogs = $cogsPerUnit * $item->total_qty;
                $item->margin = $item->total_revenue - $item->total_cogs;
                return $item;
            });

        // 5. Petty Cash Logs
        $pettyCashLogs = PettyCash::whereBetween('created_at', [$start, $end])
            ->with('user:id,name')
            ->when($search, function($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('notes', 'like', "%{$search}%")
                      ->orWhereHas('user', function($u) use ($search) {
                          $u->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // 6. Detailed Transaction History
        $orderHistory = Order::whereBetween('created_at', [$start, $end])
            ->with(['user:id,name', 'cafeTable:id,name', 'orderItems.menu.recipes.rawMaterial'])
            ->when($search, function($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhereHas('user', function($u) use ($search) {
                          $u->where('name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('cafeTable', function($t) use ($search) {
                          $t->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // 7. Stock Mutations (Inventory Audit)
        $stockMutations = \App\Models\StockMutation::with('rawMaterial')
            ->whereBetween('created_at', [$start, $end])
            ->when($search, function($query, $search) {
                $query->whereHas('rawMaterial', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhere('reference', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Reports/Index', [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'search' => $search,
            ],
            'dailySales' => $dailySales,
            'shifts' => $shifts,
            'voidLogs' => $voidLogs,
            'menuPerformance' => $menuPerformance,
            'pettyCashLogs' => $pettyCashLogs,
            'orderHistory' => $orderHistory,
            'stockMutations' => $stockMutations,
        ]);
    }

    public function export(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $format = $request->input('format', 'pdf');
        $type = $request->input('type', 'sales');
        $search = $request->input('search');

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $data = collect();

        if ($type === 'sales') {
            $data = Order::whereBetween('created_at', [$start, $end])
                ->where('status', 'completed')
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('SUM(total) as revenue')
                )
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->get()
                ->map(function($item) {
                    $item->petty_cash = PettyCash::whereDate('created_at', $item->date)->sum('amount');
                    $item->net_profit = $item->revenue - $item->petty_cash;
                    return $item;
                });
        } elseif ($type === 'shifts') {
            $data = Shift::whereBetween('opened_at', [$start, $end])
                ->with('user:id,name')
                ->select('*')
                ->selectSub(function($query) {
                    $query->from('petty_cashes')
                        ->whereColumn('shift_id', 'shifts.id')
                        ->selectRaw('SUM(amount)');
                }, 'petty_cash_sum')
                ->orderBy('opened_at', 'desc')
                ->when($search, function($query, $search) {
                    $query->whereHas('user', function($u) use ($search) {
                        $u->where('name', 'like', "%{$search}%");
                    });
                })
                ->get();
        } elseif ($type === 'menu_performance') {
            $data = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->join('menus', 'order_items.menu_id', '=', 'menus.id')
                ->join('categories', 'menus.category_id', '=', 'categories.id')
                ->whereBetween('orders.created_at', [$start, $end])
                ->where('orders.status', 'completed')
                ->select(
                    'menus.name',
                    'categories.name as category_name',
                    DB::raw('SUM(order_items.quantity) as total_qty'),
                    DB::raw('SUM(order_items.subtotal) as total_revenue')
                )
                ->groupBy('menus.id', 'menus.name', 'category_name')
                ->orderBy('total_qty', 'desc')
                ->when($search, function($query, $search) {
                    $query->where('menus.name', 'like', "%{$search}%");
                })
                ->get();
        } elseif ($type === 'expenses') {
            $data = PettyCash::whereBetween('created_at', [$start, $end])
                ->with('user:id,name')
                ->orderBy('created_at', 'desc')
                ->when($search, function($query, $search) {
                    $query->where('notes', 'like', "%{$search}%");
                })
                ->get();
        } elseif ($type === 'voids') {
            $data = Order::whereBetween('created_at', [$start, $end])
                ->where('status', 'void')
                ->with('user:id,name')
                ->orderBy('created_at', 'desc')
                ->when($search, function($query, $search) {
                    $query->where('order_number', 'like', "%{$search}%");
                })
                ->get();
        } elseif ($type === 'transactions') {
            $data = Order::whereBetween('created_at', [$start, $end])
                ->with(['user:id,name', 'cafeTable:id,name'])
                ->orderBy('created_at', 'desc')
                ->when($search, function($query, $search) {
                    $query->where(function($q) use ($search) {
                        $q->where('order_number', 'like', "%{$search}%")
                          ->orWhereHas('user', function($u) use ($search) {
                              $u->where('name', 'like', "%{$search}%");
                          });
                    });
                })
                ->get();
        } elseif ($type === 'stock_mutations') {
            $data = \App\Models\StockMutation::with('rawMaterial')
                ->whereBetween('created_at', [$start, $end])
                ->orderBy('created_at', 'desc')
                ->when($search, function($query, $search) {
                    $query->whereHas('rawMaterial', function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
                })
                ->get();
        }

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('reports.pdf', [
                'data' => $data,
                'type' => $type,
                'startDate' => $startDate,
                'endDate' => $endDate
            ]);
            return $pdf->download("laporan-{$type}-{$startDate}.pdf");
        }

        // CSV/Excel Export
        $filename = "laporan-{$type}-{$startDate}.csv";
        $handle = fopen('php://output', 'w');
        
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        if ($type === 'sales') {
            fputcsv($handle, ['Tanggal', 'Transaksi', 'Omzet Bruto', 'Petty Cash', 'Laba Bersih']);
            foreach ($data as $row) {
                fputcsv($handle, [$row->date, $row->total_orders, $row->revenue, $row->petty_cash, $row->net_profit]);
            }
        } elseif ($type === 'shifts') {
            fputcsv($handle, ['Kasir', 'Waktu Buka', 'Waktu Tutup', 'Tunai', 'Fisik', 'Selisih']);
            foreach ($data as $row) {
                fputcsv($handle, [
                    $row->user->name, 
                    $row->opened_at, 
                    $row->closed_at, 
                    $row->total_cash_sales, 
                    $row->closing_cash, 
                    $row->closing_cash - ($row->opening_balance + $row->total_cash_sales - $row->petty_cash_sum)
                ]);
            }
        } elseif ($type === 'voids') {
            fputcsv($handle, ['Waktu', 'No. Order', 'Kasir', 'Alasan', 'Nominal']);
            foreach ($data as $row) {
                fputcsv($handle, [
                    $row->created_at,
                    $row->order_number,
                    $row->user?->name,
                    $row->void_reason,
                    $row->total
                ]);
            }
        } elseif ($type === 'menu_performance') {
            fputcsv($handle, ['Nama Menu', 'Kategori', 'Qty Terjual', 'Total Omzet']);
            foreach ($data as $row) {
                fputcsv($handle, [$row->name, $row->category_name, $row->total_qty, $row->total_revenue]);
            }
        } elseif ($type === 'expenses') {
            fputcsv($handle, ['Waktu', 'Kasir', 'Nominal', 'Catatan']);
            foreach ($data as $row) {
                fputcsv($handle, [$row->created_at, $row->user->name, $row->amount, $row->notes]);
            }
        } elseif ($type === 'transactions') {
            fputcsv($handle, ['Waktu', 'No. Order', 'Meja', 'Kasir', 'Metode', 'Total']);
            foreach ($data as $row) {
                fputcsv($handle, [
                    $row->created_at,
                    $row->order_number,
                    $row->cafeTable?->name ?? 'Takeaway',
                    $row->user?->name,
                    $row->payment_method,
                    $row->total
                ]);
            }
        } elseif ($type === 'stock_mutations') {
            fputcsv($handle, ['Waktu', 'Bahan Baku', 'Tipe', 'Jumlah', 'Referensi', 'Catatan']);
            foreach ($data as $row) {
                fputcsv($handle, [
                    $row->created_at,
                    $row->rawMaterial?->name,
                    $row->type === 'in' ? 'Masuk' : 'Keluar',
                    $row->quantity,
                    $row->reference,
                    $row->notes
                ]);
            }
        }

        fclose($handle);
        exit;
    }
}
