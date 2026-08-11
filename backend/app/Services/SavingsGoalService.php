<?php

namespace App\Services;

use App\Models\SavingsGoal;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;

class SavingsGoalService
{
    public function index()
    {
        Gate::authorize('view-any', SavingsGoal::class);
        return SavingsGoal::with(['account', 'deposits'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(fn ($goal) => $this->format($goal));
    }

    public function show(SavingsGoal $goal)
    {
        Gate::authorize('view', $goal);

        return $this->format(
            $goal->load(['account', 'deposits'])
        );
    }

    public function store(array $data)
    {
        $data['user_id'] = Auth::id();

        $goal = SavingsGoal::create($data);

        return $this->format($goal);
    }

    public function delete(SavingsGoal $goal): void
    {
        // abort_if($goal->user_id !== Auth::id(), 403);
        Gate::authorize('delete', $goal);
        
    

        $goal->delete();
    }

    private function format(SavingsGoal $goal): array
    {
        $saved = $goal->deposits->sum('amount');

        $remaining = max(
            0,
            $goal->target_amount - $saved
        );

        $progress = $goal->target_amount > 0
            ? round(
                ($saved / $goal->target_amount) * 100,
                2
            )
            : 0;

        return [

            'id' => $goal->id,

            'name' => $goal->name,

            'target_amount' => (float) $goal->target_amount,

            'saved' => (float) $saved,

            'remaining' => (float) $remaining,

            'progress' => $progress,

            'status' => $this->status($progress),

            'target_date' => $goal->target_date,

            'description' => $goal->description,

            'account' => $goal->account?->name,

        ];
    }

    private function status(float $progress): string
    {
        return match (true) {
            $progress >= 100 => 'Completed',
            $progress >= 80 => 'Almost There',
            default => 'In Progress',
        };
    }
}