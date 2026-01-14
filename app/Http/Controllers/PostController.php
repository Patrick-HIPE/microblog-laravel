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
use App\Http\Resources\PostResource;

class PostController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the posts for the authenticated user.
     */
    public function index()
    {
        $posts = Post::where('user_id', Auth::id())
            ->with(['user', 'likes', 'shares', 'comments.user'])
            ->withCount(['likes', 'shares', 'comments'])
            ->latest()
            ->paginate(6);

        return Inertia::render('post/index', [
            'posts' => PostResource::collection($posts),
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

        return redirect()->route('posts.index')->with('success', 'Post created successfully.');
    }

    public function show(Post $post)
    {
        $post->load(['user', 'likes', 'shares', 'comments.user']);
        $post->loadCount(['likes', 'shares', 'comments']);

        return Inertia::render('post/show', [
            'post' => (new PostResource($post))->resolve(),
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

        return redirect()->route('posts.index')->with('success', 'Post updated successfully.');
    }

    public function destroy(Post $post)
    {
        $this->authorize('delete', $post);
        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }
        $post->delete();
        return redirect()->route('posts.index')->with('success', 'Post deleted successfully.');
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
