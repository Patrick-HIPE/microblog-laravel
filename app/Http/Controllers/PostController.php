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
        return redirect()->route('posts.index')->with('message', 'Post created successfully!');
    }

    public function edit(Post $post)
    {
        $post->image_url = $post->image ? Storage::url($post->image) : null;
        
        return Inertia::render('post/edit', [
            'post' => $post,
        ]);
    }

public function update(UpdatePostRequest $request, Post $post)
    {
        $data = $request->validated();

        // 1. Handle New Image Upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }
            $data['image'] = $request->file('image')->store('posts', 'public');
        } 
        // 2. Handle Explicit Removal (Checking the boolean flag from frontend)
        elseif ($request->boolean('removeImage')) {
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }
            $data['image'] = null;
        } 
        // 3. Keep Existing Image (Logic: remove 'image' key so validation/update ignores it)
        else {
            unset($data['image']);
        }

        // Remove the auxiliary fields before updating the model
        unset($data['_method']);
        unset($data['removeImage']);

        $post->update($data);

        return redirect()->route('posts.index')->with('message', 'Post updated successfully!');
    }

    public function destroy(Post $post)
    {
        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();

        return redirect()->route('posts.index')->with('message', 'Post deleted successfully!');
    }
}
