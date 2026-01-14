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
        
        // Get IDs of people the user follows + the user themselves
        $followingIds = $user->following()->pluck('users.id');
        $allowedUserIds = $followingIds->push($user->id);

        $posts = Post::whereIn('user_id', $allowedUserIds)
            ->with(['user', 'likes', 'shares', 'comments.user'])
            ->withCount(['likes', 'shares', 'comments'])
            ->latest()
            ->paginate(10);

        return Inertia::render('dashboard', [
            // This automatically structures the response as:
            // { data: [...], links: {...}, meta: {...} }
            'posts' => PostResource::collection($posts),
        ]);
    }
}