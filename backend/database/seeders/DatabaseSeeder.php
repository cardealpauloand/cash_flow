<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            TransactionTypeSeeder::class,
            CategorySeeder::class,
            SubCategorySeeder::class,
            TagSeeder::class,
            DemoDataSeeder::class,
        ]);
    }
}

