import AppLayout from '../layouts/app-layout';
import CommentModal from '../components/CommentModal';
import { dashboard } from '../routes';
import { BreadcrumbItem, Post as PostType } from '../types'; 
import { Head, router, usePage } from '@inertiajs/react'; 
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react'; 
import Post from '@/components/Post';
import { Heart } from 'lucide-react'; 
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
    { title: 'Home', href: dashboard().url },
];

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface DashboardProps {
    posts?: PostType[];
    pagination: PaginationMeta; 
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

export default function Dashboard({ posts: initialPosts = [], pagination }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const [posts, setPosts] = useState<PostType[]>(initialPosts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null);

    useEffect(() => {
        setPosts(initialPosts);
    }, [initialPosts]);

    const handlePostClick = (postId: number) => {
        router.get(route('posts.show', postId));
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.last_page || page === pagination.current_page) return;
        
        router.get(window.location.pathname, { page }, {
            preserveState: true,
            preserveScroll: false,
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

    const openCommentModal = (post: PostType) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const closeCommentModal = () => {
        setIsModalOpen(false);
        setSelectedPost(null);
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

    const handlePostUpdate = (updatedPost: PostType) => {
        setSelectedPost(updatedPost);
        setPosts((prevPosts) => 
            prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
        );
    };

    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5; 
        const { current_page, last_page } = pagination;

        if (last_page <= maxVisiblePages) {
            for (let i = 1; i <= last_page; i++) {
                items.push(i);
            }
        } else {
            items.push(1);

            if (current_page > 3) {
                items.push('ellipsis-start');
            }

            const start = Math.max(2, current_page - 1);
            const end = Math.min(last_page - 1, current_page + 1);

            for (let i = start; i <= end; i++) {
                items.push(i);
            }

            if (current_page < last_page - 2) {
                items.push('ellipsis-end');
            }

            items.push(last_page);
        }

        return items.map((item, index) => {
            if (typeof item === 'number') {
                return (
                    <PaginationItem key={index}>
                        <PaginationLink
                            href="#"
                            isActive={item === pagination.current_page}
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
            <Head title="Home" />
            <FlashMessage />
            
            <div className="flex flex-1 flex-col items-center bg-neutral-100 p-4 dark:bg-black/10">
                <div className="w-full max-w-[680px] space-y-4">

                    {posts.length ? (
                        <>
                            <div className="flex flex-col gap-4">
                                {posts.map((post) => (
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

                            <div className="py-4">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious 
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePageChange(pagination.current_page - 1);
                                                }}
                                                className={pagination.current_page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>

                                        {renderPaginationItems()}

                                        <PaginationItem>
                                            <PaginationNext 
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePageChange(pagination.current_page + 1);
                                                }}
                                                className={pagination.current_page >= pagination.last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </>
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