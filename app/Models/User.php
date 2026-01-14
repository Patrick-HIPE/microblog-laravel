<?php

namespace App\Models;

use App\Models\Post;
use App\Models\Like;
use App\Models\Comment;
use App\Models\Share;
use App\Models\Follow;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, SoftDeletes, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::deleting(function (User $user) {
            
            $user->posts()->get()->each->delete();
            $user->comments()->delete();
            $user->likes()->delete();
            $user->shares()->delete();

            Follow::where('user_id', $user->id)
                ->orWhere('follower_id', $user->id)
                ->delete();
        });

        static::restoring(function (User $user) {
            $user->posts()->restore();
            $user->comments()->restore();
            $user->likes()->restore();
            $user->shares()->restore();
            
            Follow::withTrashed()
                ->where('user_id', $user->id)
                ->orWhere('follower_id', $user->id)
                ->restore();
        });
    }

    public function posts() { return $this->hasMany(Post::class); }
    public function comments() { return $this->hasMany(Comment::class); }


    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'user_id', 'follower_id')
            ->using(Follow::class) 
            ->wherePivotNull('deleted_at')
            ->withTimestamps();
    }

    public function following()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'user_id')
            ->using(Follow::class) 
            ->wherePivotNull('deleted_at') 
            ->withTimestamps();
    }

    public function isFollowing(User $user): bool
    {
        return $this->following()->where('user_id', $user->id)->exists();
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function likedPosts()
    {
        return $this->belongsToMany(Post::class, 'likes')->withTimestamps();
    }

    public function hasLiked(Post $post): bool
    {
        return $this->likes()->where('post_id', $post->id)->exists();
    }

    public function shares()
    {
        return $this->hasMany(Share::class);
    }

    public function sharedPosts()
    {
        return $this->belongsToMany(Post::class, 'shares')->withTimestamps();
    }

    public function hasShared(Post $post): bool
    {
        return $this->shares()->where('post_id', $post->id)->exists();
    }
}