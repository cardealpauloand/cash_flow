<?php
namespace App\Http\Controllers;

use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $withSubs = filter_var($request->query('with_subs', true), FILTER_VALIDATE_BOOLEAN);
        $q = Category::query()->orderBy('name');
        if ($withSubs) {
            $q->with([
                'subCategories' => function ($s) {
                    $s->orderBy('name');
                }
            ]);
        }
        return response()->json($q->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120|unique:category,name',
            'sub_categories' => 'array',
            'sub_categories.*.name' => 'required|string|max:120|distinct',
        ]);
        return DB::transaction(function () use ($data) {
            $cat = Category::create(['name' => $data['name']]);
            if (!empty($data['sub_categories'])) {
                foreach ($data['sub_categories'] as $scData) {
                    SubCategory::create(['name' => $scData['name'], 'category_id' => $cat->id]);
                }
            }
            return response()->json($cat->load('subCategories'), 201);
        });
    }

    public function show(Category $category)
    {
        $category->load([
            'subCategories' => function ($s) {
                $s->orderBy('name');
            }
        ]);
        return response()->json($category);
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:120|unique:category,name,' . $category->id,
            'sub_categories' => 'array', // full replacement list optional
            'sub_categories.*.id' => 'sometimes|integer|exists:sub_category,id',
            'sub_categories.*.name' => 'required_with:sub_categories|string|max:120|distinct',
        ]);
        return DB::transaction(function () use ($data, $category) {
            if (isset($data['name'])) {
                $category->update(['name' => $data['name']]);
            }
            if (array_key_exists('sub_categories', $data)) {
                // Strategy: send full desired list; create/update/delete to match
                $incoming = collect($data['sub_categories']);
                $existing = $category->subCategories()->get();
                // Update or create
                foreach ($incoming as $row) {
                    if (!empty($row['id'])) {
                        $sc = $existing->firstWhere('id', $row['id']);
                        if ($sc) {
                            $sc->update(['name' => $row['name']]);
                        }
                    } else {
                        SubCategory::create(['name' => $row['name'], 'category_id' => $category->id]);
                    }
                }
                // Delete removed
                $incomingIds = $incoming->pluck('id')->filter()->values()->all();
                foreach ($existing as $sc) {
                    if (!in_array($sc->id, $incomingIds)) {
                        $sc->delete();
                    }
                }
            }
            return response()->json($category->load('subCategories'));
        });
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(['deleted' => true]);
    }
}
