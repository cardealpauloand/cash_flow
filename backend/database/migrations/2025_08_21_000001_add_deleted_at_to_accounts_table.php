<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDeletedAtToAccountsTable extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            if (!Schema::hasColumn('accounts', 'deleted_at')) {
                $table->timestamp('deleted_at')->nullable()->after('created_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            if (Schema::hasColumn('accounts', 'deleted_at')) {
                $table->dropColumn('deleted_at');
            }
        });
    }
}
return new AddDeletedAtToAccountsTable();
