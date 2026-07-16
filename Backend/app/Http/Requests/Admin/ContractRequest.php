<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContractRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'members_id' => ['required', 'exists:members,id'],
            'contract_id' => ['required', 'exists:contract_pricing,id'],
            'contract_from' => ['nullable', 'date', 'before:contract_to'],
            'contract_to' => ['nullable', 'date', 'after:contract_from'],
            'payment_type' => ['required', Rule::in(['cash', 'gcash'])],
            'payment_amount' => ['nullable', 'numeric', 'min:0'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'or_number' => ['nullable', 'string', 'max:255'],
            'transaction_id' => ['nullable', 'string', 'max:255'],
            'payment_status' => ['required', Rule::in(['pending', 'paid', 'failed'])],
            'paid_at' => ['nullable', 'date'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // If payment_type is 'cash', transaction_id should be null
        if ($this->payment_type === 'cash') {
            $this->merge([
                'transaction_id' => null,
            ]);
        }
    }
}