<?php

namespace App\Http\Requests\Cashier;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SalesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isCashier();
    }

    public function rules(): array
    {
        $rules = [
            'paid_by' => ['required', 'string', 'max:255'],
            'payment_type' => ['required', Rule::in(['cash', 'gcash'])],
            'or_number' => ['nullable', 'string', 'max:255'],
            'transaction_id' => ['nullable', 'string', 'max:255', 'required_if:payment_type,gcash'],
            'payment_status' => ['required', Rule::in(['pending', 'paid', 'failed'])],
            'payment_amount' => ['nullable', 'numeric', 'min:0'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'products' => ['required', 'array'],
            'products.*.product_id' => ['required', 'exists:products,id'],
            'products.*.quantity' => ['required', 'integer', 'min:1'],
            'products.*.price_at_sale' => ['required', 'numeric', 'min:0'],
        ];

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules = array_map(fn($rule) => array_merge(['sometimes'], (array) $rule), $rules);
        }

        return $rules;
    }
}