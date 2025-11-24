<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function show(User $user)
    {
        $currentUser = Auth::user();

        // Check if the current user is following this profile
        $isFollowed = $currentUser
            ? $currentUser->following()->where('user_id', $user->id)->exists()
            : false;

        return inertia('profile/show', [
            'user' => $user->load('followers', 'following'),
            'posts' => $user->posts()->latest()->get(),
            'current_user_id' => $currentUser?->id,
            'user_is_followed' => $isFollowed,
        ]);
    }

    public function toggleFollow(User $user)
    {
        $currentUser = Auth::user();

        if (!$currentUser || $currentUser->id === $user->id) {
            abort(403, 'Cannot follow yourself.');
        }

        if ($currentUser->isFollowing($user)) {
            $currentUser->following()->detach($user->id); 
        } else {
            $currentUser->following()->attach($user->id);
        }

        return back();
    }
}
