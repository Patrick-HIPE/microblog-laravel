<?php

namespace App\Services;

use App\Models\Post;
use App\Models\Like;
use App\Models\Share;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;

class PostService
{
    /**
     * Fetch posts of user
     */
    public function getPostsForUser(int $userId)
    {
        return Post::where('user_id', $userId)
            ->with(['user', 'likes', 'shares', 'comments.user'])
            ->withCount(['likes', 'shares', 'comments'])
            ->latest()
            ->paginate(6);
    }

    /**
     * Create post and image upload
     */
    public function createPost(array $data, UploadedFile $image = null): Post
    {
        if ($image) {
            $data['image'] = $image->store('posts', 'public');
        }

        return Post::create($data);
    }

    /**
     * Handle update post and image update
     */
    public function updatePost(Post $post, array $data, UploadedFile $image = null, bool $removeImage = false): bool
    {
        if ($image) {
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }
            $data['image'] = $image->store('posts', 'public');
        } elseif ($removeImage) {
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }
            $data['image'] = null;
        } else {
            unset($data['image']);
        }

        unset($data['_method'], $data['removeImage']);

        return $post->update($data);
    }

    /**
     * Delete post and its image
     */
    public function deletePost(Post $post): ?bool
    {
        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }
        return $post->delete();
    }

    /**
     * Toggle like or unlike post
     */
    public function toggleLike(Post $post, int $userId): string
    {
        $like = Like::withTrashed()
            ->where('user_id', $userId)
            ->where('post_id', $post->id)
            ->first();

        if (!$like) {
            $post->likes()->create(['user_id' => $userId]);
            return 'Post liked.';
        }

        if ($like->trashed()) {
            $like->restore();
            return 'Like restored.';
        }

        $like->delete();
        return 'Post unliked.';
    }

    /**
     * Toggle share or unshare post
     */
    public function toggleShare(Post $post, int $userId): array
    {
        $share = Share::withTrashed()
            ->where('user_id', $userId)
            ->where('post_id', $post->id)
            ->first();

        if (!$share) {
            try {
                $post->shares()->create(['user_id' => $userId]);
                return ['status' => 'success', 'message' => 'Post shared.'];
            } catch (\Exception $e) {
                return ['status' => 'info', 'message' => 'Already shared.'];
            }
        }

        if ($share->trashed()) {
            $share->restore();
            return ['status' => 'success', 'message' => 'Share restored.'];
        }

        $share->delete();
        return ['status' => 'success', 'message' => 'Post unshared.'];
    }
}
