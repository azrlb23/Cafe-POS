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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // Auto-generated: ORD-20260514-001
            $table->foreignId('shift_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete(); // Kasir yang memproses
            $table->foreignId('cafe_table_id')->nullable()->constrained('cafe_tables')->nullOnDelete(); // null = takeaway
            $table->enum('order_type', ['dine_in', 'takeaway'])->default('dine_in');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('total', 12, 2); // Sama dengan subtotal (tidak ada pajak/service)
            $table->enum('payment_method', ['cash', 'qris', 'ewallet', 'transfer'])->default('cash');
            $table->decimal('payment_amount', 12, 2)->default(0); // Jumlah uang diterima
            $table->decimal('change', 12, 2)->default(0); // Kembalian
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending');
            $table->text('notes')->nullable(); // Catatan umum pesanan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
