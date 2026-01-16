<?php

namespace App\Services;

use App\Models\User;
use App\Models\Post;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class SearchService
{
    /**
     * Perform a search against Users and Posts.
     *
     * @param string|null $query
     * @return array
     */
    public function search(?string $query): array
    {
        // Handle empty query immediately
        if (!$query) {
            return [
                'users' => ['data' => [], 'next_page_url' => null],
                'posts' => ['data' => [], 'next_page_url' => null]
            ];
        }

        return [
            'users' => $this->searchUsers($query),
            'posts' => $this->searchPosts($query),
        ];
    }

    /**
     * Search and format Users.
     */
    protected function searchUsers(string $query)
    {
        $users = User::query()
            ->where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->select(['id', 'name', 'email', 'avatar'])
            ->paginate(5, ['*'], 'users_page');

        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
            ];
        });

        return $users;
    }

    /**
     * Search and format Posts.
     */
    protected function searchPosts(string $query)
    {
        $posts = Post::query()
            ->with('user:id,name')
            ->where('content', 'like', "%{$query}%")
            ->latest()
            ->select(['id', 'content', 'user_id', 'created_at'])
            ->paginate(5, ['*'], 'posts_page');

        $posts->getCollection()->transform(function ($post) {
            return [
                'id' => $post->id,
                'author' => $post->user->name,
                'preview' => Str::limit($post->content, 60),
                'date' => $post->created_at->diffForHumans(),
            ];
        });

        return $posts;
    }
}
