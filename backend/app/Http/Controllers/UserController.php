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
        if ($request->filled('email')) {
            $user->email = $request->email;
        }
        if ($request->has('phone')) {
            if (\Schema::hasColumn('users', 'phone')) {
                $user->phone = $request->phone;
            }
        }
        if ($request->filled('password')) {
            $user->password_hash = Hash::make($request->password);
        }
        $user->save();
        return response()->json($user);
    }
}
