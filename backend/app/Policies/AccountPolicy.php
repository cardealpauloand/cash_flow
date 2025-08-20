<?php
namespace App\Policies;

use App\Models\{User, Account};

class AccountPolicy
{
    public function view(User $user, Account $account): bool { return $account->user_id === $user->id; }
    public function update(User $user, Account $account): bool { return $account->user_id === $user->id; }
    public function delete(User $user, Account $account): bool { return $account->user_id === $user->id; }
}
