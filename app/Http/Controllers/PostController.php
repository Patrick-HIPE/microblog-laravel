<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Post;
use App\Models\Like;
use App\Models\Comment;
use App\Models\Share;
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
        $currentUser = Auth::user();

        $posts = Post::with([
                'user:id,name',
                'likes',
                'shares', 
                'comments.user:id,name'
            ])
            ->latest() 
            ->get()
            ->map(function ($post) use ($currentUser) {
                return [
                    'id' => $post->id,
                    'content' => $post->content,
                    'image_url' => $post->image ? Storage::url($post->image) : null,
                    'created_at' => $post->created_at,
                    'updated_at' => $post->updated_at,
                    
                    // LIKES
                    'likes_count' => $post->likes->count(),
                    'liked_by_user' => $currentUser ? $post->likes->contains('user_id', $currentUser->id) : false,
                    
                    // SHARES
                    'shares_count' => $post->shares->count(),
                    'shared_by_user' => $currentUser ? $post->shares->contains('user_id', $currentUser->id) : false,

                    'comments_count' => $post->comments->count(),
                    'user' => [
                        'id' => $post->user->id,
                        'name' => $post->user->name,
                        'avatar' => $post->user->avatar ?? null,
                    ],
                    'comments' => $post->comments->map(function ($comment) {
                        return [
                            'id' => $comment->id,
                            'body' => $comment->body,
                            'created_at' => $comment->created_at,
                            'user' => [
                                'id' => $comment->user->id,
                                'name' => $comment->user->name,
                                'avatar' => $comment->user->avatar ?? null,
                            ],
                        ];
                    }),
                ];
            });

        return Inertia::render('post/index', [
            'posts' => $posts,
            'current_user_id' => $currentUser?->id,
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
        $currentUser = Auth::user();

        $post->load([
            'user:id,name',
            'likes',
            'shares',
            'comments.user:id,name'
        ]);

        $data = [
            'id' => $post->id,
            'content' => $post->content,
            'image_url' => $post->image ? Storage::url($post->image) : null,
            'created_at' => $post->created_at,
            'updated_at' => $post->updated_at,
            
            // LIKES
            'likes_count' => $post->likes->count(),
            'liked_by_user' => $currentUser ? $post->likes->contains('user_id', $currentUser->id) : false,

            // SHARES
            'shares_count' => $post->shares->count(),
            'shared_by_user' => $currentUser ? $post->shares->contains('user_id', $currentUser->id) : false,

            'comments_count' => $post->comments->count(),
            'user' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'avatar' => $post->user->avatar ?? null,
            ],
            'comments' => $post->comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'body' => $comment->body,
                    'created_at' => $comment->created_at,
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'avatar' => $comment->user->avatar ?? null,
                    ],
                ];
            }),
        ];

        return Inertia::render('post/show', [
            'post' => $data,
            'current_user_id' => $currentUser?->id,
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

    /**
     * Toggle Like
     */
    public function like(Post $post)
    {
        $user = Auth::user();

        if (!$user) {
            abort(403, 'You must be logged in to like a post.');
        }

        $like = Like::where('user_id', $user->id)
                    ->where('post_id', $post->id)
                    ->first();

        if ($like) {
            $like->delete();
            $message = 'You unliked the post.';
        } else {
            Like::create([
                'user_id' => $user->id,
                'post_id' => $post->id,
            ]);
            $message = 'You liked the post.';
        }

        return back()->with('success', $message);
    }

    /**
     * Toggle Share
     */
    public function share(Post $post)
    {
        $user = Auth::user();

        if (!$user) {
            abort(403, 'You must be logged in to share a post.');
        }

        // Check for existing share
        $existingShare = $post->shares()
                              ->where('user_id', $user->id)
                              ->first();

        if ($existingShare) {
            // Unshare
            $existingShare->delete();
            $message = 'You unshared the post.';
        } else {
            // Share
            $post->shares()->create([
                'user_id' => $user->id,
            ]);
            $message = 'You shared the post.';
        }

        return back()->with('success', $message);
    }
}