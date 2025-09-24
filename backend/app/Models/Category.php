<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $table = 'category';
    public $timestamps = false;
    protected $fillable = ['name'];

    protected $casts = [
        'id' => 'int',
        'name' => 'string',
    ];

    public function subCategories(): HasMany
    {
        return $this->hasMany(SubCategory::class, 'category_id');
    }

    public function transactionCategories(): HasMany
    {
        return $this->hasMany(TransactionCategory::class, 'category_id');
    }
}
