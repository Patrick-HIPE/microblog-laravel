// components/CommentModal.tsx
import { useForm, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { X, User, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Post, Comment, User as UserType } from '@/types';

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post | null;
    currentUser: {
        id: number;
        name: string;
        avatar?: string;
    };
    onPostUpdate: (updatedPost: Post) => void;
}

export default function CommentModal({ 
    isOpen, 
    onClose, 
    post: activePost, 
    currentUser, 
    onPostUpdate 
}: CommentModalProps) {
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const { data, setData, post: submitCreate, processing, reset, clearErrors } = useForm({
        body: '',
    });

    const editCommentForm = useForm({
        body: '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
            setEditingCommentId(null);
            setOpenMenuId(null);
            editCommentForm.reset();
        }
    }, [isOpen]);

    if (!isOpen || !activePost) return null;

    const toggleCommentMenu = (e: React.MouseEvent, commentId: number) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === commentId ? null : commentId);
    };

    const startEditing = (comment: Comment) => {
        setEditingCommentId(comment.id);
        editCommentForm.setData('body', comment.body);
        setOpenMenuId(null);
    };

    const cancelEditing = () => {
        setEditingCommentId(null);
        editCommentForm.reset();
    };

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!activePost) return;

        submitCreate(route('posts.comments.store', activePost.id), {
            preserveScroll: true,
            onStart: () => {
                const tempComment: Comment = {
                    id: Math.random(),
                    body: data.body,
                    created_at: new Date().toISOString(),
                    user: currentUser as unknown as UserType 
                };

                const updatedPost = {
                    ...activePost,
                    comments: activePost.comments ? [...activePost.comments, tempComment] : [tempComment],
                    comments_count: (activePost.comments_count ?? 0) + 1,
                };
                
                onPostUpdate(updatedPost);
            },
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const submitEditComment = (e: React.FormEvent, commentId: number) => {
        e.preventDefault();
        
        editCommentForm.put(route('posts.comments.update', commentId), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingCommentId(null);
                
                if (!activePost.comments) return;

                const updatedPost = {
                    ...activePost,
                    comments: activePost.comments.map(c => 
                        c.id === commentId ? { ...c, body: editCommentForm.data.body } : c
                    )
                };
                
                onPostUpdate(updatedPost);
            }
        });
    };

    const deleteComment = (commentId: number) => {
        setOpenMenuId(null);
        if (!confirm('Are you sure you want to delete this comment?')) return;

        router.delete(route('posts.comments.destroy', commentId), {
            preserveScroll: true,
            onSuccess: () => {
                if (!activePost.comments) return;

                const updatedPost = {
                    ...activePost,
                    comments: activePost.comments.filter(c => c.id !== commentId),
                    comments_count: Math.max(0, (activePost.comments_count ?? 0) - 1)
                };

                onPostUpdate(updatedPost);
            }
        });
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 md:p-8 backdrop-blur-sm transition-opacity overflow-y-auto"
            onClick={onClose}
        >
            <div 
                className="flex flex-col w-full max-h-[90vh] max-w-lg sm:max-w-xl md:max-w-2xl mx-auto my-auto rounded-xl bg-white shadow-xl ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 rounded-t-xl dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">Comments</h3>
                    <button 
                        onClick={onClose}
                        className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Comment List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activePost.comments && activePost.comments.length > 0 ? (
                        activePost.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 group">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center dark:bg-neutral-800">
                                        <User className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                    </div>
                                </div>

                                <div className="flex-1 relative">
                                    {editingCommentId === comment.id ? (
                                        <form onSubmit={(e) => submitEditComment(e, comment.id)} className="w-full">
                                            <textarea
                                                value={editCommentForm.data.body}
                                                onChange={(e) => editCommentForm.setData('body', e.target.value)}
                                                className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-black focus:ring-black dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                                                rows={2}
                                                autoFocus
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    type="submit"
                                                    disabled={editCommentForm.processing}
                                                    className="text-xs bg-black text-white px-3 py-1 rounded hover:bg-neutral-800 dark:bg-white dark:text-black"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEditing}
                                                    className="text-xs text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="relative rounded-lg bg-neutral-50 p-3 pb-6 dark:bg-neutral-800">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                    {comment.user?.name || 'User'}
                                                </span>
                                                <span className="text-xs text-neutral-500">{new Date(comment.created_at).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{comment.body}</p>

                                            {currentUser.id === comment.user.id && (
                                                <>
                                                    <button 
                                                        onClick={(e) => toggleCommentMenu(e, comment.id)}
                                                        className="absolute bottom-2 right-2 rounded-full p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>

                                                    {openMenuId === comment.id && (
                                                        <div className="absolute right-0 top-full mt-1 z-20 min-w-[120px] overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                                                            <div className="py-1">
                                                                <button
                                                                    onClick={() => startEditing(comment)}
                                                                    className="flex w-full items-center gap-2 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteComment(comment.id)}
                                                                    className="flex w-full items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-neutral-500 py-6">
                            No comments yet. Be the first to share your thoughts!
                        </p>
                    )}
                </div>

                {/* Create Form */}
                <form onSubmit={submitComment} className="border-t border-neutral-200 p-4 sm:p-5 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-b-xl">
                    <div className="mb-4">
                        <label htmlFor="comment" className="mb-2 block text-xs font-medium text-neutral-500">
                            Your Comment
                        </label>
                        <textarea
                            id="comment"
                            rows={3}
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Write your thoughts..."
                            className="w-full resize-none rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm focus:border-black focus:ring-black dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-white dark:focus:ring-white"
                            required
                        />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.body.trim()}
                            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200 cursor-pointer"
                        >
                            {processing ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}