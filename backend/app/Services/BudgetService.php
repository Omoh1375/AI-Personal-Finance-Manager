<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;

class BudgetService
{
    use AuthorizesRequests;
    public function index()
    {
        return Budget::with('category')
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(fn ($budget) => $this->formatBudget($budget));
    }

    public function store(array $data)
    {
        $category = Category::where('id', $data['category_id'])
            ->where(function ($query) {
                $query->where('is_default', true)
                      ->orWhere('user_id', Auth::id());
            })
            ->firstOrFail();

        $data['user_id'] = Auth::id();

        $budget = Budget::create($data);

        return $this->formatBudget($budget->load('category'));
    }

    public function show(Budget $budget)
    {
        $this->authorize('view', $budget);

        return $this->formatBudget(
            $budget->load('category')
        );
    }

    public function destroy(Budget $budget): void
    {
        $this->authorize('delete', $budget);

        $budget->delete();
    }

    private function formatBudget(Budget $budget): array
    {
        $spent = Expense::where('user_id', Auth::id())
            ->where('category_id', $budget->category_id)
            ->whereBetween('spent_at', [
                Carbon::parse($budget->start_date)->startOfDay(),
                Carbon::parse($budget->end_date)->endOfDay(),
            ])
            ->sum('amount');

        $remaining = max(0, $budget->amount - $spent);

        $progress = $budget->amount > 0
            ? round(($spent / $budget->amount) * 100, 2)
            : 0;

        return [

            'id' => $budget->id,

            'category' => $budget->category->name,

            'budget' => (float) $budget->amount,

            'spent' => (float) $spent,

            'remaining' => (float) $remaining,

            'progress' => $progress,

            'status' => $this->status($progress),

            'start_date' => $budget->start_date,

            'end_date' => $budget->end_date,

            'is_active' => $budget->is_active,

        ];
    }

    private function status(float $progress): string
    {
        return match (true) {
            $progress >= 100 => 'Exceeded',
            $progress >= 80 => 'Near Limit',
            default => 'On Track',
        };
    }
}