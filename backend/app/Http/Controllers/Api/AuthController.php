<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'login' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $user = User::query()
            ->with('roles')
            ->where('username', $credentials['login'])
            ->orWhere('email', $credentials['login'])
            ->first();

        if (! $user || ! $user->is_active || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Логин немесе пароль дұрыс емес.'],
            ]);
        }

        $plainToken = bin2hex(random_bytes(32));

        ApiToken::query()->create([
            'user_id' => $user->id,
            'name' => 'web',
            'token_hash' => hash('sha256', $plainToken),
            'expires_at' => now()->addDays(14),
        ]);

        return response()->json([
            'data' => [
                'token' => $plainToken,
                'user' => $this->serializeUser($user),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->serializeUser($request->user()->loadMissing('roles')),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->attributes->get('api_token')?->delete();

        return response()->json(['data' => ['ok' => true]]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Қазіргі пароль дұрыс емес.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($data['password']),
            'must_change_password' => false,
            'password_changed_at' => now(),
        ])->save();

        return response()->json(['data' => $this->serializeUser($user->loadMissing('roles'))]);
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'display_name' => $user->display_name,
            'roles' => $user->roleKeys(),
            'must_change_password' => $user->must_change_password,
        ];
    }
}
