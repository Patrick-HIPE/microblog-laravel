<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class ProfileController extends Controller
{
    public function show(User $user)
    {
        $posts = $user->posts()
            ->latest()
            ->get();

        return inertia('profile/show', [
            'user' => $user, 
            'posts' => $user->posts()->latest()->get(),
        ]);
    }
}

