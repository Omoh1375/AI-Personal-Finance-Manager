<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use App\Traits\ApiResponse;

class CategoryController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CategoryService $categoryService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection(
                $this->categoryService->index()
            ),
        ]);
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->store(
            $request->validated()
        );

                return $this->success(
                new CategoryResource($category),
                'Category created successfully.',
                201
            );
    }

    public function show(Category $category): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new CategoryResource($category),
        ]);
    }

    public function update(CategoryRequest $request, Category $category): JsonResponse
    {
        $category = $this->categoryService->update(
            $category,
            $request->validated()
        );

            return $this->success(
            new CategoryResource($category),
            'Category updated successfully.',
            200
        );
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->categoryService->delete($category);

        return $this->success(
            null,
            'Category deleted successfully.',
            200
        );
      
    }
}