<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionCategory extends Model
{
    protected $table = 'transactions_category';
    public $timestamps = false;
    protected $fillable = ['transactions_sub_id','category_id','sub_category_id'];

    protected $casts = [
        'id' => 'int',
        'transactions_sub_id' => 'int',
        'category_id' => 'int',
        'sub_category_id' => 'int',
    ];

    public function sub(): BelongsTo
    {
        return $this->belongsTo(TransactionSub::class,'transactions_sub_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(SubCategory::class,'sub_category_id');
    }
}
