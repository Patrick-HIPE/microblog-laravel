import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Post as PostType } from "@/types";
import { Head, Link, router } from '@inertiajs/react'; 
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import FlashMessage from '@/components/flash-message';
import CommentModal from '@/components/CommentModal';
import Post from '@/components/Post';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Posts', href: route('posts.index') },
];

interface Props {
    posts: PostType[];
}

export default function Index({ posts: initialPosts }: Props) {
    const [posts, setPosts] = useState(
        initialPosts.map((p) => ({
            ...p,
            updated_at: p.updated_at || p.created_at,
            likes_count: p.likes_count ?? 0,
            comments_count: p.comments_count ?? 0,
            shares_count: p.shares_count ?? 0,
            liked_by_user: p.liked_by_user ?? false,
            user: p.user ?? { id: 0, name: 'Unknown User' },
        }))
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null);

    const handleDelete = (postId: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        router.delete(route('posts.destroy', postId), {
            onSuccess: () => setPosts((prev) => prev.filter((p) => p.id !== postId)),
        });
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

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-1 flex-col gap-4 rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">My Posts</h2>
                        <Link href={route('posts.create')}>
                            <Button className="cursor-pointer">Create</Button>
                        </Link>
                    </div>

                    {posts.length ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <Post
                                    key={post.id}
                                    post={post}
                                    currentUserId={post.user.id}
                                    onLike={handleLike}
                                    onComment={openCommentModal}
                                    onClick={handlePostClick}
                                >
                                    <div className="flex justify-end mt-2">
                                        <button
                                            onClick={() => router.get(route('posts.edit', post.id))}
                                            className="mr-2 text-blue-600 hover:underline text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="text-red-600 hover:underline text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </Post>
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

            <CommentModal
                isOpen={isModalOpen}
                onClose={closeCommentModal}
                post={selectedPost}
                currentUser={{ id: posts[0]?.user.id ?? 0, name: posts[0]?.user.name ?? 'User' }}
                onPostUpdate={handlePostUpdate}
            />
        </AppLayout>
    );
}
