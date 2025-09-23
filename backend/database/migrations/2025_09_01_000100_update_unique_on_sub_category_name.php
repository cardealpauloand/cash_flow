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
            // On non-SQLite (e.g., Postgres), avoid issuing invalid drops inside a transaction.
            // Detect existing constraint names and only drop when present.
            if (DB::getDriverName() === 'pgsql') {
                $hasUk = DB::selectOne(
                    "select 1 from pg_constraint c join pg_class t on t.oid = c.conrelid join pg_namespace n on n.oid = t.relnamespace where c.contype = 'u' and t.relname = ? and c.conname = ? limit 1",
                    ['sub_category', 'uk_sub_category_name']
                );

                if ($hasUk) {
                    Schema::table('sub_category', function (Blueprint $table) {
                        $table->dropUnique('uk_sub_category_name');
                    });
                }

                $hasDefault = DB::selectOne(
                    "select 1 from pg_constraint c join pg_class t on t.oid = c.conrelid join pg_namespace n on n.oid = t.relnamespace where c.contype = 'u' and t.relname = ? and c.conname = ? limit 1",
                    ['sub_category', 'sub_category_name_unique']
                );

                if ($hasDefault) {
                    Schema::table('sub_category', function (Blueprint $table) {
                        $table->dropUnique(['name']);
                    });
                }
            } else {
                // Fallback for other drivers: attempt drops in isolation, catching errors.
                try {
                    Schema::table('sub_category', function (Blueprint $table) {
                        $table->dropUnique('uk_sub_category_name');
                    });
                } catch (\Throwable $e) {
                }

                try {
                    Schema::table('sub_category', function (Blueprint $table) {
                        $table->dropUnique(['name']);
                    });
                } catch (\Throwable $e) {
                }
            }

            Schema::table('sub_category', function (Blueprint $table) {
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
            if (DB::getDriverName() === 'pgsql') {
                $hasComposite = DB::selectOne(
                    "select 1 from pg_constraint c join pg_class t on t.oid = c.conrelid join pg_namespace n on n.oid = t.relnamespace where c.contype = 'u' and t.relname = ? and c.conname = ? limit 1",
                    ['sub_category', 'uk_sub_category_cat_name']
                );

                if ($hasComposite) {
                    Schema::table('sub_category', function (Blueprint $table) {
                        $table->dropUnique('uk_sub_category_cat_name');
                    });
                }
            } else {
                try {
                    Schema::table('sub_category', function (Blueprint $table) {
                        $table->dropUnique('uk_sub_category_cat_name');
                    });
                } catch (\Throwable $e) {
                }
            }

            Schema::table('sub_category', function (Blueprint $table) {
                $table->unique('name', 'uk_sub_category_name');
            });
        }
    }
};
