<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RawMaterial;
use App\Models\StockMutation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RawMaterialController extends Controller
{
    public function index(Request $request)
    {
        $query = RawMaterial::with('defaultSupplier')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', '%' . $search . '%');
            });

        return Inertia::render('Admin/RawMaterials/Index', [
            'rawMaterials' => $query->latest()->get(),
            'suppliers' => \App\Models\Supplier::all(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/RawMaterials/Create', [
            'suppliers' => \App\Models\Supplier::all()
        ]);
    }

    public function edit(RawMaterial $rawMaterial)
    {
        return Inertia::render('Admin/RawMaterials/Edit', [
            'rawMaterial' => $rawMaterial,
            'suppliers' => \App\Models\Supplier::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'cost_per_unit' => 'required|numeric|min:0',
            'current_stock' => 'required|numeric|min:0',
            'minimum_stock' => 'nullable|numeric|min:0',
            'par_level' => 'nullable|numeric|min:0',
            'default_supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $rawMaterial = RawMaterial::create($validated);

        // Initial stock mutation
        if ($rawMaterial->current_stock > 0) {
            StockMutation::create([
                'raw_material_id' => $rawMaterial->id,
                'type' => 'in',
                'quantity' => $rawMaterial->current_stock,
                'reference' => 'Initial Stock',
                'notes' => 'Saldo awal saat pendaftaran bahan baku',
            ]);
        }

        return redirect()->route('admin.raw-materials.index')->with('success', 'Bahan baku berhasil ditambahkan.');
    }

    public function update(Request $request, RawMaterial $rawMaterial)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'cost_per_unit' => 'required|numeric|min:0',
            'current_stock' => 'required|numeric|min:0',
            'minimum_stock' => 'nullable|numeric|min:0',
            'par_level' => 'nullable|numeric|min:0',
            'default_supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $diff = $validated['current_stock'] - $rawMaterial->current_stock;

        if ($diff != 0) {
            StockMutation::create([
                'raw_material_id' => $rawMaterial->id,
                'type' => $diff > 0 ? 'in' : 'out',
                'quantity' => abs($diff),
                'reference' => 'Manual Adjustment',
                'notes' => 'Penyesuaian stok manual oleh admin',
            ]);
        }

        $rawMaterial->update($validated);

        return redirect()->route('admin.raw-materials.index')->with('success', 'Bahan baku berhasil diperbarui.');
    }

    public function destroy(RawMaterial $rawMaterial)
    {
        $rawMaterial->delete();
        return redirect()->route('admin.raw-materials.index')->with('success', 'Bahan baku berhasil dihapus.');
    }
}
