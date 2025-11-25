<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Post;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $posts = Post::with('user')
            ->withCount('likes') // Total likes per post
            ->with(['likes' => function ($query) {
                $query->where('user_id', Auth::id()); // Check if current user liked
            }])
            ->latest()
            ->paginate(10);

        $posts->getCollection()->transform(function ($post) {
            $post->image_url = $post->image ? Storage::url($post->image) : null;
            $post->liked_by_user = $post->likes->isNotEmpty(); // true if current user liked
            return $post;
        });

        return Inertia::render('dashboard', [
            'posts' => $posts->items(),
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }
}
