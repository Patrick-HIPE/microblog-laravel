import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { User as UserIcon, ArrowLeft } from "lucide-react";
import { BreadcrumbItem, User as UserType } from "@/types";
import { useState, useMemo } from "react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import FlashMessage from '@/components/flash-message';
import EmptyState from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import PaginationLinks from "@/components/PaginationLinks";

interface Follower extends UserType {
    user_is_followed: boolean;
}

interface PaginatedFollowers {
    data: Follower[];
    meta?: {
        current_page: number;
        last_page: number;
        total: number;
    };
    current_page?: number;
    last_page?: number;
    total?: number;
}

interface Props {
    user: UserType;
    followers: PaginatedFollowers;
    current_user_id: number | null;
}

export default function Followers({ user, followers, current_user_id }: Props) {
    const [followersList, setFollowersList] = useState(followers?.data || []);
    
    // Sync state if props change (e.g., after pagination)
    const [prevData, setPrevData] = useState(followers?.data);
    if (followers?.data !== prevData) {
        setFollowersList(followers?.data || []);
        setPrevData(followers?.data);
    }

    // Normalizing pagination metadata for the component
    const paginationMeta = useMemo(() => ({
        current_page: followers?.meta?.current_page ?? followers?.current_page ?? 1,
        last_page: followers?.meta?.last_page ?? followers?.last_page ?? 1,
        total: followers?.meta?.total ?? followers?.total ?? 0,
    }), [followers]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Profile', href: route('profile.show', { user: user.id }) },
        { title: 'Followers', href: '#' },
    ];

    const toggleFollow = (targetUser: Follower) => {
        setFollowersList(prev => prev.map(f => 
            f.id === targetUser.id ? { ...f, user_is_followed: !f.user_is_followed } : f
        ));

        router.post(route('users.toggle-follow', { user: targetUser.id }), {}, {
            preserveScroll: true,
            onError: () => setFollowersList(followers?.data || [])
        });
    };

    if (!followers) return null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.name}'s Followers`} />
            <FlashMessage />

            <div className="mx-auto w-full max-w-2xl px-4 py-8">
                
                {/* Header Section */}
                <div className="mb-8 flex items-center gap-4 px-2">
                    <button 
                        onClick={() => window.history.back()}
                        className="group relative flex shrink-0 items-center justify-center transition-transform active:scale-95 cursor-pointer"
                    >
                        <div className="absolute -left-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-x-1">
                            <ArrowLeft className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
                        </div>
                        
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-14 w-14 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            />
                        ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 ring-2 ring-transparent group-hover:ring-blue-500/30 transition-all border border-neutral-200 dark:border-neutral-700">
                                <UserIcon className="h-7 w-7 text-neutral-400" />
                            </div>
                        )}
                    </button>

                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
                            {user.name}
                        </h1>
                        <p className="text-sm font-medium text-neutral-500">
                            {paginationMeta.total} Followers
                        </p>
                    </div>
                </div>

                {/* List Container */}
                <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
                    {followersList.length > 0 ? (
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {followersList.map((follower) => (
                                <div 
                                    key={follower.id}
                                    className="group flex items-center justify-between p-4 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                                >
                                    <div 
                                        className="flex items-center gap-4 cursor-pointer min-w-0"
                                        onClick={() => router.get(route('profile.show', { user: follower.id }))}
                                    >
                                        {follower.avatar ? (
                                            <img 
                                                src={follower.avatar} 
                                                className="h-11 w-11 rounded-full object-cover shrink-0 ring-1 ring-black/5 shadow-sm" 
                                                alt={follower.name} 
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                                <UserIcon className="h-5 w-5 text-neutral-400" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-blue-600 transition-colors">
                                                {follower.name}
                                            </h3>
                                            <p className="text-xs text-neutral-500 truncate">{follower.email}</p>
                                        </div>
                                    </div>

                                    {current_user_id !== follower.id && (
                                        <Button
                                            variant={follower.user_is_followed ? "secondary" : "default"}
                                            size="sm"
                                            className={cn(
                                                "rounded-full px-5 py-1 text-xs font-bold transition-all shrink-0 cursor-pointer",
                                                !follower.user_is_followed && "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFollow(follower);
                                            }}
                                        >
                                            {follower.user_is_followed ? "Following" : "Follow"}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16">
                            <EmptyState 
                                icon={UserIcon}
                                title="No followers yet"
                                description={`${user.name} doesn't have any followers yet.`}
                            />
                        </div>
                    )}
                </div>

                {/* Simplified Pagination using your component */}
                <PaginationLinks 
                    meta={paginationMeta} 
                    pageName="page" 
                />
            </div>
        </AppLayout>
    );
}
