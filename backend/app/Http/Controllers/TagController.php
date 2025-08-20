<?php
namespace App\Http\Controllers;

use App\Models\Tag;

class TagController extends Controller
{
    public function index()
    {
        return response()->json(Tag::orderBy('name')->get());
    }
}
