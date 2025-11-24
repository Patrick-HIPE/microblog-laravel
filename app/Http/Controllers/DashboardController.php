<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Post;
use Illuminate\Support\Facades\Storage;

class DashboardController extends Controller
{
    public function index()
    {
        $posts = Post::with('user')->latest()->paginate(10);
        $posts->getCollection()->transform(function ($post) {
            $post->image_url = $post->image ? Storage::url($post->image) : null;
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