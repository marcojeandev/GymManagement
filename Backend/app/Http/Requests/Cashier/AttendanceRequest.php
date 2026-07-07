<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isCashier();
    }

    public function rules(): array
    {
        $rules = [
            'members_id' => ['required', 'exists:members,id'],
            'time_in' => ['required', 'date'],
            'time_out' => ['nullable', 'date', 'after:time_in'],
        ];

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules = array_map(fn($rule) => array_merge(['sometimes'], (array) $rule), $rules);
        }

        return $rules;
    }
}