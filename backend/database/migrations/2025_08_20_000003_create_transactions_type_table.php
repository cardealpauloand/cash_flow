<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions_type', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->enum('name',['income','expense','transfer'])->unique();
        });
    }
    public function down(): void { Schema::dropIfExists('transactions_type'); }
};
