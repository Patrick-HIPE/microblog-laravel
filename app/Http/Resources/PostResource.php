<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'content' => $this->content,
            'image_url' => $this->image ? Storage::url($this->image) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            'likes_count' => $this->likes_count ?? $this->likes->count(),
            'shares_count' => $this->shares_count ?? $this->shares->count(),
            'comments_count' => $this->comments_count ?? $this->comments->count(),
            
            'liked_by_user' => $user ? $this->likes->contains('user_id', $user->id) : false,
            'shared_by_user' => $user ? $this->shares->contains('user_id', $user->id) : false,

            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar' => $this->user->avatar ? Storage::url($this->user->avatar) : null,
            ],

            'can' => [
                'update' => $user ? $user->can('update', $this->resource) : false,
                'delete' => $user ? $user->can('delete', $this->resource) : false,
            ],

            'comments' => $this->whenLoaded('comments', function() {
                return $this->comments->map(fn($comment) => [
                    'id' => $comment->id,
                    'body' => $comment->body,
                    'created_at' => $comment->created_at,
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'avatar' => $comment->user->avatar ? Storage::url($comment->user->avatar) : null,
                    ],
                ]);
            }),
        ];
    }
}