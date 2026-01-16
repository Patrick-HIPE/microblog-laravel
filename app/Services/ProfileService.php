<?php

namespace App\Services;

use App\Models\User;
use App\Models\Follow;
use Illuminate\Support\Facades\Storage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProfileService
{
    /**
     * Prepare data for the profile "Show" page.
     */
    public function getProfileData(User $user, ?User $currentUser): array
    {
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

        return [
            'user' => $user,
            'posts' => $posts,
            'shares' => $shares,
            'is_followed' => $isFollowed,
            'formatted_current_user' => $formattedCurrentUser,
        ];
    }

    /**
     * Handle follow or unfollow a user.
     */
    public function toggleFollow(User $targetUser, User $currentUser): string
    {
        if ($currentUser->id === $targetUser->id) {
            throw new \Exception('Cannot follow yourself.');
        }

        $follow = Follow::withTrashed()
            ->where('follower_id', $currentUser->id)
            ->where('user_id', $targetUser->id)
            ->first();

        if ($follow) {
            if ($follow->trashed()) {
                $follow->restore();
                return "Follow restored.";
            } else {
                $follow->delete();
                return "User unfollowed.";
            }
        }

        Follow::create([
            'follower_id' => $currentUser->id,
            'user_id' => $targetUser->id,
        ]);

        return "User followed.";
    }

    /**
     * Get list of followers.
     */
    public function getFollowers(User $user, ?User $currentUser): LengthAwarePaginator
    {
        $user->avatar = $user->avatar ? Storage::url($user->avatar) : null;
        
        $followers = $user->followers()->paginate(5);
        
        $followers->through(function ($follower) use ($currentUser) {
            return $this->formatUserForList($follower, $currentUser);
        });

        return $followers;
    }

    /**
     * Get list of following.
     */
    public function getFollowing(User $user, ?User $currentUser): LengthAwarePaginator
    {
        $user->avatar = $user->avatar ? Storage::url($user->avatar) : null;

        $following = $user->following()->paginate(5);

        $following->through(function ($followedUser) use ($currentUser) {
            return $this->formatUserForList($followedUser, $currentUser);
        });

        return $following;
    }

    /**
     * Helper to format a user for followers and following lists.
     */
    protected function formatUserForList(User $user, ?User $currentUser): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
            'user_is_followed' => $currentUser?->isFollowing($user) ?? false,
        ];
    }
}
