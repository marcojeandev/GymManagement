<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Member;
use App\Models\MembershipPrice;

class MembershipFee extends Model
{
    use HasFactory;

    protected $table = 'membership_fee';

    protected $fillable = [
        'members_id',
        'membership_id',
        'payment_type',
        'payment_amount',
        'or_number',
        'transaction_id',
        'payment_status',
        'paid_at',
    ];

    protected $casts = [
        'payment_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'payment_status' => 'string',
        'payment_type' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $dates = [
        'paid_at',
        'created_at',
        'updated_at',
    ];
    // ================== RELATIONSHIPS ==================

    public function member()
    {
        return $this->belongsTo(Member::class, 'members_id');
    }

    public function membershipPricing()
    {
        return $this->belongsTo(MembershipPrice::class, 'membership_id');
    }


}