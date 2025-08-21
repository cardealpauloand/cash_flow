<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes; // added

class Account extends Model
{
    use HasFactory;
    use SoftDeletes; // enable soft delete

    protected $table = 'accounts';
    public $timestamps = false; // created_at apenas

    protected $fillable = ['user_id', 'name', 'type', 'opening_balance', 'created_at'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'account_id');
    }
}
