<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransactionTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('transactions_type')->insertOrIgnore([
            ['id'=>1,'name'=>'income'],
            ['id'=>2,'name'=>'expense'],
            ['id'=>3,'name'=>'transfer'],
        ]);
    }
}
