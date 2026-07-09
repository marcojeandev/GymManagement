<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\MembershipFee;
use App\Models\Contract; 
use App\Models\WalkinAttendance; 

class Member extends Model
{
    use HasFactory;

    protected $table = 'members';

    protected $fillable = [
        'firstname',
        'middlename',
        'lastname',
        'suffix',
        'email',
        'contact',
        'address',
        'qr_code',
        'profile',
        'sex',
        'membership_status',
        'contract_status',
    ];

    protected $casts = [
        'sex' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ================== RELATIONSHIPS ==================

    public function membershipFee()
    {
        return $this->hasOne(MembershipFee::class, 'members_id');
    }

    // Contract relationships
    public function contracts()
    {
        return $this->hasMany(Contract::class, 'members_id');
    }

    // Get the current active contract (where contract_to >= today)
    public function activeContract()
    {
        return $this->hasOne(Contract::class, 'members_id')
            ->where('contract_to', '>=', now()->toDateString())
            ->orderBy('contract_to', 'desc');
    }

    // Get the latest contract (active or expired)
    public function latestContract()
    {
        return $this->hasOne(Contract::class, 'members_id')
            ->orderBy('contract_to', 'desc');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'members_id');
    }

    public function walkin_attendances()
    {
        return $this->hasMany(WalkinAttendance::class, 'members_id');
    }

    // Check if member can clock in
    public function canClockIn(): bool
    {
        return $this->membership_status === 'active' && $this->contract_status === 'active';
    }
}