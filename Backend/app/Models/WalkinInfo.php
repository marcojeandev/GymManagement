<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WalkinInfo extends Model
{
    use HasFactory;

    protected $table = 'walk_in_info';

    protected $fillable = [
        'firstname',
        'middlename',
        'lastname',
        'suffix',
        'email',
        'contact',
        'total_visits',
    ];

    protected $casts = [
        'total_visits' => 'integer',
    ];

    // Accessor for full name
    public function getFullNameAttribute(): string
    {
        return trim(implode(' ', [
            $this->firstname,
            $this->middlename,
            $this->lastname,
            $this->suffix,
        ]));
    }
}