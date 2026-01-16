import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Post as PostType, User as UserType } from "@/types";
import { Head, Link, router, usePage } from '@inertiajs/react'; 
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import FlashMessage from '@/components/flash-message';
import CommentModal from '@/components/CommentModal';
import Post from '@/components/Post';
import EmptyState from "@/components/EmptyState";
import { useState, useEffect, useMemo } from 'react';
import { FileText, Plus } from 'lucide-react';
import PaginationLinks from '@/components/PaginationLinks';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Posts', href: route('posts.index') },
];

interface Props {
    posts: {
        data: PostType[];
        links: {
            first: string;
            last: string;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            last_page: number;
            from: number;
            to: number;
            total: number;
            path: string;
            per_page: number;
        };
    };
    auth_user?: UserType;
}

interface PageProps {
    auth: {
        user: UserType;
    };
    [key: string]: unknown;
}

const normalizePosts = (rawPosts: PostType[]) => {
    return rawPosts.map((p) => ({
        ...p,
        updated_at: p.updated_at || p.created_at,
        likes_count: p.likes_count ?? 0,
        comments_count: p.comments_count ?? 0,
        shares_count: p.shares_count ?? 0,
        liked_by_user: p.liked_by_user ?? false,
        user: p.user ?? { id: 0, name: 'Unknown User' },
    }));
};

export default function Index({ posts, auth_user }: Props) {
    const { auth } = usePage<PageProps>().props; 
    const currentUser = auth_user || auth.user;

    const normalizedData = useMemo(() => normalizePosts(posts.data), [posts.data]);

    const [postsState, setPosts] = useState<PostType[]>(normalizedData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null);

    useEffect(() => {
        setPosts(normalizedData);
    }, [normalizedData]);

    useEffect(() => {
        if (selectedPost) {
            const updated = normalizedData.find(p => p.id === selectedPost.id);
            
            if (updated && updated !== selectedPost) {
                setSelectedPost(updated);
            }
        }
    }, [normalizedData, selectedPost]);

    {/* Handle edit and delete posts */}
 
    const handleEdit = (post: PostType) => {
        router.get(route('posts.edit', post.id));
    };

    const handleDelete = (postId: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        router.delete(route('posts.destroy', postId), {
            preserveScroll: true,
            onSuccess: () => setPosts((prev) => prev.filter((p) => p.id !== postId)),
        });
    };

    {/* Handle like and share posts */}

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

        router.post(route('posts.toggle-like', { post: postId }), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleShare = (postId: number) => {
        setPosts((currentPosts) =>
            currentPosts.map((post) => {
                if (post.id === postId) {
                    const isNowShared = !post.shared_by_user;
                    return {
                        ...post,
                        shared_by_user: isNowShared,
                        shares_count: isNowShared 
                            ? (post.shares_count || 0) + 1 
                            : (post.shares_count || 0) - 1
                    };
                }
                return post;
            })
        );

        router.post(route('posts.share', postId), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handlePostClick = (postId: number) => {
        router.get(route('posts.show', postId));
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
        const normalizedPost = {
            ...updatedPost,
            likes_count: updatedPost.likes_count ?? 0,
            comments_count: updatedPost.comments_count ?? 0,
            shares_count: updatedPost.shares_count ?? 0,
            liked_by_user: updatedPost.liked_by_user ?? false,
            user: updatedPost.user ?? { id: 0, name: 'Unknown User' },
        };

        setSelectedPost(normalizedPost);
        setPosts((prevPosts) =>
            prevPosts.map((p) => (p.id === normalizedPost.id ? normalizedPost : p))
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Posts" />
            <FlashMessage />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-4 sm:p-6 lg:p-8">
                
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            My Posts
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Manage and view your personal collection of posts.
                        </p>
                    </div>
                    <Link href={route('posts.create')}>
                        <Button className="w-full sm:w-auto px-6 font-semibold cursor-pointer shadow-sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Post
                        </Button>
                    </Link>
                </div>

                {postsState.length ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {postsState.map((post) => (
                                <div key={post.id} className="h-full">
                                    <Post
                                        post={post}
                                        currentUserId={auth.user.id}
                                        onClick={handlePostClick}
                                        onLike={handleLike}
                                        onComment={openCommentModal}
                                        onShare={handleShare}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <PaginationLinks meta={posts.meta} />
                        </div>
                    </>
                ) : (
                    <EmptyState
                        icon={FileText}
                        title="No posts created yet"
                        description="You haven't shared anything yet. Create your first post!"
                        action={
                            <Link href={route('posts.create')}>
                                <Button variant="outline" className="cursor-pointer">
                                    Create your first post
                                </Button>
                            </Link>
                        }
                    />
                )}
            </div>

            <CommentModal
                isOpen={isModalOpen}
                onClose={closeCommentModal}
                post={selectedPost}
                currentUser={currentUser}
                onPostUpdate={handlePostUpdate}
            />
        </AppLayout>
    );
}
