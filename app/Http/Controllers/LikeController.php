<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Like;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    /**
     * Toggle like/unlike for a post.
     */
    public function toggle(Post $post)
    {
        $user = Auth::user();

        if (!$user) {
            abort(403, 'You must be logged in to like a post.');
        }

        // Check if user already liked the post
        $like = Like::where('user_id', $user->id)
                    ->where('post_id', $post->id)
                    ->first();

        if ($like) {
            // Unlike
            $like->delete();
        } else {
            // Like
            Like::create([
                'user_id' => $user->id,
                'post_id' => $post->id,
            ]);
        }

        return back();
    }
}
