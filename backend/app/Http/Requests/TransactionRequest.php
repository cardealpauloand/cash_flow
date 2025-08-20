<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        $base = [
            'transaction_type' => ['required','in:income,expense,transfer'],
            'value' => ['required','numeric','min:0.01'],
            'date' => ['required','date'],
            'account_id' => ['required','integer','exists:accounts,id'],
            'notes' => ['nullable','string'],
            'category_id' => ['nullable','integer','exists:categories,id'],
            'sub_category_id' => ['nullable','integer','exists:sub_categories,id'],
            'tags' => ['nullable','array'],
            'tags.*' => ['integer','exists:tags,id'],
        ];
        if ($this->input('transaction_type') === 'transfer') {
            $base['account_out_id'] = ['required','integer','different:account_id','exists:accounts,id'];
        } else {
            $base['account_out_id'] = ['prohibited'];
        }
        return $base;
    }
}


