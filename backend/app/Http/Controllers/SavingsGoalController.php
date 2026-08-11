<?php

namespace App\Http\Controllers;

use App\Models\SavingsGoal;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class SavingsGoalController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', SavingsGoal::class);
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', SavingsGoal::class);
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', SavingsGoal::class);
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(SavingsGoal $savingsGoal)
    {
        $this->authorize('view', $savingsGoal);
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SavingsGoal $savingsGoal)
    {
        $this->authorize('update', $savingsGoal);
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SavingsGoal $savingsGoal)
    {
        $this->authorize('update', $savingsGoal);
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SavingsGoal $savingsGoal)
    {
        $this->authorize('delete', $savingsGoal);
        //
    }
}
