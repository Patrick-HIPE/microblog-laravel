import { PlaceholderPattern } from '../components/ui/placeholder-pattern';
import AppLayout from '../layouts/app-layout';
import { dashboard } from '../routes';
import { type BreadcrumbItem } from '../types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Heart, MessageCircle, X, User, Repeat2, Pencil, Trash2, MoreHorizontal } from 'lucide-react'; // Added MoreHorizontal
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: dashboard().url },
];

interface Comment {
    id: number;
    body: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        avatar?: string;
    };
}

interface Post {
    id: number;
    content: string;
    image_url: string | null;
    created_at: string;
    updated_at: string;
    likes_count: number;
    comments_count?: number;
    shares_count?: number;
    liked_by_user: boolean;
    comments?: Comment[];
}

interface DashboardProps {
    posts?: Post[];
}

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            avatar?: string;
        };
    };
    [key: string]: unknown; 
}

export default function Dashboard({ posts = [] }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    
    // Track which comment menu is open
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    // Form for creating comments
    const { data, setData, post, processing, reset, clearErrors } = useForm({
        body: '',
    });

    // Form for editing comments
    const editCommentForm = useForm({
        body: '',
    });

    const handlePostClick = (postId: number) => {
        router.get(route('posts.show', postId));
    };

    const toggleLike = (postId: number) => {
        router.post(route('posts.toggle-like', postId), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const openCommentModal = (e: React.MouseEvent, post: Post) => {
        e.stopPropagation();
        setSelectedPost(post);
        reset();
        clearErrors();
        setEditingCommentId(null);
        setOpenMenuId(null);
        editCommentForm.reset();
        setIsModalOpen(true);
    };

    const closeCommentModal = () => {
        setIsModalOpen(false);
        setSelectedPost(null);
        reset();
        setEditingCommentId(null);
        setOpenMenuId(null);
    };

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPost) return;

        post(route('posts.comments.store', selectedPost.id), {
            preserveScroll: true,
            onStart: () => {
                const tempComment = {
                    id: Math.random(),
                    body: data.body,
                    created_at: new Date().toISOString(),
                    user: auth.user
                };

                setSelectedPost((prev) => prev ? ({
                    ...prev,
                    comments: prev.comments ? [...prev.comments, tempComment] : [tempComment],
                    comments_count: (prev.comments_count ?? 0) + 1,
                }) : null);
            },
            onSuccess: () => {
                reset();
            },
        });
    };

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

    const submitEditComment = (e: React.FormEvent, commentId: number) => {
        e.preventDefault();
        
        editCommentForm.put(route('posts.comments.update', commentId), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingCommentId(null);
                setSelectedPost((prev) => {
                    if (!prev || !prev.comments) return prev;
                    return {
                        ...prev,
                        comments: prev.comments.map(c => 
                            c.id === commentId ? { ...c, body: editCommentForm.data.body } : c
                        )
                    };
                });
            }
        });
    };

    const deleteComment = (commentId: number) => {
        setOpenMenuId(null);
        if (!confirm('Are you sure you want to delete this comment?')) return;

        router.delete(route('posts.comments.destroy', commentId), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedPost((prev) => {
                    if (!prev || !prev.comments) return prev;
                    return {
                        ...prev,
                        comments: prev.comments.filter(c => c.id !== commentId),
                        comments_count: Math.max(0, (prev.comments_count ?? 0) - 1)
                    };
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-1 flex-col gap-4 rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                    <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Recent Posts</h2>

                    {posts.length ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="group relative cursor-pointer overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                                    onClick={() => handlePostClick(post.id)}
                                >
                                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLike(post.id);
                                            }}
                                            className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm transition-all hover:bg-red-50 hover:text-red-600 dark:bg-neutral-900/80 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                                        >
                                            <Heart
                                                className={`h-4 w-4 transition-colors duration-200 ${
                                                    post.liked_by_user ? 'fill-red-500 text-red-500' : 'text-neutral-500 dark:text-neutral-400'
                                                }`}
                                            />
                                            <span>{post.likes_count ?? 0}</span>
                                        </button>

                                        <button
                                            onClick={(e) => openCommentModal(e, post)}
                                            className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm transition-all hover:bg-blue-50 hover:text-blue-600 dark:bg-neutral-900/80 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                                        >
                                            <MessageCircle className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                            <span>{post.comments_count ?? 0}</span>
                                        </button>
                                        <button
                                            className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm transition-all hover:bg-blue-50 hover:text-blue-600 dark:bg-neutral-900/80 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                                        >
                                            <Repeat2 className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                            <span>{post.shares_count ?? 0}</span>
                                        </button>
                                    </div>

                                    {post.image_url ? (
                                        <div className="aspect-video w-full overflow-hidden">
                                            <img
                                                src={post.image_url}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative aspect-video w-full bg-neutral-100 dark:bg-neutral-900">
                                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                                        </div>
                                    )}

                                    <div className="p-4 pb-12">
                                        <h3 className="mb-2 truncate text-lg font-bold text-neutral-900 dark:text-white">
                                            {post.content.slice(0, 50)}
                                        </h3>
                                        <p className="mb-4 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
                                            {post.content}
                                        </p>
                                        
                                        <div className="flex items-center justify-end text-xs text-neutral-500 dark:text-neutral-500">
                                            <span>{new Date(post.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-neutral-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">No posts created yet</h3>
                            <p className="mt-1 text-sm text-neutral-500">Get started by creating a new post.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && selectedPost && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 md:p-8 backdrop-blur-sm transition-opacity overflow-y-auto"
                    onClick={() => setOpenMenuId(null)} // Close menus when clicking backdrop
                >
                    <div 
                        className="flex flex-col w-full max-h-[90vh] max-w-lg sm:max-w-xl md:max-w-2xl mx-auto my-auto rounded-xl bg-white shadow-xl ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal
                    >
                        
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 rounded-t-xl dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10">
                            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">Comments</h3>
                            <button 
                                onClick={closeCommentModal}
                                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {selectedPost.comments && selectedPost.comments.length > 0 ? (
                                selectedPost.comments.map((comment) => (
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
                                                <div className="relative rounded-lg bg-neutral-50 p-3 pb-6 dark:bg-neutral-800"> {/* Added pb-6 for dots space */}
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                            {comment.user?.name || 'User'}
                                                        </span>
                                                        <span className="text-xs text-neutral-500">{new Date(comment.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{comment.body}</p>

                                                    {/* 3 Dots Menu for Auth User */}
                                                    {auth.user.id === comment.user.id && (
                                                        <>
                                                            {/* Trigger Button */}
                                                            <button 
                                                                onClick={(e) => toggleCommentMenu(e, comment.id)}
                                                                className="absolute bottom-2 right-2 rounded-full p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </button>

                                                            {/* Dropdown Menu */}
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

                        {/* Input Form */}
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
                                    onClick={closeCommentModal}
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
            )}
        </AppLayout>
    );
}