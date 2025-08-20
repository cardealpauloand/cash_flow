<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionInstallment extends Model
{
    protected $table = 'transactions_installments';
    public $timestamps = false;
    protected $fillable = ['value','transaction_id','transaction_type_id','account_id','user_id'];

    public function transaction(){ return $this->belongsTo(Transaction::class); }
    public function account(){ return $this->belongsTo(Account::class); }
    public function user(){ return $this->belongsTo(User::class); }
    public function subs(){ return $this->hasMany(TransactionSub::class,'transactions_installments_id'); }
    public function tags(){ return $this->hasMany(TransactionTag::class,'transactions_installments_id'); }
}