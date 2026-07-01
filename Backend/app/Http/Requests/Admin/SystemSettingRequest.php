<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SystemSettingRequest extends FormRequest
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
        return [
            'gym_name'    => 'required|string|max:255',
            'description' => 'nullable|string',
            'location'    => 'nullable|string',
            'email'       => 'nullable|email',
            'contact'     => 'nullable|string|max:20',
            'social_links'=> 'nullable|array',
            'features'    => 'nullable|array',
            'pricing'     => 'nullable|array',
            'primary_color'   => 'nullable|string',
            'secondary_color' => 'nullable|string',
            'logo'    => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'favicon' => 'nullable|image|mimes:ico,png|max:512',
            'gallery.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];
    }
}
