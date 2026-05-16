<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\RawMaterial;
use App\Models\StockMutation;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        // Get materials below minimum stock
        $suggestions = RawMaterial::with('defaultSupplier')
            ->whereNotNull('default_supplier_id')
            ->whereColumn('current_stock', '<=', 'minimum_stock')
            ->get()
            ->groupBy('default_supplier_id')
            ->map(function ($items, $supplierId) {
                $supplier = $items->first()->defaultSupplier;
                return [
                    'supplier' => $supplier,
                    'items' => $items->map(function ($item) {
                        return [
                            'raw_material_id' => $item->id,
                            'name' => $item->name,
                            'unit' => $item->unit,
                            'current_stock' => $item->current_stock,
                            'minimum_stock' => $item->minimum_stock,
                            'par_level' => $item->par_level,
                            'suggested_quantity' => max(0, $item->par_level - $item->current_stock),
                            'unit_cost' => $item->cost_per_unit
                        ];
                    })
                ];
            });

        return Inertia::render('Admin/PurchaseOrders/Index', [
            'purchaseOrders' => PurchaseOrder::with(['supplier', 'items.rawMaterial'])->latest()->get(),
            'suppliers' => Supplier::all(),
            'rawMaterials' => RawMaterial::all(),
            'suggestions' => $suggestions->values()
        ]);
    }

    public function create(Request $request)
    {
        // Check for autofill from suggestion
        $autofill = null;
        if ($request->supplier_id) {
            $supplier = Supplier::find($request->supplier_id);
            if ($supplier) {
                $materials = RawMaterial::where('default_supplier_id', $supplier->id)
                    ->whereColumn('current_stock', '<=', 'minimum_stock')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'raw_material_id' => $item->id,
                            'name' => $item->name,
                            'quantity' => max(0, $item->par_level - $item->current_stock),
                            'unit_cost' => $item->cost_per_unit,
                            'unit' => $item->unit
                        ];
                    });
                
                $autofill = [
                    'supplier_id' => $supplier->id,
                    'items' => $materials
                ];
            }
        }

        return Inertia::render('Admin/PurchaseOrders/Create', [
            'suppliers' => Supplier::all(),
            'rawMaterials' => RawMaterial::all(),
            'autofill' => $autofill,
            'nextOrderNumber' => 'PO-' . date('Ymd') . '-' . (PurchaseOrder::count() + 1)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_number' => 'required|unique:purchase_orders,order_number',
            'purchase_date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.raw_material_id' => 'required|exists:raw_materials,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        DB::transaction(function() use ($validated) {
            $po = PurchaseOrder::create([
                'supplier_id' => $validated['supplier_id'],
                'order_number' => $validated['order_number'],
                'purchase_date' => $validated['purchase_date'],
                'notes' => $validated['notes'],
                'total_amount' => collect($validated['items'])->sum(fn($i) => $i['quantity'] * $i['unit_cost']),
                'status' => 'received',
            ]);

            foreach ($validated['items'] as $item) {
                $po->items()->create([
                    'raw_material_id' => $item['raw_material_id'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'subtotal' => $item['quantity'] * $item['unit_cost'],
                ]);

                // UPDATE RAW MATERIAL
                $material = RawMaterial::find($item['raw_material_id']);
                $material->current_stock += $item['quantity'];
                $material->cost_per_unit = $item['unit_cost'];
                $material->save();

                // LOG MUTATION
                StockMutation::create([
                    'raw_material_id' => $material->id,
                    'type' => 'in',
                    'quantity' => $item['quantity'],
                    'reference' => 'PO: ' . $po->order_number,
                    'notes' => 'Stok masuk dari supplier: ' . $po->supplier->name,
                ]);
            }
        });

        return redirect()->route('admin.purchase-orders.index')->with('success', 'Stok berhasil ditambahkan dan modal diperbarui');
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(['supplier', 'items.rawMaterial']);
        return Inertia::render('Admin/PurchaseOrders/Show', [
            'purchaseOrder' => $purchaseOrder
        ]);
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->delete();
        return redirect()->route('admin.purchase-orders.index')->with('success', 'Riwayat pembelian dihapus');
    }
}
