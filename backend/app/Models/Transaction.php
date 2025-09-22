<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
        'date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id');
    }
    public function accountOut()
    {
        return $this->belongsTo(Account::class, 'account_out_id');
    }
    public function type()
    {
        return $this->belongsTo(TransactionType::class, 'transaction_type_id');
    }
    public function installments()
    {
        return $this->hasMany(TransactionInstallment::class);
    }
}
