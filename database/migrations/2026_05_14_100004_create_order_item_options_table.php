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
        Schema::create('order_item_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_option_item_id')->constrained('menu_option_items')->restrictOnDelete();
            $table->string('option_group_name'); // Snapshot: "Level Gula"
            $table->string('option_name');       // Snapshot: "Less Sugar"
            $table->decimal('price_modifier', 12, 2)->default(0); // Snapshot harga tambahan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_item_options');
    }
};
