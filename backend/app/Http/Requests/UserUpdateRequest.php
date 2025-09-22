<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;

class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'email' => ['sometimes', 'email', 'max:190', 'unique:users,email,' . auth('api')->id()],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'password' => ['sometimes', 'string', 'min:6'],

            'current_password' => [
                'required_with:password',
                'string',
                function ($attribute, $value, $fail) {
                    $user = auth('api')->user();
                    if ($this->filled('password') && (!$user || !Hash::check($value, $user->password_hash))) {
                        $fail('Senha atual incorreta');
                    }
                }
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required_with' => 'Informe a senha atual para alterar a senha.',
            'password.min' => 'A nova senha deve ter pelo menos :min caracteres.',
        ];
    }
}
