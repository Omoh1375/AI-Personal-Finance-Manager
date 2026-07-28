<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class CategoryService
{
    public function index(): Collection
    {
        return Category::orderBy('name')->get();
    }

    public function store(array $data): Category
    {
        $data['user_id'] = Auth::id();

        return Category::create($data);
    }

    public function update(Category $category, array $data): Category
    {
        $category->update($data);

        return $category;
    }

    public function delete(Category $category): void
    {
        if ($category->is_default) {
            abort(403, 'Default categories cannot be deleted.');
        }

        $category->delete();
    }
}