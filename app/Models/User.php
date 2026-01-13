<?php

namespace App\Models;

use App\Models\Post;
use App\Models\Share;
use App\Models\Follow; // <--- Import this
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

    // ... (Your existing Post/Comment methods remain the same) ...
    public function posts() { return $this->hasMany(Post::class); }
    public function comments() { return $this->hasMany(Comment::class); }

    // ▼▼▼ UPDATED RELATIONSHIPS ▼▼▼

    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'user_id', 'follower_id')
            ->using(Follow::class) // Tell Laravel to use the custom Pivot
            ->wherePivotNull('deleted_at') // Filter out soft-deleted followers
            ->withTimestamps();
    }

    public function following()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'user_id')
            ->using(Follow::class) // Tell Laravel to use the custom Pivot
            ->wherePivotNull('deleted_at') // Filter out people you unfollowed
            ->withTimestamps();
    }

    // ▲▲▲ END UPDATES ▲▲▲

    // This stays the same; it automatically uses the filters applied above
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