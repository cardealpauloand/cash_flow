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
            'password' => ['sometimes', 'string', 'min:6'],
            // Senha atual obrigatória quando for alterar senha
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
}
