<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
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

        $post->likes()->toggle($user->id);
        
        return back();
    }
}