<?php

namespace App\Services;

use App\Models\Order;
use App\Models\RawMaterial;
use App\Models\StockMutation;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Deduct stock based on an order.
     */
    public function deductStockFromOrder(Order $order)
    {
        DB::transaction(function () use ($order) {
            foreach ($order->orderItems as $item) {
                // 1. Deduct Base Recipe
                $this->processRecipes($item->menu->recipes, $item->quantity, "Order #{$order->order_number}");

                // 2. Deduct Option Item Recipes
                foreach ($item->orderItemOptions as $option) {
                    if ($option->menuOptionItem) {
                        $this->processRecipes($option->menuOptionItem->recipes, $item->quantity, "Order #{$order->order_number} (Option)");
                    }
                }
            }
        });
    }

    /**
     * Restore stock based on a voided order.
     */
    public function restoreStockFromOrder(Order $order)
    {
        DB::transaction(function () use ($order) {
            foreach ($order->orderItems as $item) {
                // 1. Restore Base Recipe
                $this->processRecipesRestore($item->menu->recipes, $item->quantity, "VOID #{$order->order_number}");

                // 2. Restore Option Item Recipes
                foreach ($item->orderItemOptions as $option) {
                    if ($option->menuOptionItem) {
                        $this->processRecipesRestore($option->menuOptionItem->recipes, $item->quantity, "VOID #{$order->order_number} (Option)");
                    }
                }
            }
        });
    }

    /**
     * Process a collection of recipes and deduct stock.
     */
    private function processRecipes($recipes, $multiplier, $reference)
    {
        foreach ($recipes as $recipe) {
            $totalQuantity = $recipe->quantity * $multiplier;
            $material = $recipe->rawMaterial;

            if ($material) {
                // Update material stock
                $material->decrement('current_stock', $totalQuantity);

                // Create mutation record
                StockMutation::create([
                    'raw_material_id' => $material->id,
                    'type' => 'out',
                    'quantity' => $totalQuantity,
                    'reference' => $reference,
                    'notes' => "Pengurangan otomatis dari penjualan",
                ]);
            }
        }
    }

    /**
     * Process a collection of recipes and restore stock.
     */
    private function processRecipesRestore($recipes, $multiplier, $reference)
    {
        foreach ($recipes as $recipe) {
            $totalQuantity = $recipe->quantity * $multiplier;
            $material = $recipe->rawMaterial;

            if ($material) {
                // Update material stock
                $material->increment('current_stock', $totalQuantity);

                // Create mutation record
                StockMutation::create([
                    'raw_material_id' => $material->id,
                    'type' => 'in',
                    'quantity' => $totalQuantity,
                    'reference' => $reference,
                    'notes' => "Restorasi stok (Order Dibatalkan/Void)",
                ]);
            }
        }
    }
}
