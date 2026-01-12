import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Post as PostType, User as UserType } from "@/types";
import { Head, Link, router, usePage } from '@inertiajs/react'; 
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import FlashMessage from '@/components/flash-message';
import CommentModal from '@/components/CommentModal';
import Post from '@/components/Post';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

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

    useEffect(() => {
        const normalized = normalizePosts(posts.data);
        setPosts(normalized);

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
            preserveScroll: true, 
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

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-1 flex-col gap-4 rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">My Posts</h2>
                        <Link href={route('posts.create')}>
                            <Button className="cursor-pointer">Create</Button>
                        </Link>
                    </div>

                    {postsState.length ? (
                        <>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {postsState.map((post) => (
                                    <Post
                                        key={post.id}
                                        post={post}
                                        currentUserId={auth.user.id}
                                        onClick={handlePostClick}
                                        onLike={handleLike}
                                        onComment={openCommentModal}
                                        onShare={handleShare}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>

                            <div className="py-4 mt-4">
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
                        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
                                <Heart className="size-6 text-neutral-500" />
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
                currentUser={currentUser}
                onPostUpdate={handlePostUpdate}
            />
        </AppLayout>
    );
}