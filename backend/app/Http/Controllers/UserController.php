<?php
namespace App\Http\Controllers;

use App\Http\Requests\UserUpdateRequest;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function me()
    {
        return response()->json(auth('api')->user());
    }

    public function updateMe(UserUpdateRequest $request)
    {
        $user = auth('api')->user();
        if ($request->filled('name')) {
            $user->name = $request->name;
        }
        if ($request->filled('password')) {
            $user->password_hash = Hash::make($request->password);
        }
        $user->save();
        // Não retornar campo de senha
        return response()->json($user->makeHidden(['password_hash']));
    }
}
