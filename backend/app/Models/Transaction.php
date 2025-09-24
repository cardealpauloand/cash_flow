<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'transactions';
    public $timestamps = false;

    protected $fillable = [
        'value',
        'transaction_type_id',
        'date',
        'account_id',
        'account_out_id',
        'user_id',
        'notes',
        'transfer_group',
        'created_at'
    ];

    protected $casts = [
        'id' => 'int',
        'value' => 'decimal:2',
        'transaction_type_id' => 'int',
        'date' => 'date',
        'account_id' => 'int',
        'account_out_id' => 'int',
        'user_id' => 'int',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function accountOut(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_out_id');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(TransactionType::class, 'transaction_type_id');
    }

    public function installments(): HasMany
    {
        return $this->hasMany(TransactionInstallment::class);
    }
}
