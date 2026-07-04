<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\MembershipFee;

class MembershipPrice extends Model
{
    protected $table = 'membership_pricing';
    protected $fillable = [
        'price',
        'description'
    ];

    public function membershipFee()
    {
        return $this->hasMany(MembershipFee::class);
    }
}
