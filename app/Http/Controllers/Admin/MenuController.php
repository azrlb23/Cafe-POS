<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMenuRequest;
use App\Http\Requests\UpdateMenuRequest;
use App\Models\Category;
use App\Models\Menu;
use App\Models\RawMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

use Inertia\Inertia;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $query = Menu::with('category')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', '%' . $search . '%');
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            });

        $menus = $query->latest()->get();

        return Inertia::render('Admin/Menus/Index', [
            'menus' => $menus,
            'categories' => Category::all(),
            'filters' => $request->only(['search', 'category_id'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Menus/Create', [
            'categories' => Category::all(),
            'raw_materials' => RawMaterial::all()
        ]);
    }

    public function store(StoreMenuRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $menu = Menu::create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'base_price' => $validated['base_price'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('menus', 'public');
                $menu->update(['image_path' => $path]);
            }

            if (!empty($validated['recipes'])) {
                foreach ($validated['recipes'] as $recipe) {
                    $menu->recipes()->create([
                        'raw_material_id' => $recipe['raw_material_id'],
                        'quantity' => $recipe['quantity'],
                    ]);
                }
            }

            if (!empty($validated['option_groups'])) {
                foreach ($validated['option_groups'] as $groupData) {
                    $group = $menu->menuOptionGroups()->create([
                        'name' => $groupData['name'],
                        'min_select' => $groupData['min_select'],
                        'max_select' => $groupData['max_select'],
                    ]);

                    if (!empty($groupData['items'])) {
                        foreach ($groupData['items'] as $itemData) {
                            $item = $group->menuOptionItems()->create([
                                'name' => $itemData['name'],
                                'price_modifier' => $itemData['price_modifier'],
                            ]);

                            if (!empty($itemData['recipes'])) {
                                foreach ($itemData['recipes'] as $itemRecipe) {
                                    $item->recipes()->create([
                                        'raw_material_id' => $itemRecipe['raw_material_id'],
                                        'quantity' => $itemRecipe['quantity'],
                                    ]);
                                }
                            }
                        }
                    }
                }
            }
        });

        return redirect()->route('admin.menus.index')->with('success', 'Menu berhasil ditambahkan.');
    }

    public function edit(Menu $menu)
    {
        $menu->load(['recipes', 'menuOptionGroups.menuOptionItems.recipes']);

        return Inertia::render('Admin/Menus/Edit', [
            'menu' => $menu,
            'categories' => Category::all(),
            'raw_materials' => RawMaterial::all()
        ]);
    }

    public function update(UpdateMenuRequest $request, Menu $menu)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, $menu) {
            $menu->update([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'base_price' => $validated['base_price'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Handle Image
            if ($request->hasFile('image')) {
                if ($menu->image_path) {
                    Storage::disk('public')->delete($menu->image_path);
                }
                $path = $request->file('image')->store('menus', 'public');
                $menu->update(['image_path' => $path]);
            }

            // Sync Base Recipes (safe to delete & recreate as no other tables point to recipe ID)
            $menu->recipes()->delete();
            if (!empty($validated['recipes'])) {
                foreach ($validated['recipes'] as $recipe) {
                    $menu->recipes()->create([
                        'raw_material_id' => $recipe['raw_material_id'],
                        'quantity' => $recipe['quantity'],
                    ]);
                }
            }

            // Sync Option Groups & Items (Must be careful not to delete referenced items)
            $incomingGroupIds = collect($validated['option_groups'] ?? [])->pluck('id')->filter()->toArray();
            
            // Delete groups not in request
            $menu->menuOptionGroups()->whereNotIn('id', $incomingGroupIds)->get()->each(function ($group) {
                // This might fail if items within group are restricted. 
                // DB cascade delete on menu_option_items would trigger restrict check on orders.
                $group->delete();
            });

            foreach ($validated['option_groups'] ?? [] as $groupData) {
                $group = $menu->menuOptionGroups()->updateOrCreate(
                    ['id' => $groupData['id'] ?? null],
                    [
                        'name' => $groupData['name'],
                        'min_select' => $groupData['min_select'],
                        'max_select' => $groupData['max_select'],
                    ]
                );

                // Sync Items within this Group
                $incomingItemIds = collect($groupData['items'] ?? [])->pluck('id')->filter()->toArray();
                
                // Delete items not in request
                $group->menuOptionItems()->whereNotIn('id', $incomingItemIds)->delete();

                foreach ($groupData['items'] ?? [] as $itemData) {
                    $item = $group->menuOptionItems()->updateOrCreate(
                        ['id' => $itemData['id'] ?? null],
                        [
                            'name' => $itemData['name'],
                            'price_modifier' => $itemData['price_modifier'],
                        ]
                    );

                    // Sync Item Recipes (safe to recreate)
                    $item->recipes()->delete();
                    foreach ($itemData['recipes'] ?? [] as $itemRecipe) {
                        $item->recipes()->create([
                            'raw_material_id' => $itemRecipe['raw_material_id'],
                            'quantity' => $itemRecipe['quantity'],
                        ]);
                    }
                }
            }
        });

        return redirect()->route('admin.menus.index')->with('success', 'Menu berhasil diperbarui.');
    }

    public function destroy(Menu $menu)
    {
        if ($menu->image_path) {
            Storage::disk('public')->delete($menu->image_path);
        }
        $menu->delete();
        return redirect()->route('admin.menus.index')->with('success', 'Menu berhasil dihapus.');
    }
}

