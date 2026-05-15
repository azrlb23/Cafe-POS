<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('raw_material_id')->constrained()->restrictOnDelete();
            $table->foreignId('menu_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('menu_option_item_id')->nullable()->constrained('menu_option_items')->cascadeOnDelete();
            $table->decimal('quantity', 8, 2); // Jumlah bahan baku yang dipakai per porsi
            $table->timestamps();
            $table->unique(['raw_material_id', 'menu_id']);
            $table->unique(['raw_material_id', 'menu_option_item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};
