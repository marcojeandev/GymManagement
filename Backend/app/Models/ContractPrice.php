<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContractPrice extends Model
{
    protected $table = 'contract_pricing';
    protected $fillable = [
        'price',
        'description',
        'title'
    ];
}
