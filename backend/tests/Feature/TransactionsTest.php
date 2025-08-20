<?php
use App\Models\{User, Account};

it('creates income, expense and transfer', function(){
    (new \Database\Seeders\TransactionTypeSeeder())->run();
    $user = User::factory()->create();
    $token = auth('api')->login($user);
    $accA = Account::factory()->create(['user_id'=>$user->id,'type'=>'corrente']);
    $accB = Account::factory()->create(['user_id'=>$user->id,'type'=>'carteira']);

    $resp = $this->withHeader('Authorization','Bearer '.$token)
        ->postJson('/api/transactions',[ 'transaction_type'=>'income','value'=>100,'date'=>now()->toDateString(),'account_id'=>$accA->id ]);
    if ($resp->status()!==201) dump(['income_response'=>$resp->json(),'status'=>$resp->status()]);
    $resp->assertCreated();

    $this->withHeader('Authorization','Bearer '.$token)
        ->postJson('/api/transactions',[ 'transaction_type'=>'expense','value'=>50,'date'=>now()->toDateString(),'account_id'=>$accA->id ])
        ->assertCreated();

    $this->withHeader('Authorization','Bearer '.$token)
        ->postJson('/api/transactions',[ 'transaction_type'=>'transfer','value'=>25,'date'=>now()->toDateString(),'account_id'=>$accA->id,'account_out_id'=>$accB->id ])
        ->assertCreated();
});
