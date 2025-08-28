<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'category';
    public $timestamps = false;
    protected $fillable = ['name'];

    // Relationship: a category has many sub categories
    public function subCategories()
    {
        return $this->hasMany(SubCategory::class);
    }
}