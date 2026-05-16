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
        Schema::table('raw_materials', function (Blueprint $table) {
            $table->decimal('par_level', 10, 2)->default(0)->after('minimum_stock');
            $table->foreignId('default_supplier_id')->nullable()->constrained('suppliers')->nullOnDelete()->after('par_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('raw_materials', function (Blueprint $table) {
            $table->dropForeign(['default_supplier_id']);
            $table->dropColumn(['par_level', 'default_supplier_id']);
        });
    }
};
