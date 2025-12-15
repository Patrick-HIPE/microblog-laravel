import AppLayout from '../layouts/app-layout';
import CommentModal from '../components/CommentModal';
import { dashboard } from '../routes';
import { BreadcrumbItem, Post as PostType } from '../types'; 
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import Post from '@/components/Post';
import { Heart } from 'lucide-react';
import FlashMessage from '@/components/flash-message';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: dashboard().url },
];

interface DashboardProps {
    posts?: PostType[];
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
    const [posts, setPosts] = useState<PostType[]>(initialPosts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null);

    const handlePostClick = (postId: number) => {
        router.get(route('posts.show', postId));
    };

    const handleLike = (postId: number) => {
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
            onError: () => console.error("Failed to like post")
        });
    };

    const handleShare = (postId: number) => {
        setPosts((currentPosts) =>
            currentPosts.map((post) => {
                if (post.id === postId) {
                    const isNowShared = !post.shared_by_user;
                    
                    return {
                        ...post,
                        // 2. Update the boolean
                        shared_by_user: isNowShared,
                        // 3. Update the count
                        shares_count: isNowShared 
                            ? (post.shares_count || 0) + 1 
                            : (post.shares_count || 0) - 1
                    };
                }
                return post;
            })
        );

        // 4. Send request to server
        router.post(route('posts.share', postId), {}, {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                console.error("Failed to share post");
                // Optional: Revert state here if you want strict error handling
            }
        });
    };

    const openCommentModal = (post: PostType) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const closeCommentModal = () => {
        setIsModalOpen(false);
        setSelectedPost(null);
    };

    const handlePostUpdate = (updatedPost: PostType) => {
        setSelectedPost(updatedPost);
        setPosts((prevPosts) => 
            prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            <FlashMessage />
            
            <div className="flex flex-1 flex-col items-center bg-neutral-100 p-4 dark:bg-black/10">
                <div className="w-full max-w-[680px] space-y-4">

                    {posts.length ? (
                        <div className="flex flex-col gap-4">
                            {posts.map((post) => (
                                <Post
                                    key={post.id}
                                    post={post}
                                    currentUserId={auth.user.id}
                                    onLike={handleLike}
                                    onComment={openCommentModal}
                                    onClick={handlePostClick}
                                    onShare={handleShare}
                                />
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