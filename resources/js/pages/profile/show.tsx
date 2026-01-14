import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { User as UserIcon, Share2, FileText } from "lucide-react";
import { BreadcrumbItem, Post as PostType, User as UserType } from "@/types";
import { useState } from "react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import Post from "@/components/Post";
import CommentModal from "@/components/CommentModal";
import FlashMessage from '@/components/flash-message';
import EmptyState from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination,
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

interface PaginatedData<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

interface Props {
    user: UserType;
    posts: PaginatedData<PostType>;
    current_user_id: number | null;
    user_is_followed: boolean;
    auth_user?: UserType;
}

interface PageProps {
    auth: {
        user: UserType;
    };
    [key: string]: unknown;
}

export default function Show({
    user,
    posts,
    current_user_id,
    user_is_followed,
    auth_user,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const currentUser = auth_user || auth.user;

    const [isFollowed, setIsFollowed] = useState(user_is_followed);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [postsState, setPosts] = useState<PostType[]>(posts.data);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
    const [prevPostsData, setPrevPostsData] = useState(posts.data);

    if (posts.data !== prevPostsData) {
        setPosts(posts.data);
        setPrevPostsData(posts.data);

        if (selectedPost) {
            const updated = posts.data.find(p => p.id === selectedPost.id);
            if (updated) setSelectedPost(updated);
        }
    }

    const isOwnProfile = current_user_id === user.id;

    const handlePageChange = (page: number) => {
        if (page < 1 || page > posts.meta.last_page || page === posts.meta.current_page) return;

        router.get(window.location.pathname, { page }, {
            preserveState: true,
            preserveScroll: false,
            onSuccess: () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;
        const { current_page, last_page } = posts.meta;

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
                        ? (post.likes_count || 0) + 1
                        : (post.likes_count || 0) - 1,
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
        setSelectedPost(updatedPost);
        setPosts((prev) =>
            prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
        );
    };

    const handleDelete = (postId: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        router.delete(route('posts.destroy', postId), {
            preserveScroll: true,
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
        });
    };

    const followersCount = user.followers_count ?? user.followers?.length ?? 0;
    const followingCount = user.following_count ?? user.following?.length ?? 0;

    const tabItems = [
        { value: 'posts', label: 'Posts' },
        { value: 'shares', label: 'Shares' },
    ];

    const tabTriggerClasses = cn(
        "flex items-center justify-center rounded-md px-3.5 py-1.5 text-sm font-medium transition-all cursor-pointer",
        "flex-1 sm:flex-none", 
        "text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700/60 dark:hover:text-neutral-200",
        "data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm",
        "dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-neutral-100"
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />
            <FlashMessage />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-6 rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border bg-white dark:bg-sidebar shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-20 h-20 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-neutral-800"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                    <UserIcon className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
                                </div>
                            )}

                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    {user.name}
                                </h2>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                className="cursor-pointer"
                                onClick={() => router.get(route("profile.followers", { user: user.id }))}
                            >
                                <span className="font-bold mr-1">{followersCount}</span> followers
                            </Button>

                            <Button
                                variant="outline"
                                className="cursor-pointer"
                                onClick={() => router.get(route("profile.following", { user: user.id }))}
                            >
                                <span className="font-bold mr-1">{followingCount}</span> following
                            </Button>

                            {!isOwnProfile && (
                                <Button
                                    onClick={handleFollow}
                                    className={`cursor-pointer transition-colors ${isFollowed
                                        ? "bg-neutral-500 hover:bg-neutral-600"
                                        : "bg-blue-500 hover:bg-blue-600"
                                        }`}
                                >
                                    {isFollowed ? "Following" : "Follow"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="mb-6 flex w-full justify-start h-auto sm:w-max gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                        {tabItems.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value} className={tabTriggerClasses}>
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="posts" className="mt-0">
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
                                title="No posts yet"
                                description="This user hasn’t posted anything yet."
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="shares" className="mt-0">
                        <EmptyState
                            icon={Share2}
                            title="No shared posts"
                            description="This user hasn't shared any posts yet."
                        />
                    </TabsContent>
                </Tabs>
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
