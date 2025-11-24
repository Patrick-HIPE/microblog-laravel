<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Post;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    /**
     * Display a listing of the posts for the authenticated user.
     */
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

    /**
     * Show the form for creating a new post.
     */
    public function create()
    {
        return Inertia::render('post/create');
    }

    /**
     * Store a newly created post in storage.
     */
    public function store(StorePostRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('posts', 'public');
        }

        Post::create($data);

        return redirect()->route('posts.index')->with('message', 'Post created successfully!');
    }

    /**
     * Display a specific post.
     */
    public function show(Post $post)
    {
        $post->image_url = $post->image ? Storage::url($post->image) : null;

        return Inertia::render('post/show', [
            'post' => $post,
        ]);
    }

    /**
     * Show the form for editing a post.
     */
    public function edit(Post $post)
    {
        $post->image_url = $post->image ? Storage::url($post->image) : null;

        return Inertia::render('post/edit', [
            'post' => $post,
        ]);
    }

    /**
     * Update the specified post in storage.
     */
    public function update(UpdatePostRequest $request, Post $post)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }
            $data['image'] = $request->file('image')->store('posts', 'public');
        } elseif ($request->boolean('removeImage')) {
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }
            $data['image'] = null;
        } else {
            unset($data['image']);
        }

        unset($data['_method'], $data['removeImage']);

        $post->update($data);

        return redirect()->route('posts.index')->with('message', 'Post updated successfully!');
    }

    /**
     * Remove the specified post from storage.
     */
    public function destroy(Post $post)
    {
        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();

        return redirect()->route('posts.index')->with('message', 'Post deleted successfully!');
    }
}
