<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance';

    protected $fillable = [
        'members_id',
        'time_in',
        'time_out',
    ];

    protected $casts = [
        'time_in' => 'datetime',
        'time_out' => 'datetime',
    ];

    // Relationship to Member
    public function member()
    {
        return $this->belongsTo(Member::class, 'members_id');
    }

    // Check if member is currently clocked in (no time_out)
    public function scopeActive($query)
    {
        return $query->whereNull('time_out');
    }
}