<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MembersRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
   public function rules(): array
    {
        $member = $this->route('member');
        $memberId = $member ? $member->id : null;

         $rules = [
            // Member fields
            'firstname' => 'required|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('members')->ignore($memberId),
            ],
            'contact' => [
                'required',
                'string',
                'max:20',
                Rule::unique('members')->ignore($memberId),
            ],
            'address' => 'required|string',
            'sex' => ['required', Rule::in(['male', 'female'])],
            'membership_status' => ['nullable', Rule::in(['active', 'expired'])],
            'contract_status' => ['nullable', Rule::in(['active', 'expired'])],
            'profile' => ['required', 'image', 'max:2048', 'mimes:jpg,jpeg,png,gif'],
            // Membership fee fields
            'membership_id' => ['nullable', 'integer', 'exists:membership_pricing,id'],
            'payment_type' => ['nullable', Rule::in(['cash', 'gcash'])],
            'payment_amount' => ['nullable', 'numeric', 'min:0'],
            'or_number' => ['nullable', 'string', 'max:50'],
            'transaction_id' => ['nullable', 'string', 'max:100'],
            'payment_status' => ['nullable', Rule::in(['pending', 'paid', 'failed'])],
            'paid_at' => ['nullable', 'date'],
        ];
        // Make fields optional on update
        if ($this->isMethod('PATCH') || $this->isMethod('PUT')) {
            foreach ($rules as $field => $rule) {
                if (is_string($rule) && strpos($rule, 'nullable') === false && strpos($rule, 'sometimes') === false) {
                    $rules[$field] = 'sometimes|' . $rule;
                } elseif (is_array($rule)) {
                    if (!in_array('sometimes', $rule) && !in_array('nullable', $rule)) {
                        array_unshift($rule, 'sometimes');
                    }
                    $rules[$field] = $rule;
                }
            }
        }

        return $rules;
    }
}
