<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WalkinAttendance;
use Illuminate\Auth\Access\Response;

class WalkinAttendancePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'cashier';
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, WalkinAttendance $walkinAttendance): bool
    {
        return $user->role === 'admin' || $user->role === 'cashier';
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'cashier';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, WalkinAttendance $walkinAttendance): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, WalkinAttendance $walkinAttendance): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, WalkinAttendance $walkinAttendance): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, WalkinAttendance $walkinAttendance): bool
    {
        return false;
    }
}
