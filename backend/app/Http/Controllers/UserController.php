<?php
namespace App\Http\Controllers;

use App\Http\Requests\UserUpdateRequest;

class UserController extends Controller
{
    public function me()
    {
        return response()->json(auth('api')->user());
    }

    public function updateMe(UserUpdateRequest $request)
    {
        $user = auth('api')->user();
        if ($request->filled('name')) $user->name = $request->name;
        if ($request->filled('password')) $user->password_hash = bcrypt($request->password);
        $user->save();
        return response()->json($user);
    }
}
