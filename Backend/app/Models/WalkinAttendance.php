<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WalkinAttendance extends Model
{
    use HasFactory;

    protected $table = 'walk_in_attendance';

    protected $fillable = [
        'walk_in_id',
        'members_id',      // new
        'time_in',
        'fee_paid',
        'total_amount',
    ];

    protected $casts = [
        'time_in' => 'datetime',
        'fee_paid' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    // Relationship to WalkinInfo
    public function walkinInfo()
    {
        return $this->belongsTo(WalkinInfo::class, 'walk_in_id');
    }

    // Relationship to Member
    public function member()
    {
        return $this->belongsTo(Member::class, 'members_id');
    }

    // Accessor to get the person name (member or walk-in)
    public function getPersonNameAttribute()
    {
        if ($this->members_id) {
            return $this->member ? $this->member->full_name : 'Unknown Member';
        }
        return $this->walkinInfo ? $this->walkinInfo->full_name : 'Unknown Walk-in';
    }
}