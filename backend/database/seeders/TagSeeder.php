<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tag')->insertOrIgnore([
            ['name' => 'fixo'],
            ['name' => 'variável'],
            ['name' => 'cartão'],
        ]);
    }
}
