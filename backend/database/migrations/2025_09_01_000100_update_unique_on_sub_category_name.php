<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('sub_category')) {
            return;
        }


        if (!Schema::hasColumn('sub_category', 'category_id')) {
            return;
        }

        if (DB::getDriverName() === 'sqlite') {

            Schema::rename('sub_category', 'sub_category_old_uniqfix');
            Schema::create('sub_category', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('name', 120);
                $table->unsignedBigInteger('category_id')->nullable();
                $table->foreign('category_id')->references('id')->on('category')->onDelete('cascade');
                $table->unique(['category_id', 'name'], 'uk_sub_category_cat_name');
            });
            DB::statement('INSERT INTO sub_category (id, name, category_id) SELECT id, name, category_id FROM sub_category_old_uniqfix');
            Schema::drop('sub_category_old_uniqfix');
        } else {
            Schema::table('sub_category', function (Blueprint $table) {

                try {
                    $table->dropUnique('uk_sub_category_name');
                } catch (\Throwable $e) {

                }
                try {
                    $table->dropUnique(['name']);
                } catch (\Throwable $e) {

                }

                $table->unique(['category_id', 'name'], 'uk_sub_category_cat_name');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('sub_category')) {
            return;
        }

        if (DB::getDriverName() === 'sqlite') {
            Schema::rename('sub_category', 'sub_category_old_uniqfix');
            Schema::create('sub_category', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('name', 120);
                $table->unsignedBigInteger('category_id')->nullable();
                $table->foreign('category_id')->references('id')->on('category')->onDelete('cascade');
                $table->unique('name', 'uk_sub_category_name');
            });
            DB::statement('INSERT INTO sub_category (id, name, category_id) SELECT id, name, category_id FROM sub_category_old_uniqfix');
            Schema::drop('sub_category_old_uniqfix');
        } else {
            Schema::table('sub_category', function (Blueprint $table) {
                try {
                    $table->dropUnique('uk_sub_category_cat_name');
                } catch (\Throwable $e) {

                }
                $table->unique('name', 'uk_sub_category_name');
            });
        }
    }
};
