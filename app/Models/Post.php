<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use SoftDeletes;

    protected $fillable = ['content', 'image', 'user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function shares()
    {
        return $this->hasMany(Share::class);
    }

    protected static function booted()
    {
        static::deleting(function ($post) {
            if (!$post->isForceDeleting()) {
                $post->likes()->delete();
                $post->comments()->delete();
                $post->shares()->delete();
            }
        });

        static::restoring(function ($post) {
            $post->likes()->withTrashed()->restore();
            $post->comments()->withTrashed()->restore();
            $post->shares()->withTrashed()->restore();
        });
    }
}
