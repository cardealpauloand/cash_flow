<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransactionInstallment extends Model
{
    protected $table = 'transactions_installments';
    public $timestamps = false;
    protected $fillable = ['value','transaction_id','transaction_type_id','account_id','user_id'];

    protected $casts = [
        'id' => 'int',
        'value' => 'decimal:2',
        'transaction_id' => 'int',
        'transaction_type_id' => 'int',
        'account_id' => 'int',
        'user_id' => 'int',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subs(): HasMany
    {
        return $this->hasMany(TransactionSub::class,'transactions_installments_id');
    }

    public function tags(): HasMany
    {
        return $this->hasMany(TransactionTag::class,'transactions_installments_id');
    }
}
