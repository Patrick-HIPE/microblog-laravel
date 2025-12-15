import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { User as UserIcon } from "lucide-react";
import { BreadcrumbItem, Post as PostType } from "@/types";
import { useState } from "react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import Post from "@/components/Post";
import CommentModal from "@/components/CommentModal";
import FlashMessage from '@/components/flash-message';

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Profile", href: "/profile" },
];

export interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    avatar_url?: string | null;
    followers: { id: number }[];
    following: { id: number }[];
}

interface Props {
    user: User;
    posts: PostType[];
    current_user_id: number | null;
    user_is_followed: boolean;
}

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
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

    const [postsState, setPosts] = useState<PostType[]>(
        posts.map((p) => ({
            ...p,
            likes_count: p.likes_count ?? 0,
            comments_count: p.comments_count ?? 0,
            shares_count: p.shares_count ?? 0,
            liked_by_user: p.liked_by_user ?? false,
            user: p.user ?? { id: 0, name: "Unknown User" },
        }))
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null);

    const isOwnProfile = current_user_id === user.id;

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
            {
                preserveScroll: true,
                preserveState: true,
            }
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


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />
            <FlashMessage />

            <div className="p-6">
                <div className="flex flex-col gap-4 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
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
                                onClick={() =>
                                    router.get(
                                        route("profile.followers", {
                                            user: user.id,
                                        })
                                    )
                                }
                            >
                                Followers ({user.followers.length})
                            </Button>

                            <Button
                                onClick={() =>
                                    router.get(
                                        route("profile.following", {
                                            user: user.id,
                                        })
                                    )
                                }
                            >
                                Following ({user.following.length})
                            </Button>

                            {!isOwnProfile && (
                                <Button
                                    onClick={handleFollow}
                                    className={
                                        isFollowed
                                            ? "bg-neutral-500 hover:bg-neutral-600"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    }
                                >
                                    {isFollowed ? "Followed" : "Follow"}
                                </Button>
                            )}
                        </div>
                    </div>

                    <hr />

                    <h3 className="text-lg font-semibold">Posts</h3>

                    {postsState.length ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {postsState.map((post) => (
                                <Post
                                    key={post.id}
                                    post={post}
                                    currentUserId={auth.user.id}
                                    onClick={handlePostClick}
                                    onLike={handleLike}
                                    onComment={openCommentModal}
                                />
                            ))}
                        </div>
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
