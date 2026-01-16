<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use App\Services\CommentService;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;

class CommentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected CommentService $commentService
    ) {}

    public function store(StoreCommentRequest $request, Post $post): RedirectResponse
    {
        $this->commentService->createComment(
            $post,
            $request->user(),
            $request->validated()
        );

        return redirect()->back()->with('message', 'Comment created successfully!');
    }

    public function update(UpdateCommentRequest $request, Comment $comment): RedirectResponse
    {
        $this->authorize('update', $comment);

        $this->commentService->updateComment(
            $comment,
            $request->validated()
        );

        return redirect()->back()->with('message', 'Comment updated successfully!');
    }

    public function destroy(Comment $comment): RedirectResponse
    {
        $this->authorize('delete', $comment);

        $this->commentService->deleteComment($comment);

        return redirect()->back()->with('message', 'Comment deleted successfully!');
    }
}
