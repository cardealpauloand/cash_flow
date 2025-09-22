<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    public function withValidator($validator)
    {
        $validator->after(function ($v) {
            $data = $this->all();


            if (!empty($data['subs']) && is_array($data['subs'])) {
                foreach ($data['subs'] as $idx => $item) {
                    if (!empty($item['category_id']) && !empty($item['sub_category_id'])) {
                        $catId = (int) $item['category_id'];
                        $subId = (int) $item['sub_category_id'];
                        $ok = \Illuminate\Support\Facades\DB::table('sub_category')
                            ->where('id', $subId)
                            ->where('category_id', $catId)
                            ->exists();
                        if (!$ok) {
                            $v->errors()->add("subs.$idx.sub_category_id", 'A subcategoria não pertence à categoria selecionada.');
                        }
                    }
                }
            }
        });
    }
    public function rules(): array
    {



        $base = [
            'transaction_type' => ['required', 'in:income,expense,transfer'],
            'value' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date'],
            'account_id' => ['required', 'integer', 'exists:accounts,id'],
            'notes' => ['nullable', 'string'],
            'category_id' => ['nullable', 'integer', 'exists:category,id'],

            'sub_category_id' => [
                'nullable',
                'integer',
                Rule::exists('sub_category', 'id')->where(function ($q) {
                    $catId = $this->input('category_id');
                    if ($catId) $q->where('category_id', $catId);
                }),
            ],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['integer', 'exists:tags,id'],

            'subs' => ['nullable', 'array'],
            'subs.*.value' => ['required_with:subs', 'numeric', 'min:0.01'],
            'subs.*.category_id' => ['nullable', 'integer', 'exists:category,id'],

            'subs.*.sub_category_id' => [
                'nullable',
                'integer',
                Rule::exists('sub_category', 'id'),
            ],

            'installments_count' => ['nullable', 'integer', 'min:1'],
        ];
        if ($this->input('transaction_type') === 'transfer') {
            $base['account_out_id'] = ['required', 'integer', 'different:account_id', 'exists:accounts,id'];

            if ((int) $this->input('installments_count', 1) > 1) {
                $base['installments_count'][] = 'in:1';
            }
        } else {
            $base['account_out_id'] = ['prohibited'];
        }
        return $base;
    }
}
