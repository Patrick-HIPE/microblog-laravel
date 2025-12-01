<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Post;
use App\Models\Comment;
use App\Http\Requests\StoreCommentRequest;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, Post $post) 
    {
        $data = $request->validated();

        $post->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $data['body'],
        ]);

        return redirect()->route('dashboard')->with('message', 'Comment created successfully!');
    }
}
