<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable, HasFactory;

    protected $table = 'users';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password_hash',
        'created_at'
    ];

    protected $hidden = ['password_hash'];

    protected $casts = [
        'id' => 'int',
        'name' => 'string',
        'email' => 'string',
        'password_hash' => 'string',
        'created_at' => 'datetime',
    ];

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }


    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [];
    }
}
