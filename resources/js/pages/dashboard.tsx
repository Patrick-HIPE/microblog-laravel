// routes/Dashboard.tsx
import AppLayout from '../layouts/app-layout';
import CommentModal from '../components/CommentModal';
import { dashboard } from '../routes';
import { Post, BreadcrumbItem } from '../types'; 
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Heart, MessageCircle, MoreHorizontal, Share2, User } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: dashboard().url },
];

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

export default function Dashboard({ posts: initialPosts = [] }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const handlePostClick = (postId: number) => {
        router.get(route('posts.show', postId));
    };

    const toggleLike = (postId: number) => {
        setPosts((currentPosts) => 
            currentPosts.map((post) => {
                if (post.id === postId) {
                    const isNowLiked = !post.liked_by_user;
                    return {
                        ...post,
                        liked_by_user: isNowLiked,
                        likes_count: isNowLiked 
                            ? (post.likes_count || 0) + 1 
                            : (post.likes_count || 0) - 1
                    };
                }
                return post;
            })
        );

        router.post(route('posts.toggle-like', postId), {}, {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                console.error("Failed to like post");
            }
        });
    };

    const openCommentModal = (e: React.MouseEvent, post: Post) => {
        e.stopPropagation();
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const closeCommentModal = () => {
        setIsModalOpen(false);
        setSelectedPost(null);
    };

    const handlePostUpdate = (updatedPost: Post) => {
        setSelectedPost(updatedPost);
        setPosts((prevPosts) => 
            prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            
            <div className="flex flex-1 flex-col items-center bg-neutral-100 p-4 dark:bg-black/10">
                <div className="w-full max-w-[680px] space-y-4">
                    
                    {posts.length ? (
                        <div className="flex flex-col gap-4">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex flex-col rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                                >
                                    <div className="flex items-center justify-between px-4 pt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                                                <User className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                    {post.user?.name || 'Unknown User'}
                                                </span>
                                                <span className="text-xs text-neutral-500">
                                                    {new Date(post.created_at).toLocaleDateString(undefined, {
                                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div 
                                        className="cursor-pointer px-4 py-3"
                                        onClick={() => handlePostClick(post.id)}
                                    >
                                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-900 dark:text-neutral-100">
                                            {post.content}
                                        </p>
                                    </div>

                                    {post.image_url && (
                                        <div 
                                            className="cursor-pointer overflow-hidden bg-neutral-100 dark:bg-neutral-800"
                                            onClick={() => handlePostClick(post.id)}
                                        >
                                            <img
                                                src={post.image_url}
                                                alt="Post attachment"
                                                className="h-auto w-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}

                                    <div className="mx-4 mt-3 flex items-center justify-between border-b border-neutral-100 pb-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                                        <div className="flex items-center gap-1">
                                            {post.likes_count > 0 && (
                                                <>
                                                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                                                        <Heart className="h-2.5 w-2.5 fill-white text-white" />
                                                    </div>
                                                    <span>{post.likes_count}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex gap-3">
                                            <span>{post.comments_count || 0} comments</span>
                                            <span>{post.shares_count || 0} shares</span>
                                        </div>
                                    </div>

                                    <div className="flex px-2 py-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLike(post.id);
                                            }}
                                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer ${
                                                post.liked_by_user 
                                                    ? 'text-red-600 dark:text-red-500'
                                                    : 'text-neutral-600 dark:text-neutral-400'
                                            }`}
                                        >
                                            <Heart className={`h-5 w-5 ${post.liked_by_user ? 'fill-current' : ''}`} />
                                            Like
                                        </button>

                                        <button
                                            onClick={(e) => openCommentModal(e, post)}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                            Comment
                                        </button>

                                        <button
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
                                        >
                                            <Share2 className="h-5 w-5" />
                                            Share
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white py-12 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-4 rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
                                <Heart className="size-6 text-neutral-500" />
                            </div>
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">No posts yet</h3>
                            <p className="mt-1 text-sm text-neutral-500">Check back later for updates.</p>
                        </div>
                    )}
                </div>
            </div>

            <CommentModal 
                isOpen={isModalOpen}
                onClose={closeCommentModal}
                post={selectedPost}
                currentUser={auth.user}
                onPostUpdate={handlePostUpdate}
            />
        </AppLayout>
    );
}