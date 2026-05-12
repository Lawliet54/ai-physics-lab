<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->with('roles')
            ->latest()
            ->get()
            ->map(fn (User $user) => $this->serializeUser($user));

        return response()->json(['data' => $users]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:80', 'alpha_dash:ascii', 'unique:users,username'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in(['student', 'teacher', 'admin'])],
            'password' => ['nullable', 'string', 'min:8', 'max:64'],
            'must_change_password' => ['sometimes', 'boolean'],
        ]);

        $plainPassword = $data['password'] ?? Str::password(10, letters: true, numbers: true, symbols: false);

        $user = DB::transaction(function () use ($data, $plainPassword, $request) {
            $user = User::query()->create([
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'] ?? null,
                'password' => Hash::make($plainPassword),
                'first_name' => $data['name'],
                'display_name' => $data['name'],
                'preferred_locale' => 'kk',
                'is_active' => true,
                'must_change_password' => $data['must_change_password'] ?? true,
                'created_by' => $request->user()->id,
                'settings' => [],
            ]);

            $role = Role::query()->where('role_key', $data['role'])->firstOrFail();
            $user->roles()->attach($role->id, [
                'id' => (string) Str::uuid(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return $user->load('roles');
        });

        return response()->json([
            'data' => [
                'user' => $this->serializeUser($user),
                'temporary_password' => $plainPassword,
            ],
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['sometimes', 'required', Rule::in(['student', 'teacher', 'admin'])],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        DB::transaction(function () use ($data, $user) {
            $user->fill(collect($data)->only(['name', 'email', 'is_active'])->all())->save();

            if (isset($data['role'])) {
                $role = Role::query()->where('role_key', $data['role'])->firstOrFail();
                $user->roles()->sync([$role->id => [
                    'id' => (string) Str::uuid(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]]);
            }
        });

        return response()->json(['data' => $this->serializeUser($user->fresh('roles'))]);
    }

    public function resetPassword(User $user): JsonResponse
    {
        $plainPassword = Str::password(10, letters: true, numbers: true, symbols: false);

        $user->forceFill([
            'password' => Hash::make($plainPassword),
            'must_change_password' => true,
            'password_changed_at' => null,
        ])->save();

        return response()->json([
            'data' => [
                'user' => $this->serializeUser($user->loadMissing('roles')),
                'temporary_password' => $plainPassword,
            ],
        ]);
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'roles' => $user->roleKeys(),
            'is_active' => $user->is_active,
            'must_change_password' => $user->must_change_password,
            'created_at' => $user->created_at,
        ];
    }
}
