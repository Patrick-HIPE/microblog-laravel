import { useForm, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { X, User, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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
    const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const { data, setData, post: submitCreate, processing, reset, clearErrors, errors } = useForm({
        body: '',
    });

    const editCommentForm = useForm({
        body: '',
    });

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleScroll = () => {
            if (openMenuId !== null) setOpenMenuId(null);
        };
        const container = scrollContainerRef.current;
        if (container) container.addEventListener('scroll', handleScroll);
        return () => {
            if (container) container.removeEventListener('scroll', handleScroll);
        };
    }, [openMenuId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openMenuId !== null && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') handleClose();
            };
            document.addEventListener('keydown', handleEsc);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('keydown', handleEsc);
            };
        }
    }, [openMenuId, isOpen]);

    const handleClose = () => {
        reset();
        clearErrors();
        editCommentForm.reset();
        editCommentForm.clearErrors();
        setEditingCommentId(null);
        setOpenMenuId(null);
        setMenuPosition(null);
        onClose();
    };

    if (!isOpen || !activePost) return null;

    const toggleCommentMenu = (e: React.MouseEvent<HTMLButtonElement>, commentId: number) => {
        e.stopPropagation();
        
        if (openMenuId === commentId) {
            setOpenMenuId(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const menuHeight = 100; 

        if (spaceBelow < menuHeight) {
            setMenuPosition({
                top: rect.top - menuHeight + 10, 
                right: window.innerWidth - rect.right
            });
        } else {
            setMenuPosition({
                top: rect.bottom + 5,
                right: window.innerWidth - rect.right
            });
        }

        setOpenMenuId(commentId);
    };

    const startEditing = (comment: Comment) => {
        setEditingCommentId(comment.id);
        editCommentForm.setData('body', comment.body);
        editCommentForm.clearErrors(); 
        setOpenMenuId(null);
    };

    const cancelEditing = () => {
        setEditingCommentId(null);
        editCommentForm.reset();
        editCommentForm.clearErrors();
    };

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activePost) return;

        submitCreate(route('comments.store', activePost.id), {
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
                setTimeout(() => {
                    if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                    }
                }, 10);
            },
        });
    };

    const submitEditComment = (e: React.FormEvent, commentId: number) => {
        e.preventDefault();
        
        editCommentForm.put(route('comments.update', commentId), {
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

        router.delete(route('comments.destroy', commentId), {
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

    const activeMenuComment = activePost.comments?.find(c => c.id === openMenuId);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 md:p-8 backdrop-blur-sm transition-opacity"
            onClick={handleClose} 
        >
            <div 
                className="flex flex-col w-full max-h-[90vh] max-w-lg sm:max-w-xl md:max-w-2xl mx-auto my-auto rounded-xl bg-white shadow-xl ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 rounded-t-xl dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10 shrink-0">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">Comments</h3>
                    <button 
                        onClick={handleClose} 
                        className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]"
                >
                    {activePost.comments && activePost.comments.length > 0 ? (
                        activePost.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 group relative">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center dark:bg-neutral-800">
                                        {comment.user.avatar ? (
                                            <img src={comment.user.avatar} alt={comment.user.name} className="h-8 w-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                                                <User className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 relative">
                                    {editingCommentId === comment.id ? (
                                        <form onSubmit={(e) => submitEditComment(e, comment.id)} className="w-full animate-in fade-in duration-200">
                                            <textarea
                                                value={editCommentForm.data.body}
                                                onChange={(e) => {
                                                    editCommentForm.setData('body', e.target.value);
                                                    editCommentForm.clearErrors('body');
                                                }}
                                                className={`w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm dark:bg-neutral-800 dark:text-white
                                                    ${editCommentForm.errors.body 
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                                        : 'border-neutral-300 focus:border-black focus:ring-black dark:border-neutral-600'
                                                    }
                                                `}
                                                rows={2}
                                                autoFocus
                                            />
                                            {editCommentForm.errors.body && (
                                                <p className="mt-1 text-xs text-red-500">{editCommentForm.errors.body}</p>
                                            )}

                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    type="submit"
                                                    disabled={editCommentForm.processing}
                                                    className="text-sm bg-black text-white px-3 py-1.5 rounded-md hover:bg-neutral-800 dark:bg-white dark:text-black font-medium transition-colors cursor-pointer"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEditing}
                                                    className="text-sm text-neutral-600 px-3 py-1.5 rounded-md hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="relative rounded-lg bg-neutral-50 p-3 pb-6 dark:bg-neutral-800 group-hover:bg-neutral-100 dark:group-hover:bg-neutral-750 transition-colors">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                    {comment.user?.name || 'User'}
                                                </span>
                                                <span className="text-xs text-neutral-500">{new Date(comment.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
                                            </div>
                                            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">{comment.body}</p>

                                            {currentUser.id === comment.user.id && (
                                                <div className="absolute bottom-2 right-2">
                                                    <button 
                                                        onClick={(e) => toggleCommentMenu(e, comment.id)}
                                                        className={`rounded-full p-1.5 transition-colors cursor-pointer ${
                                                            openMenuId === comment.id
                                                            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white' 
                                                            : 'text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300'
                                                        }`}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <p className="text-sm text-neutral-500 mb-2">No comments yet.</p>
                            <p className="text-xs text-neutral-400">Be the first to share your thoughts!</p>
                        </div>
                    )}
                </div>

                <form onSubmit={submitComment} className="border-t border-neutral-200 p-4 sm:p-5 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-b-xl z-10 shrink-0">
                    <div className="flex gap-3">
                        <div className="hidden sm:block flex-shrink-0">
                             <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center dark:bg-neutral-800">
                                {currentUser.avatar ? (
                                    <img src={currentUser.avatar} alt={currentUser.name} className="h-8 w-8 rounded-full object-cover" />
                                ) : (
                                    <User className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <textarea
                                rows={1}
                                value={data.body}
                                onChange={(e) => {
                                    setData('body', e.target.value);
                                    if (errors.body) clearErrors('body');
                                }}
                                placeholder="Add a comment..."
                                className={`w-full resize-none rounded-lg border bg-neutral-50 px-3 py-2.5 text-sm dark:bg-neutral-800 dark:text-white min-h-[44px]
                                    ${errors.body 
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                        : 'border-neutral-300 focus:border-black focus:ring-black dark:border-neutral-700 dark:focus:border-white dark:focus:ring-white'
                                    }
                                `}
                                required
                            />
                            {errors.body && (
                                <p className="mt-1 text-xs text-red-500 animate-in fade-in slide-in-from-top-1">
                                    {errors.body}
                                </p>
                            )}

                            {data.body.trim().length > 0 && (
                                <div className="mt-2 flex justify-end gap-2 animate-in fade-in slide-in-from-top-1">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors cursor-pointer"
                                    >
                                        {processing ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                {openMenuId && activeMenuComment && menuPosition && (
                    <div 
                        ref={menuRef}
                        style={{ 
                            position: 'fixed', 
                            top: menuPosition.top, 
                            right: menuPosition.right 
                        }}
                        className="z-[9999] min-w-[140px] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-100"
                    >
                        <div className="p-1">
                            <button
                                onClick={() => startEditing(activeMenuComment)}
                                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-700 rounded-md hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => deleteComment(activeMenuComment.id)}
                                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 rounded-md hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}