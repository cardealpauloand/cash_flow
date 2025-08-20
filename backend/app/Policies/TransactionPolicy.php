<?php
namespace App\Policies;

use App\Models\{User, Transaction};

class TransactionPolicy
{
    public function view(User $user, Transaction $transaction): bool { return $transaction->user_id === $user->id; }
    public function delete(User $user, Transaction $transaction): bool { return $transaction->user_id === $user->id; }
}
