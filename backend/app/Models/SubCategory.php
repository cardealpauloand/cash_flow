<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubCategory extends Model
{
    protected $table = 'sub_category';
    public $timestamps = false;
    protected $fillable = ['name', 'category_id'];

    protected $casts = [
        'id' => 'int',
        'name' => 'string',
        'category_id' => 'int',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function transactionCategories(): HasMany
    {
        return $this->hasMany(TransactionCategory::class, 'sub_category_id');
    }
}
