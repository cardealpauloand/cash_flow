<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions_category', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('transactions_sub_id');
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('sub_category_id')->nullable();

            $table->foreign('transactions_sub_id')->references('id')->on('transactions_sub')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('category')->onDelete('restrict');
            $table->foreign('sub_category_id')->references('id')->on('sub_category')->onDelete('restrict');

            $table->unique('transactions_sub_id','uk_tcat_unique');
        });
    }
    public function down(): void { Schema::dropIfExists('transactions_category'); }
};
