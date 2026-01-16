<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Post;
use App\Models\Share;
use App\Http\Resources\PostResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        $followingIds = $user->following()->pluck('users.id');
        $allowedUserIds = $followingIds->push($user->id);

        $mySharedPostIds = Share::where('user_id', $user->id)->pluck('post_id');

        $postsQuery = DB::table('posts')
            ->select('id', 'created_at as activity_at', DB::raw("'post' as type"))
            ->whereIn('user_id', $allowedUserIds)
            ->whereNotIn('id', $mySharedPostIds);

        $activityPage = DB::table('shares')
            ->select('id', 'created_at as activity_at', DB::raw("'share' as type"))
            ->whereIn('user_id', $allowedUserIds)
            ->union($postsQuery)
            ->orderBy('activity_at', 'desc')
            ->paginate(10);
        
        $postIds = [];
        $shareIds = [];
        foreach ($activityPage as $item) {
            if ($item->type === 'post') $postIds[] = $item->id;
            else $shareIds[] = $item->id;
        }

        $allPosts = Post::with(['user', 'likes', 'shares', 'comments.user'])
            ->withCount(['likes', 'shares', 'comments'])
            ->whereIn('id', $postIds)
            ->get()
            ->keyBy('id');

        $allShares = Share::with(['user', 'post.user', 'post.likes', 'post.shares', 'post.comments.user'])
            ->whereIn('id', $shareIds)
            ->get()
            ->keyBy('id');

        $items = $activityPage->getCollection()->map(function ($item) use ($allPosts, $allShares) {
            return $item->type === 'post' 
                ? $allPosts->get($item->id) 
                : $allShares->get($item->id);
        })->filter();

        $activityPage->setCollection($items);

        return Inertia::render('dashboard', [
            'posts' => PostResource::collection($activityPage),
        ]);
    }
}
