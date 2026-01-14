<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Post;
use App\Http\Resources\PostResource;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        $followingIds = $user->following()->pluck('users.id');
        $allowedUserIds = $followingIds->push($user->id);

        $posts = Post::whereIn('user_id', $allowedUserIds)
            ->with(['user', 'likes', 'shares', 'comments.user'])
            ->withCount(['likes', 'shares', 'comments'])
            ->latest()
            ->paginate(5);

        return Inertia::render('dashboard', [
            'posts' => PostResource::collection($posts),
        ]);
    }
}