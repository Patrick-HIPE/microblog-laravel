<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Post;
use App\Http\Requests\StorePostRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;


class PostController extends Controller
{
    public function index()
    {
        $posts = Post::where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($post) {
                $post->image_url = $post->image ? Storage::url($post->image) : null;
                return $post;
            });

        return Inertia::render('post/index', [
            'posts' => $posts,
        ]);
    }

    public function create()
    {
        return Inertia::render('post/create');
    }

    public function store(StorePostRequest $request)
    {
        $data = $request->validated();

        $data['user_id'] = Auth::id();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('posts', 'public');
        }

        Post::create($data);

        return redirect()->route('posts.index');
    }

    public function edit(Post $post)
    {
        // return Inertia::render('posts/edit');
    }
}
