<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class SearchController extends Controller
{
    public function __invoke(Request $request)
    {
        $query = $request->input('query');

        if (!$query) {
            return response()->json(['users' => [], 'posts' => []]);
        }

        $users = User::query()
            ->where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'email', 'avatar'])
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                ];
            });

        $posts = Post::query()
            ->with('user:id,name')
            ->where('content', 'like', "%{$query}%")
            ->latest()
            ->limit(5)
            ->get(['id', 'content', 'user_id', 'created_at'])
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'author' => $post->user->name,
                    'preview' => Str::limit($post->content, 60),
                    'date' => $post->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'users' => $users,
            'posts' => $posts,
        ]);
    }
}
