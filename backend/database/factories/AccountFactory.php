<?php
namespace Database\Factories;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccountFactory extends Factory
{
    protected $model = Account::class;
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->word().' Account',
            'type' => $this->faker->randomElement(['corrente','poupanca','carteira','cartao']),
            'opening_balance' => $this->faker->randomFloat(2,0,1000),
            'created_at' => now(),
        ];
    }
}
