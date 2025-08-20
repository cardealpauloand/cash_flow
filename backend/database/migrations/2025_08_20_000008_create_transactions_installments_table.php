<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions_installments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->decimal('value',14,2);
            $table->unsignedBigInteger('transaction_id');
            $table->unsignedTinyInteger('transaction_type_id');
            $table->unsignedBigInteger('account_id');
            $table->unsignedBigInteger('user_id');

            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('cascade');
            $table->foreign('transaction_type_id')->references('id')->on('transactions_type');
            $table->foreign('account_id')->references('id')->on('accounts')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->index('transaction_id','idx_ti_tx');
            $table->index('user_id','idx_ti_user');
        });
    }
    public function down(): void { Schema::dropIfExists('transactions_installments'); }
};
