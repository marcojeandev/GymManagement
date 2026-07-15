<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
{
    protected $table = 'contract';

    protected $fillable = [
        'members_id',
        'contract_id',
        'contract_from',
        'contract_to',
        'payment_type',
        'payment_amount',
        'total_amount',
        'or_number',
        'transaction_id',
        'payment_status',
        'paid_at',
    ];

    protected $casts = [
        'payment_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'contract_from' => 'date',
        'contract_to' => 'date',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'members_id');
    }

    public function contractPricing(): BelongsTo
    {
        return $this->belongsTo(ContractPrice::class, 'contract_id');
    }

    // Optional computed attribute for frontend status (active/expired)
    public function getStatusAttribute(): string
    {
        if (!$this->contract_to) return 'expired';
        return $this->contract_to->isPast() ? 'expired' : 'active';
    }
}