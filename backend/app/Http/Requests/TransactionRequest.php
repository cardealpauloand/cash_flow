<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        // NOTE: Current physical table names are singular: 'category' and 'sub_category'.
        // The original rules used plural names causing SQLite errors (no such table: categories).
        // TODO: Consider creating migrations to rename tables to plural forms and then revert these rule changes.
        $base = [
            'transaction_type' => ['required', 'in:income,expense,transfer'],
            'value' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date'],
            'account_id' => ['required', 'integer', 'exists:accounts,id'],
            'notes' => ['nullable', 'string'],
            'category_id' => ['nullable', 'integer', 'exists:category,id'],
            'sub_category_id' => ['nullable', 'integer', 'exists:sub_category,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['integer', 'exists:tags,id'],
            // Suporte a múltiplas subcategorias (subs)
            'subs' => ['nullable', 'array'],
            'subs.*.value' => ['required_with:subs', 'numeric', 'min:0.01'],
            'subs.*.category_id' => ['nullable', 'integer', 'exists:category,id'],
            'subs.*.sub_category_id' => ['nullable', 'integer', 'exists:sub_category,id'],
        ];
        if ($this->input('transaction_type') === 'transfer') {
            $base['account_out_id'] = ['required', 'integer', 'different:account_id', 'exists:accounts,id'];
        } else {
            $base['account_out_id'] = ['prohibited'];
        }
        return $base;
    }
}


