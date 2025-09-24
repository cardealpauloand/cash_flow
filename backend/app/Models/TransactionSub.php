<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TransactionSub extends Model
{
    protected $table = 'transactions_sub';
    public $timestamps = false;
    protected $fillable = ['transactions_installments_id','value'];

    protected $casts = [
        'id' => 'int',
        'transactions_installments_id' => 'int',
        'value' => 'decimal:2',
    ];

    public function installment(): BelongsTo
    {
        return $this->belongsTo(TransactionInstallment::class,'transactions_installments_id');
    }

    public function categoryLink(): HasOne
    {
        return $this->hasOne(TransactionCategory::class,'transactions_sub_id');
    }
}
