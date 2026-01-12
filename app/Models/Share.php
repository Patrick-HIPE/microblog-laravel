<?php

namespace App\Models;

use App\Models\User;
use App\Models\Post;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Share extends Model
{
    use SoftDeletes;
    
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
