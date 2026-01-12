import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { User as UserIcon } from "lucide-react";
import { BreadcrumbItem, Post as PostType } from "@/types";
import { useState, useEffect } from "react"; 
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import Post from "@/components/Post";
import CommentModal from "@/components/CommentModal";
import FlashMessage from '@/components/flash-message';

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
    { title: "Profile", href: "/profile" },
];

export interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    avatar?: string | null;
    followers: { id: number }[];
    following: { id: number }[];
}

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
    user: User;
    posts: PaginationMeta; 
    current_user_id: number | null;
    user_is_followed: boolean;
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

export default function Show({
    user,
    posts,
    current_user_id,
    user_is_followed,
}: Props) {
    const { auth } = usePage<PageProps>().props;

    const [isFollowed, setIsFollowed] = useState(user_is_followed);

    // Update normalization to safely handle the user object and avatar_url
    const normalizePosts = (rawPosts: PostType[]) => {
        return rawPosts.map((p) => ({
            ...p,
            likes_count: p.likes_count ?? 0,
            comments_count: p.comments_count ?? 0,
            shares_count: p.shares_count ?? 0,
            liked_by_user: p.liked_by_user ?? false,
            // Ensure the user fallback includes the avatar_url key to match types
            user: p.user ?? { id: 0, name: "Unknown User", avatar: null },
        }));
    };

    const [prevPostsData, setPrevPostsData] = useState(posts.data);
    const [postsState, setPosts] = useState<PostType[]>(normalizePosts(posts.data));

    // Effect to handle data updates from pagination or Inertia reloads
    if (posts.data !== prevPostsData) {
        setPrevPostsData(posts.data);
        setPosts(normalizePosts(posts.data));
    }

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null);

    const isOwnProfile = current_user_id === user.id;

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

    const handleFollow = () => {
        router.post(
            route("users.toggle-follow", { user: user.id }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setIsFollowed((prev) => !prev),
            }
        );
    };

    const handlePostClick = (postId: number) => {
        router.get(route("posts.show", postId));
    };

    const handleLike = (postId: number) => {
        setPosts((current) =>
            current.map((post) => {
                if (post.id !== postId) return post;
                const isNowLiked = !post.liked_by_user;
                return {
                    ...post,
                    liked_by_user: isNowLiked,
                    likes_count: isNowLiked
                        ? post.likes_count + 1
                        : post.likes_count - 1,
                };
            })
        );

        router.post(
            route("posts.toggle-like", postId),
            {},
            { preserveScroll: true, preserveState: true }
        );
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
        setPosts((prev) =>
            prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
        );
    };

    const handleDelete = (postId: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        router.delete(route('posts.destroy', postId), {
            onSuccess: () => setPosts((prev) => prev.filter((p) => p.id !== postId)),
        });
    };

    const handleEdit = (post: PostType) => {
        router.get(route('posts.edit', post.id));
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />
            <FlashMessage />

            <div className="p-6">
                <div className="flex flex-col gap-4 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-20 h-20 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                                    <UserIcon className="h-10 w-10 text-neutral-500 dark:text-neutral-300" />
                                </div>
                            )}

                            <div>
                                <h2 className="text-2xl font-bold">
                                    {user.name}
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                className="cursor-pointer"
                                onClick={() => router.get(route("profile.followers", { user: user.id }))}
                            >
                                followers ({user.followers.length})
                            </Button>

                            <Button
                                className="cursor-pointer"
                                onClick={() => router.get(route("profile.following", { user: user.id }))}
                            >
                                following ({user.following.length})
                            </Button>

                            {!isOwnProfile && (
                                <Button
                                    onClick={handleFollow}
                                    className={`cursor-pointer ${
                                        isFollowed
                                            ? "bg-neutral-500 hover:bg-neutral-600"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                >
                                    {isFollowed ? "Following" : "Follow"}
                                </Button>
                            )}
                        </div>
                    </div>

                    <hr />

                    <h3 className="text-lg font-semibold">Posts</h3>

                    {postsState.length ? (
                        <>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {postsState.map((post: PostType) => (
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
                        <div className="text-center py-12 text-neutral-500">
                            This user hasn’t posted anything yet.
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