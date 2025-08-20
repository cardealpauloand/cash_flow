<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $userId = DB::table('users')->insertGetId([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'password_hash' => Hash::make('secret123'),
            'created_at' => now(),
        ]);
        $acc1 = DB::table('accounts')->insertGetId([
            'user_id' => $userId,
            'name' => 'Carteira',
            'type' => 'carteira',
            'opening_balance' => 100,
            'created_at' => now(),
        ]);
        $acc2 = DB::table('accounts')->insertGetId([
            'user_id' => $userId,
            'name' => 'Banco Corrente',
            'type' => 'corrente',
            'opening_balance' => 1000,
            'created_at' => now(),
        ]);

        $txId = DB::table('transactions')->insertGetId([
            'value'=>3000,'transaction_type_id'=>1,'date'=>now()->toDateString(),'account_id'=>$acc2,'user_id'=>$userId,'notes'=>'Salário','created_at'=>now()
        ]);
        $instId = DB::table('transactions_installments')->insertGetId([
            'value'=>3000,'transaction_id'=>$txId,'transaction_type_id'=>1,'account_id'=>$acc2,'user_id'=>$userId
        ]);
        $subId = DB::table('transactions_sub')->insertGetId([
            'transactions_installments_id'=>$instId,'value'=>3000
        ]);
        DB::table('transactions_category')->insert([
            'transactions_sub_id'=>$subId,'category_id'=>1
        ]);

        $txT = DB::table('transactions')->insertGetId([
            'value'=>200,'transaction_type_id'=>3,'date'=>now()->toDateString(),'account_id'=>$acc2,'account_out_id'=>$acc1,'user_id'=>$userId,'notes'=>'Transfer demo','created_at'=>now()
        ]);
        DB::table('transactions_installments')->insert([
            ['value'=>200,'transaction_id'=>$txT,'transaction_type_id'=>1,'account_id'=>$acc2,'user_id'=>$userId],
            ['value'=>200,'transaction_id'=>$txT,'transaction_type_id'=>2,'account_id'=>$acc1,'user_id'=>$userId],
        ]);
    }
}
