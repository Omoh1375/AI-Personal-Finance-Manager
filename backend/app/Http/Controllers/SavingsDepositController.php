<?php

namespace App\Http\Controllers;

use App\Models\SavingsDeposit;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class SavingsDepositController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', SavingsDeposit::class);
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', SavingsDeposit::class);
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', SavingsDeposit::class);
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(SavingsDeposit $savingsDeposit)
    {
        $this->authorize('view', $savingsDeposit);
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SavingsDeposit $savingsDeposit)
    {
        $this->authorize('update', $savingsDeposit);
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SavingsDeposit $savingsDeposit)
    {
        $this->authorize('update', $savingsDeposit);
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SavingsDeposit $savingsDeposit)
    {
        $this->authorize('delete', $savingsDeposit);
        //
    }
}
