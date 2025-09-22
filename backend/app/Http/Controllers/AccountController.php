<?php
namespace App\Http\Controllers;

use App\Http\Requests\AccountRequest;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $accounts = Account::where('user_id', auth('api')->id())->get();
        return response()->json($accounts);
    }

    public function store(AccountRequest $request)
    {
        $account = Account::create([
            'user_id' => auth('api')->id(),
            'name' => $request->name,
            'type' => $request->type,
            'opening_balance' => $request->opening_balance ?? 0,
            'created_at' => now(),
        ]);
        return response()->json($account, 201);
    }

    public function show(Account $account)
    {
        $this->authorize('view', $account);
        return response()->json($account);
    }

    public function update(AccountRequest $request, Account $account)
    {
        $this->authorize('update', $account);
        $account->fill($request->validated());
        $account->save();
        return response()->json($account);
    }

    public function destroy(Account $account)
    {
        $this->authorize('delete', $account);

        $hasIn = $account->transactions()->exists();
        $hasOut = Transaction::where('account_out_id', $account->id)->exists();
        if ($hasIn || $hasOut) {
            return response()->json([
                'error' => 'Conta possui transações e não pode ser excluída.'
            ], 409);
        }
        $account->delete();
        return response()->json(['deleted' => true]);
    }
}
