<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Models\Follow;
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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
            ->with(['user', 'likes', 'shares', 'comments.user'])
            ->withCount(['likes', 'shares', 'comments'])
            ->latest()
            ->paginate(6);

        $shares = $user->shares()
            ->with(['user', 'post.user', 'post.likes', 'post.shares', 'post.comments.user'])
            ->orderBy('updated_at', 'desc')
            ->paginate(6);

        $user->avatar = $user->avatar ? Storage::url($user->avatar) : null;

        $formattedCurrentUser = $currentUser ? [
            'id' => $currentUser->id,
            'name' => $currentUser->name,
            'avatar' => $currentUser->avatar ? Storage::url($currentUser->avatar) : null,
        ] : null;

        return Inertia::render('profile/show', [
            'user' => $user->load('followers', 'following'),
            'posts' => PostResource::collection($posts), 
            'shares' => PostResource::collection($shares),
            'current_user_id' => $currentUser?->id,
            'user_is_followed' => $isFollowed,
            'auth_user' => $formattedCurrentUser,
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

        $follow = \App\Models\Follow::withTrashed()
            ->where('follower_id', $currentUser->id)
            ->where('user_id', $user->id)
            ->first();

        if ($follow) {
            if ($follow->trashed()) {
                $follow->restore();
                $message = "Follow restored.";
            } else {
                $follow->delete();
                $message = "User unfollowed.";
            }
        } else {
            Follow::create([
                'follower_id' => $currentUser->id,
                'user_id' => $user->id,
            ]);
            $message = "User followed.";
        }

        return back()->with('success', $message);
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
                'avatar' => $follower->avatar ? Storage::url($follower->avatar) : null,
                'user_is_followed' => $currentUser?->isFollowing($follower) ?? false,
            ];
        });

        return Inertia::render('profile/followers', [
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
                'avatar' => $followedUser->avatar ? Storage::url($followedUser->avatar) : null,
                'user_is_followed' => $currentUser?->isFollowing($followedUser) ?? false,
            ];
        });

        return Inertia::render('profile/following', [
            'user' => $user,
            'following' => $following,
            'current_user_id' => $currentUser?->id,
        ]);
    }
}