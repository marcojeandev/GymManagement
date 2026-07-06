<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductSold extends Model
{
    use HasFactory;

    protected $table = 'product_sold';

    protected $fillable = [
        'sales_id',
        'product_id',
        'quantity',
        'price_at_sale',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price_at_sale' => 'decimal:2',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class, 'sales_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}