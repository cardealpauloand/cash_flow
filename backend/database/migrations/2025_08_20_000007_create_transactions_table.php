<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->decimal('value',14,2);
            $table->unsignedTinyInteger('transaction_type_id');
            $table->date('date');
            $table->unsignedBigInteger('account_id');
            $table->unsignedBigInteger('account_out_id')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->text('notes')->nullable();
            $table->char('transfer_group',36)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('transaction_type_id')->references('id')->on('transactions_type');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('account_id')->references('id')->on('accounts')->onDelete('restrict');
            $table->foreign('account_out_id')->references('id')->on('accounts')->onDelete('restrict');

            $table->index(['user_id','date'],'idx_tx_user_date');
            $table->index('transaction_type_id','idx_tx_type');
        });
    }
    public function down(): void { Schema::dropIfExists('transactions'); }
};
