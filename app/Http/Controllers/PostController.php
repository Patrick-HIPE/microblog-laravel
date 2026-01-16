<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Services\PostService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PostController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected PostService $postService)
    {
    }

    public function index()
    {
        $posts = $this->postService->getPostsForUser(Auth::id());

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

        $this->postService->createPost(
            $data, 
            $request->file('image')
        );

        return redirect()->route('posts.index')
            ->with('success', 'Post created successfully.');
    }

    public function show(Post $post)
    {
        $post->load(['user', 'likes', 'shares', 'comments.user'])
             ->loadCount(['likes', 'shares', 'comments']);

        return Inertia::render('post/show', [
            'post' => (new PostResource($post))->resolve(),
        ]);
    }

    public function edit(Post $post)
    {
        $this->authorize('update', $post);
        
        $post->image_url = $post->image ? Storage::url($post->image) : null;
        
        return Inertia::render('post/edit', ['post' => $post]);
    }

    public function update(UpdatePostRequest $request, Post $post)
    {
        $this->authorize('update', $post);

        $this->postService->updatePost(
            $post,
            $request->validated(),
            $request->file('image'),
            $request->boolean('removeImage')
        );

        return redirect()->route('posts.index')
            ->with('success', 'Post updated successfully.');
    }

    public function destroy(Post $post)
    {
        $this->authorize('delete', $post);

        $this->postService->deletePost($post);

        return redirect()->route('posts.index')
            ->with('success', 'Post deleted successfully.');
    }

    public function like(Post $post)
    {
        if (!Auth::check()) abort(403);

        $message = $this->postService->toggleLike($post, Auth::id());

        return back()->with('success', $message);
    }

    public function share(Post $post)
    {
        if (!Auth::check()) abort(403);

        $result = $this->postService->toggleShare($post, Auth::id());

        return back()->with($result['status'], $result['message']);
    }
}
