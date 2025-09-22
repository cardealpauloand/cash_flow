<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('transactions_category')) return;

        if (DB::getDriverName() === 'sqlite') {
            if (Schema::hasTable('transactions_category_new_fkfix')) {
                Schema::drop('transactions_category_new_fkfix');
            }
            // Rebuild table to correct FK target for sub_category_id
            Schema::create('transactions_category_new_fkfix', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->unsignedBigInteger('transactions_sub_id');
                $table->unsignedBigInteger('category_id');
                $table->unsignedBigInteger('sub_category_id')->nullable();

                $table->foreign('transactions_sub_id')->references('id')->on('transactions_sub')->onDelete('cascade');
                $table->foreign('category_id')->references('id')->on('category')->onDelete('restrict');
                // IMPORTANT: ensure we reference the correct live table 'sub_category'
                $table->foreign('sub_category_id')->references('id')->on('sub_category')->onDelete('restrict');

                // Use implicit index name to avoid conflict while old table still exists
                $table->unique('transactions_sub_id');
            });

            // Copy rows, nulling any sub_category_id that does not exist in the new sub_category table
            DB::statement('INSERT INTO transactions_category_new_fkfix (id, transactions_sub_id, category_id, sub_category_id)
                SELECT tc.id, tc.transactions_sub_id, tc.category_id,
                       CASE WHEN sc.id IS NULL THEN NULL ELSE tc.sub_category_id END as sub_category_id
                FROM transactions_category tc
                LEFT JOIN sub_category sc ON sc.id = tc.sub_category_id');

            Schema::drop('transactions_category');
            Schema::rename('transactions_category_new_fkfix', 'transactions_category');
        } else {
            Schema::table('transactions_category', function (Blueprint $table) {
                try { $table->dropForeign(['sub_category_id']); } catch (\Throwable $e) {}
                $table->foreign('sub_category_id')->references('id')->on('sub_category')->onDelete('restrict');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('transactions_category')) return;
        if (DB::getDriverName() === 'sqlite') {
            // Attempt to revert FK to sub_category_old if it exists (best-effort)
            if (!Schema::hasTable('sub_category_old')) return; // nothing to do
            Schema::create('transactions_category_old_fkfix', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->unsignedBigInteger('transactions_sub_id');
                $table->unsignedBigInteger('category_id');
                $table->unsignedBigInteger('sub_category_id')->nullable();

                $table->foreign('transactions_sub_id')->references('id')->on('transactions_sub')->onDelete('cascade');
                $table->foreign('category_id')->references('id')->on('category')->onDelete('restrict');
                $table->foreign('sub_category_id')->references('id')->on('sub_category_old')->onDelete('restrict');

                $table->unique('transactions_sub_id');
            });
            DB::statement('INSERT INTO transactions_category_old_fkfix (id, transactions_sub_id, category_id, sub_category_id) SELECT id, transactions_sub_id, category_id, sub_category_id FROM transactions_category');
            Schema::drop('transactions_category');
            Schema::rename('transactions_category_old_fkfix', 'transactions_category');
        } else {
            if (Schema::hasTable('sub_category_old')) {
                Schema::table('transactions_category', function (Blueprint $table) {
                    try { $table->dropForeign(['sub_category_id']); } catch (\Throwable $e) {}
                    $table->foreign('sub_category_id')->references('id')->on('sub_category_old')->onDelete('restrict');
                });
            }
        }
    }
};
