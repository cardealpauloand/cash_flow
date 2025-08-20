<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubCategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('sub_category')->insertOrIgnore([
            ['name' => 'Restaurante'],
            ['name' => 'Supermercado'],
            ['name' => 'Combustível'],
        ]);
    }
}
