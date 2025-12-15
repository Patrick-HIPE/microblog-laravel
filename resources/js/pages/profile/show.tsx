import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { User as UserIcon } from "lucide-react";
import { BreadcrumbItem, Post as PostType } from "@/types";
import { useState } from "react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import Post from "@/components/Post";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profile', href: '/profile' },
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

export default function Show({ user, posts, current_user_id, user_is_followed }: Props) {
    const [isFollowed, setIsFollowed] = useState(user_is_followed);

    const toggleFollow = () => {
        router.post(route('users.toggle-follow', { user: user.id }), {}, {
            preserveScroll: true,
            onSuccess: () => setIsFollowed(!isFollowed),
        });
    };

    const isOwnProfile = current_user_id === user.id;

    const handlePostClick = (postId: number) => {
        router.get(route('posts.show', postId));
    };

    const handleLike = (postId: number) => {
            console.log('Like post', postId);
    };

    const handleComment = (post: PostType) => {
        console.log('Comment on post', post.id);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />

            <div className="p-6">
                <div className="flex flex-1 flex-col gap-4 rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">

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
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                <p className="text-neutral-600 dark:text-neutral-400">{user.email}</p>
                            </div>
                        </div>

                        {/* Followers / Followings / Follow Button */}
                        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                            <Button
                                onClick={() => router.get(route('profile.followers', { user: user.id }))}
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-black dark:text-white transition-colors cursor-pointer"
                            >
                                Followers ({user.followers.length})
                            </Button>

                            <Button
                                onClick={() => router.get(route('profile.following', { user: user.id }))}
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-black dark:text-white transition-colors cursor-pointer"
                            >
                                Following ({user.following.length})
                            </Button>

                            {!isOwnProfile && (
                                <Button
                                    onClick={toggleFollow}
                                    className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors cursor-pointer ${
                                        isFollowed ? "bg-neutral-500 hover:bg-neutral-600" : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                >
                                    {isFollowed ? "Followed" : "Follow"}
                                </Button>
                            )}
                        </div>
                    </div>

                    <hr className="my-1" />

                    {/* Posts Section */}
                    <h3 className="text-lg font-semibold mb-4">Posts</h3>

                    {posts.length ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <Post
                                    key={post.id}
                                    post={{
                                        ...post,
                                        likes_count: post.likes_count ?? 0,
                                        comments_count: post.comments_count ?? 0,
                                        shares_count: post.shares_count ?? 0,
                                        liked_by_user: post.liked_by_user ?? false,
                                        user: post.user ?? { id: 0, name: 'Unknown User' },
                                    }}
                                    currentUserId={current_user_id ?? 0}
                                    onClick={handlePostClick}
                                    onLike={handleLike}
                                    onComment={handleComment}
                                />
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
                            <p className="mt-1 text-sm text-neutral-500">This user hasn’t posted anything yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
