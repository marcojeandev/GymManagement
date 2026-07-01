<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MembershipPrice extends Model
{
    protected $table = 'membership_pricing';
    protected $fillable = [
        'price',
        'description'
    ];
}
