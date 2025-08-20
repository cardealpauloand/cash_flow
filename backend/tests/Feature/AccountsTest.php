<?php
use App\Models\User;

it('creates and lists accounts', function(){
    $user = User::factory()->create();
    $token = auth('api')->login($user);

    $this->withHeader('Authorization','Bearer '.$token)
        ->postJson('/api/accounts',[ 'name'=>'Minha Conta','type'=>'corrente','opening_balance'=>100 ])
        ->assertCreated();

    $this->withHeader('Authorization','Bearer '.$token)
        ->getJson('/api/accounts')
        ->assertOk()->assertJsonStructure([['id','name','type']]);
});
