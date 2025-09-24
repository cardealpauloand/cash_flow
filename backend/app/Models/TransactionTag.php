<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionTag extends Model
{
    protected $table = 'transactions_tag';
    public $timestamps = false;
    protected $fillable = ['transactions_installments_id', 'tag_id'];

    public function installment()
    {
        return $this->belongsTo(TransactionInstallment::class, 'transactions_installments_id');
    }
    public function tag()
    {
        return $this->belongsTo(Tag::class);
    }
}
