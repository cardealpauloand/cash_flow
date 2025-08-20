<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions_sub', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('transactions_installments_id');
            $table->decimal('value',14,2);

            $table->foreign('transactions_installments_id')->references('id')->on('transactions_installments')->onDelete('cascade');
            $table->index('transactions_installments_id','idx_ts_ti');
        });
    }
    public function down(): void { Schema::dropIfExists('transactions_sub'); }
};
