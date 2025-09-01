<?php
namespace App\Http\Controllers;

use App\Models\SubCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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
        $categoryId = $request->input('category_id');
        $data = $request->validate([
            'name' => [
                'required', 'string', 'max:120',
                Rule::unique('sub_category')->where(fn ($q) => $q->where('category_id', $categoryId)),
            ],
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
        $newCategoryId = $request->input('category_id', $subCategory->category_id);
        $data = $request->validate([
            'name' => [
                'sometimes', 'required', 'string', 'max:120',
                Rule::unique('sub_category')
                    ->ignore($subCategory->id)
                    ->where(fn ($q) => $q->where('category_id', $newCategoryId)),
            ],
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
