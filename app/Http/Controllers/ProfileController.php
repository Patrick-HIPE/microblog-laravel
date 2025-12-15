<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    /**
     * Display a user's profile.
     */
    public function show(User $user)
    {
        $currentUser = Auth::user();

        $isFollowed = $currentUser
            ? $currentUser->following()->where('user_id', $user->id)->exists()
            : false;

        $posts = $user->posts()
            ->with('user')
            ->latest()
            ->get()
            ->map(function ($post) use ($currentUser) {
                return [
                    'id' => $post->id,
                    'content' => $post->content,
                    'image_url' => $post->image ? '/storage/' . $post->image : null,
                    'created_at' => $post->created_at,
                    'updated_at' => $post->updated_at,
                    'likes_count' => $post->likes()->count(),
                    'comments_count' => $post->comments()->count(),
                    'liked_by_user' => $currentUser ? $post->likes()->where('user_id', $currentUser->id)->exists() : false,
                    'user' => [
                        'id' => $post->user->id,
                        'name' => $post->user->name,
                    ],
                ];
            });

        return inertia('profile/show', [
            'user' => $user->load('followers', 'following'),
            'posts' => $posts,
            'current_user_id' => $currentUser?->id,
            'user_is_followed' => $isFollowed,
        ]);
    }

    /**
     * Toggle following/unfollowing a user.
     */
    public function toggleFollow(User $user)
    {
        $currentUser = Auth::user();

        if (!$currentUser || $currentUser->id === $user->id) {
            abort(403, 'Cannot follow yourself.');
        }

        if ($currentUser->isFollowing($user)) {
            $currentUser->following()->detach($user->id);
        } else {
            $currentUser->following()->attach($user->id);
        }

        return back();
    }

    /**
     * Display the list of followers.
     */
    public function followers(User $user)
    {
        $currentUser = Auth::user();

        $followers = $user->followers()->get()->map(function ($follower) use ($currentUser) {
            return [
                'id' => $follower->id,
                'name' => $follower->name,
                'email' => $follower->email,
                'avatar_url' => $follower->avatar_url,
                'user_is_followed' => $currentUser?->isFollowing($follower) ?? false,
            ];
        });

        return inertia('profile/followers', [
            'user' => $user,
            'followers' => $followers,
            'current_user_id' => $currentUser?->id,
        ]);
    }

    /**
     * Display the list of users the profile is following.
     */
    public function following(User $user)
    {
        $currentUser = Auth::user();

        $following = $user->following()->get()->map(function ($followedUser) use ($currentUser) {
            return [
                'id' => $followedUser->id,
                'name' => $followedUser->name,
                'email' => $followedUser->email,
                'avatar_url' => $followedUser->avatar_url,
                'user_is_followed' => $currentUser?->isFollowing($followedUser) ?? false,
            ];
        });

        return inertia('profile/following', [
            'user' => $user,
            'following' => $following,
            'current_user_id' => $currentUser?->id,
        ]);
    }
}
