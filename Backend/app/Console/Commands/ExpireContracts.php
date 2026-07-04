<?php

namespace App\Console\Commands;

use App\Models\Contract;
use Illuminate\Console\Command;

class ExpireContracts extends Command
{
    protected $signature = 'contracts:expire';
    protected $description = 'Set member contract_status to expired if contract_to < today';

    public function handle()
    {
        $expired = Contract::whereDate('contract_to', '<', now()->toDateString())
            ->whereHas('member', fn($q) => $q->where('contract_status', 'active'))
            ->get();

        $count = 0;
        foreach ($expired as $contract) {
            $contract->member->update(['contract_status' => 'expired']);
            $count++;
        }

        $this->info("Expired {$count} members.");
        return Command::SUCCESS;
    }
}