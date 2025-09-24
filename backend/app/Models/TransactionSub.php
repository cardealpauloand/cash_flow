<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionSub extends Model
{
    protected $table = 'transactions_sub';
    public $timestamps = false;
    protected $fillable = ['transactions_installments_id', 'value'];

    public function installment()
    {
        return $this->belongsTo(TransactionInstallment::class, 'transactions_installments_id');
    }
    public function categoryLink()
    {
        return $this->hasOne(TransactionCategory::class, 'transactions_sub_id');
    }
}
