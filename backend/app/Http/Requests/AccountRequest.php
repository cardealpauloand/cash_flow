<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AccountRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'name' => ['required','string','max:120'],
            'type' => ['required','in:corrente,poupanca,carteira,cartao'],
            'opening_balance' => ['nullable','numeric'],
        ];
    }
}