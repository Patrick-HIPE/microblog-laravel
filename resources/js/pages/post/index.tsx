import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Post as PostType, User as UserType } from "@/types";
import { Head, Link, router, usePage } from '@inertiajs/react'; 
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import FlashMessage from '@/components/flash-message';
import CommentModal from '@/components/CommentModal';
import Post from '@/components/Post';
import { useState, useEffect } from 'react';
import { Heart, Grid as GridIcon, Plus } from 'lucide-react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Posts', href: route('posts.index') },
];

interface PaginationMeta {
    data: PostType[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Props {
    posts: PaginationMeta;
    auth_user?: UserType;
}

interface PageProps {
    auth: {
        user: UserType;
    };
    [key: string]: unknown;
}

export default function Index({ posts, auth_user }: Props) {
    const { auth } = usePage<PageProps>().props; 
    
    const currentUser = auth_user || auth.user;

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

    const [postsState, setPosts] = useState<PostType[]>(normalizePosts(posts.data));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null);

    // Sync state when server data changes (pagination or page reload)
    useEffect(() => {
        const normalized = normalizePosts(posts.data);
        setPosts(normalized);

        // If a modal is open, ensure it gets the fresh data so creating comments works immediately
        if (selectedPost) {
            const updatedPost = normalized.find(p => p.id === selectedPost.id);
            if (updatedPost) {
                setSelectedPost(updatedPost);
            }
        }
    }, [posts.data]);

    const handleDelete = (postId: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        router.delete(route('posts.destroy', postId), {
            onSuccess: () => setPosts((prev) => prev.filter((p) => p.id !== postId)),
        });
    };

    const handleEdit = (post: PostType) => {
        router.get(route('posts.edit', post.id));
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
            onError: () => {
                console.error("Failed to share post");
            }
        });
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > posts.last_page || page === posts.current_page) return;
        
        router.get(window.location.pathname, { page }, {
            preserveState: true,
            preserveScroll: false, 
            onSuccess: () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;
        const { current_page, last_page } = posts;

        if (last_page <= maxVisiblePages) {
            for (let i = 1; i <= last_page; i++) items.push(i);
        } else {
            items.push(1);
            if (current_page > 3) items.push('ellipsis-start');
            const start = Math.max(2, current_page - 1);
            const end = Math.min(last_page - 1, current_page + 1);
            for (let i = start; i <= end; i++) items.push(i);
            if (current_page < last_page - 2) items.push('ellipsis-end');
            items.push(last_page);
        }

        return items.map((item, index) => {
            if (typeof item === 'number') {
                return (
                    <PaginationItem key={index}>
                        <PaginationLink
                            href="#"
                            isActive={item === posts.current_page}
                            onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(item);
                            }}
                        >
                            {item}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
            return (
                <PaginationItem key={index}>
                    <PaginationEllipsis />
                </PaginationItem>
            );
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Posts" />
            <FlashMessage />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-4 sm:p-6 lg:p-8">
                
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <GridIcon className="h-6 w-6 text-neutral-500" />
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

                        <div className="mt-10">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious 
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(posts.current_page - 1);
                                            }}
                                            className={posts.current_page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {renderPaginationItems()}

                                    <PaginationItem>
                                        <PaginationNext 
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(posts.current_page + 1);
                                            }}
                                            className={posts.current_page >= posts.last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 py-24 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="mb-4 rounded-full bg-white p-4 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
                            <Heart className="h-8 w-8 text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No posts created yet</h3>
                        <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto mb-6">
                            You haven't shared anything yet. Create your first post to start building your collection.
                        </p>
                        <Link href={route('posts.create')}>
                            <Button variant="outline" className="cursor-pointer">
                                Create your first post
                            </Button>
                        </Link>
                    </div>
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