<?php
it('registers and logs in', function(){
    $res = $this->postJson('/api/auth/register', [
        'name' => 'Test', 'email' => 't@example.com','password' => 'secret123'
    ])->assertCreated();

    $this->postJson('/api/auth/login', [
        'email' => 't@example.com','password' => 'secret123'
    ])->assertOk()->assertJsonStructure(['token','user']);
});
