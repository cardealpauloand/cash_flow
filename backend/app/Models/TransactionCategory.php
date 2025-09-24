<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionCategory extends Model
{
    protected $table = 'transactions_category';
    public $timestamps = false;
    protected $fillable = ['transactions_sub_id', 'category_id', 'sub_category_id'];

    public function sub()
    {
        return $this->belongsTo(TransactionSub::class, 'transactions_sub_id');
    }
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class, 'sub_category_id');
    }
}
