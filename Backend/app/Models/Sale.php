<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'paid_by',
        'payment_type',
        'or_number',
        'transaction_id',
        'payment_status',
        'payment_amount', // customer's tendered amount
    ];

    protected $casts = [
        'payment_status' => 'string',
        'payment_type' => 'string',
        'payment_amount' => 'decimal:2',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_sold')
                    ->withPivot('quantity', 'price_at_sale')
                    ->withTimestamps();
    }

    public function productSold()
    {
        return $this->hasMany(ProductSold::class, 'sales_id');
    }

    // Total amount of all items
    public function getTotalAttribute()
    {
        return $this->productSold->sum(function ($item) {
            return $item->quantity * $item->price_at_sale;
        });
    }

    // Change = payment_amount - total
    public function getChangeAttribute()
    {
        if ($this->payment_amount === null) return null;
        return max(0, $this->payment_amount - $this->total);
    }
}