<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions_tag', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('transactions_installments_id');
            $table->unsignedBigInteger('tag_id');

            $table->foreign('transactions_installments_id')->references('id')->on('transactions_installments')->onDelete('cascade');
            $table->foreign('tag_id')->references('id')->on('tag')->onDelete('restrict');

            $table->unique(['transactions_installments_id','tag_id'],'uk_ttag');
        });
    }
    public function down(): void { Schema::dropIfExists('transactions_tag'); }
};
