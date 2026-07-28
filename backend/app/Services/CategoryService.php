<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class CategoryService
{
    public function index()
    {
        return Category::where('is_default', true)
            ->orWhere('user_id', auth()->id())
            ->orderBy('type')
            ->orderBy('name')
            ->get();
    }

    public function store(array $data): Category
    {
        $data['user_id'] = Auth::id();

        return Category::create($data);
    }

        public function update(Category $category, array $data): Category
    {
        $this->authorizeCategory($category);

        if ($category->is_default) {
            abort(403, 'Default categories cannot be modified.');
        }

        $category->update($data);

        return $category;
    }

        public function delete(Category $category): void
    {
        $this->authorizeCategory($category);

        if ($category->is_default) {
            abort(403, 'Default categories cannot be deleted.');
        }

        $category->delete();
    }

        private function authorizeCategory(Category $category): void
    {
        if (
            !$category->is_default &&
            $category->user_id !== auth()->id()
        ) {
            abort(403, 'Unauthorized action.');
        }
    }
}