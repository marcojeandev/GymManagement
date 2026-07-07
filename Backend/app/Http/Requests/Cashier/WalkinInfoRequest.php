<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WalkinInfoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isCashier();
    }

    public function rules(): array
    {
        $rules = [
            'firstname' => ['required', 'string', 'max:255'],
            'middlename' => ['nullable', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'contact' => ['required', 'string', 'max:20'],
            'total_visits' => ['nullable', 'integer', 'min:0'],
        ];

        // Unique rules with exception for update
        if ($this->isMethod('post')) {
            $rules['email'][] = Rule::unique('walk_in_info', 'email');
            $rules['contact'][] = Rule::unique('walk_in_info', 'contact');
        } else {
            $id = $this->route('walkin_info') ? $this->route('walkin_info')->id : null;
            if ($id) {
                $rules['email'][] = Rule::unique('walk_in_info', 'email')->ignore($id);
                $rules['contact'][] = Rule::unique('walk_in_info', 'contact')->ignore($id);
            }
        }

        return $rules;
    }
}