<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'accounts';
    public $timestamps = false;

    protected $fillable = ['user_id', 'name', 'type', 'opening_balance', 'created_at'];

    protected $casts = [
        'id' => 'int',
        'user_id' => 'int',
        'name' => 'string',
        'type' => 'string',
        'opening_balance' => 'decimal:2',
        'created_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'account_id');
    }
}
