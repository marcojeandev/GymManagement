<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GymSetting extends Model
{
    protected $table = 'system_settings';

    protected $fillable = [
        'gym_name',
        'logo',
        'description',
        'location',
        'email',
        'contact',
        'social_links',
        'gallery',
        'features',
        'pricing',
        'favicon',
        'primary_color',
        'secondary_color',
    ];

    protected $casts = [
        'social_links' => 'array',
        'gallery' => 'array',
        'features' => 'array',
        'pricing' => 'array',
    ];
}