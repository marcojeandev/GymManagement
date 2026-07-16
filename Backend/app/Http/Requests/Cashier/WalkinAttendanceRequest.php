<?php

namespace App\Http\Requests\Cashier;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WalkinAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isCashier();
    }

    public function rules(): array
    {
        $rules = [
            'walk_in_id' => ['nullable', 'exists:walk_in_info,id'],
            'members_id' => ['nullable', 'exists:members,id'],
            'time_in' => ['required', 'date'],
            'fee_paid' => ['required', 'numeric', 'min:0'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
        ];

        // Ensure at least one of walk_in_id or members_id is provided
        if ($this->isMethod('post')) {
            $rules['walk_in_id'][] = Rule::requiredIf(empty($this->members_id));
            $rules['members_id'][] = Rule::requiredIf(empty($this->walk_in_id));
        }

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules = array_map(fn($rule) => array_merge(['sometimes'], (array) $rule), $rules);
        }

        return $rules;
    }
}