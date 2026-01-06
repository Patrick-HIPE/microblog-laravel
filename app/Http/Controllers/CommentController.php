<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CommentController extends Controller
{
    use AuthorizesRequests;

    public function store(StoreCommentRequest $request, Post $post)
    {
        $data = $request->validated();

        $post->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $data['body'],
        ]);

        return redirect()->back()->with('message', 'Comment created successfully!');
    }

    public function update(UpdateCommentRequest $request, Comment $comment)
    {
        $this->authorize('update', $comment);

        $request->validated();

        $comment->update(['body' => $request->body]);

        return redirect()->back()->with('message', 'Comment updated successfully!');
    }

    public function destroy(Comment $comment)
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return redirect()->back()->with('message', 'Comment deleted successfully!');
    }
}
