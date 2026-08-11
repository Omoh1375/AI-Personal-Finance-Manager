<?php

namespace App\Reports;

use App\Models\Expense;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CategorySpendingReport
{
    public function generate(
        string $from,
        string $to
    ): array {

        $userId = Auth::id();

        $categories = Expense::query()
            ->select(
                'category_id',
                DB::raw('SUM(amount) as total')
            )
            ->with('category:id,name')
            ->where('user_id', $userId)
            ->whereBetween('spent_at', [$from, $to])
            ->groupBy('category_id')
            ->orderByDesc('total')
            ->get();

        $grandTotal = $categories->sum('total');

        return $categories->map(function ($item) use ($grandTotal) {

            return [

                'category_id' => $item->category_id,

                'category' => $item->category?->name,

                'amount' => (float) $item->total,

                'percentage' => $grandTotal > 0
                    ? round(($item->total / $grandTotal) * 100, 2)
                    : 0,

            ];

        })->values()->toArray();
    }
}