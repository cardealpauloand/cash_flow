<?php
namespace App\Http\Controllers;

use App\Models\SubCategory;

class SubCategoryController extends Controller
{
    public function index()
    {
        return response()->json(SubCategory::orderBy('name')->get());
    }
}
