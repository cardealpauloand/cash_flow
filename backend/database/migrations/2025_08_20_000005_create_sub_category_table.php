<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sub_category', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name',120)->unique('uk_sub_category_name');
        });
    }
    public function down(): void { Schema::dropIfExists('sub_category'); }
};
