<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Cache; 


class Sale extends Model
{
    use HasFactory;
    protected $table = 'sales';
    protected $fillable = [
        'paid_by',
        'payment_type',
        'or_number',
        'transaction_id',
        'payment_status',
        'payment_amount',
        'total_amount'
    ];

    protected $casts = [
        'payment_status' => 'string',
        'payment_type' => 'string',
        'payment_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
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


    protected static function booted()
    {
        static::saved(function () {
            Cache::flush(); // For simplicity, you can flush all caches
            // Or clear specific keys:
            Cache::forget('reports_overview');
            Cache::forget('reports_sales_trend_30');
            Cache::forget('reports_sales_by_payment');
            Cache::forget('reports_top_products_5');
            Cache::forget('reports_revenue_*'); // wildcard not supported, so use flush or prefix
            // Better: use a prefix and clear all with prefix
        });
        static::deleted(function () {
            Cache::flush();
        });
    }
}