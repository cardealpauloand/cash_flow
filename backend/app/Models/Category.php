<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'category';
    public $timestamps = false;
    protected $fillable = ['name'];

    public function subCategories()
    {
        return $this->hasMany(SubCategory::class, 'category_id');
    }
}
