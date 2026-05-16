<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\CafeTable;
use Inertia\Inertia;

class AdminTableController extends Controller
{
    public function index()
    {
        $tables = CafeTable::with([
            'activeOrder.user:id,name', 
            'activeOrder.orderItems.menu:id,name'
        ])
        ->orderBy('number')
        ->get();

        return Inertia::render('Admin/Tables/Index', [
            'tables' => $tables
        ]);
    }
}
