<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionTag extends Model
{
    protected $table = 'transactions_tag';
    public $timestamps = false;
    protected $fillable = ['transactions_installments_id','tag_id'];

    protected $casts = [
        'id' => 'int',
        'transactions_installments_id' => 'int',
        'tag_id' => 'int',
    ];

    public function installment(): BelongsTo
    {
        return $this->belongsTo(TransactionInstallment::class,'transactions_installments_id');
    }

    public function tag(): BelongsTo
    {
        return $this->belongsTo(Tag::class);
    }
}
