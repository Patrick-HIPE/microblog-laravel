import AppLayout from '@/layouts/app-layout';
import CommentModal from '@/components/CommentModal';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type Post as PostType, type Share as ShareType, type User as UserType } from '@/types'; 
import { Head, router, usePage, Link } from '@inertiajs/react'; 
import { route } from 'ziggy-js';
import { useState } from 'react'; 
import Post from '@/components/Post';
import ShareItem from '@/components/ShareItem';
import { FileText, User } from 'lucide-react'; 
import FlashMessage from '@/components/flash-message';
import EmptyState from "@/components/EmptyState";

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

type FeedItem = PostType | ShareType;

interface PostCollection {
    data: FeedItem[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
}

interface DashboardProps {
    posts: PostCollection;
    auth_user?: UserType;
}

interface PageProps {
    auth: { user: UserType };
    [key: string]: unknown; 
}

const normalizePosts = (rawPosts: FeedItem[]): FeedItem[] => {
    return rawPosts.map((p) => ({
        ...p,
        updated_at: p.updated_at || p.created_at,
        likes_count: p.likes_count ?? 0,
        comments_count: p.comments_count ?? 0,
        shares_count: p.shares_count ?? 0,
        liked_by_user: p.liked_by_user ?? false,
        shared_by_user: p.shared_by_user ?? false,
        user: p.user ?? { id: 0, name: 'Unknown User' },
        is_share: p.is_share ?? false,
        is_deleted: p.is_deleted ?? false,
    })) as FeedItem[];
};

export default function Dashboard({ posts, auth_user }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const currentUser = auth_user || auth.user;

    const normalizedPosts = normalizePosts(posts.data);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

    const selectedPost = selectedPostId 
        ? (normalizedPosts.find(p => p.id === selectedPostId) as PostType) || null 
        : null;

    const handlePostClick = (postId: number) => {
        router.get(route('posts.show', postId));
    };

    const handlePageChange = (page: number) => {
        const { current_page, last_page } = posts.meta;
        if (page < 1 || page > last_page || page === current_page) return;
        
        router.get(window.location.pathname, { page }, {
            preserveState: true,
            preserveScroll: false,
            onSuccess: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        });
    };

    const handleLike = (postId: number) => {
        router.post(route('posts.toggle-like', postId), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleShare = (postId: number) => {
        router.post(route('posts.share', postId), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const openCommentModal = (post: PostType) => {
        setSelectedPostId(post.id);
        setIsModalOpen(true);
    };

    const closeCommentModal = () => {
        setIsModalOpen(false);
        setSelectedPostId(null);
    };

    const handleDelete = (postId: number, isShare: boolean = false) => {
        if (!confirm('Are you sure you want to delete this?')) return;

        const deleteRoute = isShare 
            ? route('shares.destroy', postId) 
            : route('posts.destroy', postId);

        router.delete(deleteRoute, { preserveScroll: true });
    };

    const handleEdit = (post: PostType) => {
        router.get(route('posts.edit', post.id));
    };

    const renderPaginationItems = () => {
        const items = [];
        const { current_page, last_page } = posts.meta;
        const maxVisiblePages = 5; 

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
                            isActive={item === current_page}
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

                    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <Link href={route('profile.show', currentUser.id)} className="shrink-0">
                             <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                {currentUser.avatar ? (
                                    <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <User className="h-5 w-5 text-neutral-400" />
                                    </div>
                                )}
                            </div>
                        </Link>
                        <button 
                            onClick={() => router.get(route('posts.create'))}
                            className="flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-left text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-750 dark:hover:border-neutral-600 transition-colors cursor-text"
                        >
                            What's on your mind?
                        </button>
                    </div>

                    {normalizedPosts.length ? (
                        <>
                            <div className="flex flex-col gap-4">
                                {normalizedPosts.map((item) => (
                                    item.is_share ? (
                                        <ShareItem
                                            key={`share-${item.id}`} 
                                            share={item as ShareType}
                                            currentUserId={auth.user.id}
                                            onLike={handleLike}
                                            onComment={openCommentModal}
                                            onClick={handlePostClick}
                                            onShare={handleShare}
                                        />
                                    ) : (
                                        <Post
                                            key={`post-${item.id}`} 
                                            post={item as PostType}
                                            currentUserId={auth.user.id}
                                            onClick={handlePostClick}
                                            onLike={handleLike}
                                            onComment={openCommentModal}
                                            onShare={handleShare}
                                            onEdit={handleEdit}
                                            onDelete={() => handleDelete(item.id, false)}
                                        />
                                    )
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
                                                    handlePageChange(posts.meta.current_page - 1);
                                                }}
                                                className={posts.meta.current_page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>

                                        {renderPaginationItems()}

                                        <PaginationItem>
                                            <PaginationNext 
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePageChange(posts.meta.current_page + 1);
                                                }}
                                                className={posts.meta.current_page >= posts.meta.last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </>
                    ) : (
                        <EmptyState
                            icon={FileText}
                            title="No activity yet"
                            description="Follow people or start posting to see updates in your feed."
                        />
                    )}
                </div>
            </div>

            <CommentModal 
                isOpen={isModalOpen}
                onClose={closeCommentModal}
                post={selectedPost}
                currentUser={currentUser} 
                onPostUpdate={() => {
                    router.reload({ only: ['posts'] });
                }}
            />
        </AppLayout>
    );
}
