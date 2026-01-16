<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Http\Resources\PostResource;
use App\Services\ProfileService;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function __construct(protected ProfileService $profileService) {}

    /**
     * Display a user's profile.
     */
    public function show(User $user)
    {
        $data = $this->profileService->getProfileData($user, Auth::user());

        return Inertia::render('profile/show', [
            'user' => $data['user']->load('followers', 'following'),
            'posts' => PostResource::collection($data['posts']),
            'shares' => PostResource::collection($data['shares']),
            'current_user_id' => Auth::id(),
            'user_is_followed' => $data['is_followed'],
            'auth_user' => $data['formatted_current_user'],
        ]);
    }

    /**
     * Toggle follow and unfollow user.
     */
    public function toggleFollow(User $user)
    {
        $currentUser = Auth::user();

        if (!$currentUser) {
            abort(403, 'You must be logged in.');
        }

        try {
            $message = $this->profileService->toggleFollow($user, $currentUser);
            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }

    /**
     * Display the list of followers.
     */
    public function followers(User $user)
    {
        $followers = $this->profileService->getFollowers($user, Auth::user());

        return Inertia::render('profile/followers', [
            'user' => $user,
            'followers' => $followers,
            'current_user_id' => Auth::id(),
        ]);
    }

    /**
     * Display the list of following.
     */
    public function following(User $user)
    {
        $following = $this->profileService->getFollowing($user, Auth::user());

        return Inertia::render('profile/following', [
            'user' => $user,
            'following' => $following,
            'current_user_id' => Auth::id(),
        ]);
    }
}
