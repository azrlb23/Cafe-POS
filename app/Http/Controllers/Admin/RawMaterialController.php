<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RawMaterial;
use App\Models\StockMutation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RawMaterialController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/RawMaterials/Index', [
            'rawMaterials' => RawMaterial::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'current_stock' => 'required|numeric|min:0',
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
            'current_stock' => 'required|numeric|min:0',
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
