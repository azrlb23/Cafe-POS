<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:2048'], // For file upload
            'base_price' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            
            // Base Recipes
            'recipes' => ['nullable', 'array'],
            'recipes.*.raw_material_id' => ['required_with:recipes', 'exists:raw_materials,id'],
            'recipes.*.quantity' => ['required_with:recipes', 'numeric', 'min:0'],
            
            // Option Groups
            'option_groups' => ['nullable', 'array'],
            'option_groups.*.name' => ['required_with:option_groups', 'string'],
            'option_groups.*.min_select' => ['required_with:option_groups', 'integer', 'min:0'],
            'option_groups.*.max_select' => ['required_with:option_groups', 'integer', 'min:1'],
            
            // Option Items
            'option_groups.*.items' => ['required_with:option_groups', 'array'],
            'option_groups.*.items.*.name' => ['required', 'string'],
            'option_groups.*.items.*.price_modifier' => ['required', 'numeric', 'min:0'],
            
            // Option Item Recipes
            'option_groups.*.items.*.recipes' => ['nullable', 'array'],
            'option_groups.*.items.*.recipes.*.raw_material_id' => ['required', 'exists:raw_materials,id'],
            'option_groups.*.items.*.recipes.*.quantity' => ['required', 'numeric', 'min:0'],
        ];
    }
}
