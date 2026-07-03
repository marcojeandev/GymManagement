<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\MembershipFee;

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
        'contract_status'
    ];

    protected $casts = [
        'sex' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function membershipFee()
    {
        return $this->hasOne(MembershipFee::class, 'members_id');
    }
}