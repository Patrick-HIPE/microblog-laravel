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
        $user = Auth::user();
        $followingIds = $user->following()->pluck('users.id');
        $allowedUserIds = $followingIds->push($user->id);

        $posts = Post::whereIn('user_id', $allowedUserIds)
            ->with([
                'user:id,name,avatar',
                'comments.user:id,name,avatar',
                'likes' => function ($query) {
                    $query->where('user_id', Auth::id());
                },
                'shares' => function ($query) {
                    $query->where('user_id', Auth::id());
                }
            ])
            ->withCount(['likes', 'comments', 'shares']) 
            ->latest()
            ->paginate(10);

        $posts->getCollection()->transform(function ($post) {
            return [
                'id' => $post->id,
                'content' => $post->content,
                'image_url' => $post->image ? Storage::url($post->image) : null,
                'created_at' => $post->created_at,
                'updated_at' => $post->updated_at,
                
                'likes_count' => $post->likes_count,
                'comments_count' => $post->comments_count,
                'shares_count' => $post->shares_count,
                
                'liked_by_user' => $post->likes->isNotEmpty(),
                'shared_by_user' => $post->shares->isNotEmpty(),
                
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'avatar' => $post->user->avatar ? Storage::url($post->user->avatar) : null,
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

        return Inertia::render('dashboard', [
            'posts' => $posts->items(),
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
                'next_page_url' => $posts->nextPageUrl(),
                'prev_page_url' => $posts->previousPageUrl(),
            ],
        ]);
    }
}