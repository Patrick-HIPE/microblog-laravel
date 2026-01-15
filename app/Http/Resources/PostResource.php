<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use App\Models\Share;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isShare = $this->resource instanceof Share;
        $post = $isShare ? $this->post : $this->resource;

        $isDeleted = !$post || $post->trashed();

        if ($isDeleted && $isShare) {
            return [
                'id' => $this->id,
                'is_share' => true,
                'is_deleted' => true,
                'shared_at' => $this->updated_at,
                'shared_by' => [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'avatar' => $this->user->avatar ? Storage::url($this->user->avatar) : null,
                ],
            ];
        }

        if (!$post) return ['id' => $this->id, 'error' => 'Original post deleted'];

        return [
            'id' => $post->id, 
            'content' => $post->content,
            'image_url' => $post->image ? Storage::url($post->image) : null,
            'created_at' => $post->created_at, 
            
            'likes_count' => $post->likes_count ?? $post->likes()->count(),
            'shares_count' => $post->shares_count ?? $post->shares()->count(),
            'comments_count' => $post->comments_count ?? $post->comments()->count(),
            
            'liked_by_user' => $user ? $post->likes->contains('user_id', $user->id) : false,
            'shared_by_user' => $user ? $post->shares->contains('user_id', $user->id) : false,

            'user' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'avatar' => $post->user->avatar ? Storage::url($post->user->avatar) : null,
            ],

            'shared_at' => $isShare ? $this->updated_at : null,
            'is_share' => $isShare,

            'shared_by' => $isShare ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar' => $this->user->avatar ? Storage::url($this->user->avatar) : null,
            ] : null,

            'can' => [
                'update' => $user ? $user->can('update', $post) : false,
                'delete' => $user ? $user->can('delete', $this->resource) : false,
            ],
        ];
    }
}
