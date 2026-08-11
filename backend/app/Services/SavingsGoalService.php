<?php

namespace App\Services;

use App\Models\SavingsGoal;

class SavingsGoalService
{
    public function index()
    {
        return SavingsGoal::with(['account', 'deposits'])
            ->where('user_id', auth()->id())
            ->latest()
            ->get()
            ->map(fn ($goal) => $this->format($goal));
    }

    public function show(SavingsGoal $goal)
    {
        abort_if($goal->user_id !== auth()->id(), 403);

        return $this->format(
            $goal->load(['account', 'deposits'])
        );
    }

    public function store(array $data)
    {
        $data['user_id'] = auth()->user()?->id;

        $goal = SavingsGoal::create($data);

        return $this->format($goal);
    }

    public function delete(SavingsGoal $goal): void
    {
        abort_if($goal->user_id !== auth()->user()?->id, 403);

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