<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine if the user can update the profile.
     */
    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }

    /**
     * Determine if the user can delete the account.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }
}