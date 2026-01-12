<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Post;
use App\Models\Like;
use App\Models\Share;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class PostController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the posts for the authenticated user.
     */
    public function index()
    {
        $currentUser = Auth::user();

        $posts = Post::where('user_id', $currentUser->id)
            ->with([
                'user:id,name,avatar',
                'likes',
                'shares', 
                'comments.user:id,name,avatar'
            ])
            ->latest() 
            ->paginate(6); 

        $posts->getCollection()->transform(function ($post) use ($currentUser) {
            return [
                'id' => $post->id,
                'content' => $post->content,
                'image_url' => $post->image ? Storage::url($post->image) : null,
                'created_at' => $post->created_at,
                'updated_at' => $post->updated_at,
                
                'likes_count' => $post->likes->count(),
                'liked_by_user' => $currentUser ? $post->likes->contains('user_id', $currentUser->id) : false,
                
                'shares_count' => $post->shares->count(),
                'shared_by_user' => $currentUser ? $post->shares->contains('user_id', $currentUser->id) : false,

                'comments_count' => $post->comments->count(),
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'avatar' => $post->user->avatar ? Storage::url($post->user->avatar) : null,
                ],
                'can' => [
                    'update' => $currentUser ? $currentUser->can('update', $post) : false,
                    'delete' => $currentUser ? $currentUser->can('delete', $post) : false,
                ],
                'comments' => $post->comments->map(function ($comment) {
                    return [
                        'id' => $comment->id,
                        'body' => $comment->body,
                        'created_at' => $comment->created_at,
                        'user' => [
                            'id' => $comment->user->id,
                            'name' => $comment->user->name,
                            'avatar' => $comment->user->avatar ? Storage::url($comment->user->avatar) : null,
                        ],
                    ];
                }),
            ];
        });

        // NEW: Format the current user specifically to ensure avatar URL is correct for the frontend modal
        $formattedUser = $currentUser ? [
            'id' => $currentUser->id,
            'name' => $currentUser->name,
            'avatar' => $currentUser->avatar ? Storage::url($currentUser->avatar) : null,
        ] : null;

        return Inertia::render('post/index', [
            'posts' => $posts,
            'current_user_id' => $currentUser?->id,
            'auth_user' => $formattedUser, // Pass this to the view
        ]);
    }

    // ... rest of the methods (create, store, show, edit, update, destroy, like, share) remain unchanged
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

    public function show(Post $post)
    {
        $currentUser = Auth::user();

        $post->load([
            'user:id,name,avatar', 
            'likes',
            'shares',
            'comments.user:id,name,avatar'
        ]);

        $data = [
            'id' => $post->id,
            'content' => $post->content,
            'image_url' => $post->image ? Storage::url($post->image) : null,
            'created_at' => $post->created_at,
            'updated_at' => $post->updated_at,
            
            'likes_count' => $post->likes->count(),
            'liked_by_user' => $currentUser ? $post->likes->contains('user_id', $currentUser->id) : false,

            'shares_count' => $post->shares->count(),
            'shared_by_user' => $currentUser ? $post->shares->contains('user_id', $currentUser->id) : false,

            'comments_count' => $post->comments->count(),
            'user' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'avatar' => $post->user->avatar ? Storage::url($post->user->avatar) : null,
            ],
            'can' => [
                'update' => $currentUser ? $currentUser->can('update', $post) : false,
                'delete' => $currentUser ? $currentUser->can('delete', $post) : false,
            ],
            'comments' => $post->comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'body' => $comment->body,
                    'created_at' => $comment->created_at,
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'avatar' => $comment->user->avatar ? Storage::url($comment->user->avatar) : null,
                    ],
                ];
            }),
        ];

        $formattedUser = $currentUser ? [
            'id' => $currentUser->id,
            'name' => $currentUser->name,
            'avatar' => $currentUser->avatar ? Storage::url($currentUser->avatar) : null,
        ] : null;

        return Inertia::render('post/show', [
            'post' => $data,
            'auth_user' => $formattedUser,
        ]);
    }

    public function edit(Post $post)
    {
        $this->authorize('update', $post);
        $post->image_url = $post->image ? Storage::url($post->image) : null;
        return Inertia::render('post/edit', [ 'post' => $post ]);
    }

    public function update(UpdatePostRequest $request, Post $post)
    {
        $this->authorize('update', $post);
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

    public function destroy(Post $post)
    {
        $this->authorize('delete', $post);
        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }
        $post->delete();
        return redirect()->route('posts.index')->with('message', 'Post deleted successfully!');
    }

    public function like(Post $post)
    {
        $user = Auth::user();
        if (!$user) abort(403);

        $like = Like::withTrashed()
            ->where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->first();

        if (!$like) {
            Like::create([
                'user_id' => $user->id,
                'post_id' => $post->id
            ]);
            $message = 'Post liked.';
        } elseif ($like->trashed()) {
            $like->restore();
            $message = 'Like restored.';
        } else {
            $like->delete();
            $message = 'Post unliked.';
        }

        return back()->with('success', $message);
    }

    public function share(Post $post)
    {
        $user = Auth::user();
        if (!$user) abort(403);

        $share = Share::withTrashed()
            ->where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->first();

        if (!$share) {
            try {
                $post->shares()->create(['user_id' => $user->id]);
                $message = 'Post shared.';
            } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
                return back()->with('info', 'Already shared.');
            }
        } elseif ($share->trashed()) {
            $share->restore();
            $message = 'Share restored.';
        } else {
            $share->delete();
            $message = 'Post unshared.';
        }

        return back()->with('success', $message);
    }
}
