<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [

            // Expense Categories
            [
                'name' => 'Food',
                'type' => 'expense',
                'icon' => 'utensils',
                'color' => '#EF4444',
                'is_default' => true,
            ],
            [
                'name' => 'Transport',
                'type' => 'expense',
                'icon' => 'car',
                'color' => '#3B82F6',
                'is_default' => true,
            ],
            [
                'name' => 'Rent',
                'type' => 'expense',
                'icon' => 'home',
                'color' => '#F59E0B',
                'is_default' => true,
            ],
            [
                'name' => 'Utilities',
                'type' => 'expense',
                'icon' => 'bolt',
                'color' => '#8B5CF6',
                'is_default' => true,
            ],
            [
                'name' => 'Entertainment',
                'type' => 'expense',
                'icon' => 'film',
                'color' => '#EC4899',
                'is_default' => true,
            ],
            [
                'name' => 'Healthcare',
                'type' => 'expense',
                'icon' => 'heart',
                'color' => '#10B981',
                'is_default' => true,
            ],
            [
                'name' => 'Shopping',
                'type' => 'expense',
                'icon' => 'shopping-bag',
                'color' => '#6366F1',
                'is_default' => true,
            ],

            // Income Categories
            [
                'name' => 'Salary',
                'type' => 'income',
                'icon' => 'briefcase',
                'color' => '#22C55E',
                'is_default' => true,
            ],
            [
                'name' => 'Freelance',
                'type' => 'income',
                'icon' => 'laptop',
                'color' => '#14B8A6',
                'is_default' => true,
            ],
            [
                'name' => 'Business',
                'type' => 'income',
                'icon' => 'building',
                'color' => '#F97316',
                'is_default' => true,
            ],
            [
                'name' => 'Investment',
                'type' => 'income',
                'icon' => 'chart-line',
                'color' => '#84CC16',
                'is_default' => true,
            ],
            [
                'name' => 'Gift',
                'type' => 'income',
                'icon' => 'gift',
                'color' => '#06B6D4',
                'is_default' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                [
                    'name' => $category['name'],
                    'type' => $category['type'],
                ],
                $category
            );
        }
    }
}