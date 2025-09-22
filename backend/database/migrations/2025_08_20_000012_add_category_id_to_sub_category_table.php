<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('sub_category')) return;
        Schema::table('sub_category', function (Blueprint $table) {
            if (!Schema::hasColumn('sub_category', 'category_id')) {
                $table->unsignedBigInteger('category_id')->nullable()->after('name');
                $table->foreign('category_id')->references('id')->on('category')->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('sub_category')) return;
        Schema::table('sub_category', function (Blueprint $table) {
            if (Schema::hasColumn('sub_category', 'category_id')) {
                try {
                    $table->dropForeign(['category_id']);
                } catch (\Throwable $e) {

                }
                $table->dropColumn('category_id');
            }
        });
    }
};

