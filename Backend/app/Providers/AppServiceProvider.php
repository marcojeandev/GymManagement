<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Contract;
use App\Policies\ContractPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }
    protected $policies = [
        Contract::class => ContractPolicy::class,
    ];  
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
