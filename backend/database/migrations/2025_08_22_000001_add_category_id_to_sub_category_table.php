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
        if (Schema::hasColumn('sub_category', 'category_id')) {
            return;
        }

        if (DB::getDriverName() === 'sqlite') {
            Schema::rename('sub_category', 'sub_category_old');
            Schema::create('sub_category', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('name', 120)->unique('uk_sub_category_name');
                $table->unsignedBigInteger('category_id')->nullable();
                $table->foreign('category_id')->references('id')->on('category')->onDelete('cascade');
                // Sem índice extra nomeado para evitar conflitos em SQLite
            });
            DB::statement('INSERT INTO sub_category (id, name) SELECT id, name FROM sub_category_old');
            Schema::drop('sub_category_old');
        } else {
            Schema::table('sub_category', function (Blueprint $table) {
                $table->unsignedBigInteger('category_id')->nullable()->after('id');
                $table->foreign('category_id')->references('id')->on('category')->onDelete('cascade');
                $table->index('category_id', 'idx_sub_category_category_id');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('sub_category')) {
            return;
        }
        if (!Schema::hasColumn('sub_category', 'category_id')) {
            return;
        }

        if (DB::getDriverName() === 'sqlite') {
            Schema::rename('sub_category', 'sub_category_old');
            Schema::create('sub_category', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('name', 120)->unique('uk_sub_category_name');
            });
            DB::statement('INSERT INTO sub_category (id, name) SELECT id, name FROM sub_category_old');
            Schema::drop('sub_category_old');
        } else {
            Schema::table('sub_category', function (Blueprint $table) {
                $table->dropForeign(['category_id']);
                $table->dropIndex('idx_sub_category_category_id');
                $table->dropColumn('category_id');
            });
        }
    }
};
