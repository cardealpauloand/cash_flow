<?php
namespace App\Http\Controllers;

use App\Models\SubCategory;
use Illuminate\Http\Request;

class SubCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categoryId = $request->query('category_id');
        $q = SubCategory::query()->orderBy('name');
        if ($categoryId) {
            $q->where('category_id', $categoryId);
        }
        return response()->json($q->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120|unique:sub_category,name',
            'category_id' => 'required|integer|exists:category,id'
        ]);
        $sub = SubCategory::create($data);
        return response()->json($sub, 201);
    }

    public function show(SubCategory $subCategory)
    {
        return response()->json($subCategory);
    }

    public function update(Request $request, SubCategory $subCategory)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:120|unique:sub_category,name,' . $subCategory->id,
            'category_id' => 'sometimes|required|integer|exists:category,id'
        ]);
        $subCategory->update($data);
        return response()->json($subCategory);
    }

    public function destroy(SubCategory $subCategory)
    {
        $subCategory->delete();
        return response()->json(['deleted' => true]);
    }
}
