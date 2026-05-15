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
        Schema::create('menu_option_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_option_group_id')->constrained('menu_option_groups')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price_modifier', 12, 2)->default(0); // Tambahan harga
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_option_items');
    }
};
