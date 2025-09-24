<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $table = 'tags';
    public $timestamps = false;
    protected $fillable = ['name'];

    protected $casts = [
        'id' => 'int',
        'name' => 'string',
    ];
}
