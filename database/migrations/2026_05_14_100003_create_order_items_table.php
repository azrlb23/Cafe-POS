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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_id')->constrained()->restrictOnDelete();
            $table->string('menu_name'); // Snapshot nama menu saat order dibuat
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_price', 12, 2); // Harga satuan (base_price snapshot)
            $table->decimal('subtotal', 12, 2);   // (unit_price + options modifiers) × quantity
            $table->text('notes')->nullable(); // Catatan per item, misal "pedas sedikit"
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
