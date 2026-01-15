<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Post;
use App\Models\Share;
use App\Http\Resources\PostResource;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        $followingIds = $user->following()->pluck('users.id');
        $allowedUserIds = $followingIds->push($user->id);

        $posts = Post::whereIn('user_id', $allowedUserIds)
            ->select('id', 'created_at as activity_at', \DB::raw("'post' as type"));

        $shares = Share::whereIn('user_id', $allowedUserIds)
            ->select('id', 'updated_at as activity_at', \DB::raw("'share' as type"));

        $activity = $posts->union($shares)
            ->orderBy('activity_at', 'desc')
            ->paginate(5);

        $items = $activity->getCollection()->map(function ($item) {
            if ($item->type === 'share') {
                return Share::with(['user', 'post.user', 'post.likes', 'post.shares', 'post.comments.user'])
                    ->find($item->id);
            }
            return Post::with(['user', 'likes', 'shares', 'comments.user'])
                ->withCount(['likes', 'shares', 'comments'])
                ->find($item->id);
        });

        $activity->setCollection($items);

        return Inertia::render('dashboard', [
            'posts' => PostResource::collection($activity),
        ]);
    }
}
