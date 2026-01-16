<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;

class CommentService
{
    /**
     * Create comment
     */
    public function createComment(Post $post, User $user, array $data): Comment
    {
        return $post->comments()->create([
            'user_id' => $user->id,
            'body' => $data['body'],
        ]);
    }

    /**
     * Update comment
     */
    public function updateComment(Comment $comment, array $data): bool
    {
        return $comment->update([
            'body' => $data['body']
        ]);
    }

    /**
     * Delete comment
     */
    public function deleteComment(Comment $comment): ?bool
    {
        return $comment->delete();
    }
}
