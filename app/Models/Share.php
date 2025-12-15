<?php

namespace App\Models;

use App\Models\User;
use App\Models\Post;
use Illuminate\Database\Eloquent\Model;

class Share extends Model
{
    protected $fillable = [
        'user_id',
        'post_id',
    ];

    public function user() 
    {
        $this->belongsTo(User::class);
    }

    public function post()
    {
        $this->belongsTo(Post::class);
    }
}
