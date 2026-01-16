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

interface FollowedUser extends UserType {
    user_is_followed: boolean;
}

interface PaginatedFollowing {
    data: FollowedUser[];
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
    following: PaginatedFollowing;
    current_user_id: number | null;
}

export default function Following({ user, following, current_user_id }: Props) {
    const [followingList, setFollowingList] = useState(following?.data || []);
    
    const [prevData, setPrevData] = useState(following?.data);
    if (following?.data !== prevData) {
        setFollowingList(following?.data || []);
        setPrevData(following?.data);
    }

    const paginationMeta = useMemo(() => ({
        current_page: following?.meta?.current_page ?? following?.current_page ?? 1,
        last_page: following?.meta?.last_page ?? following?.last_page ?? 1,
        total: following?.meta?.total ?? following?.total ?? 0,
    }), [following]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Profile', href: route('profile.show', { user: user.id }) },
        { title: 'Following', href: '#' },
    ];

    const toggleFollow = (targetUser: FollowedUser) => {
        setFollowingList(prev => prev.map(f => 
            f.id === targetUser.id ? { ...f, user_is_followed: !f.user_is_followed } : f
        ));

        router.post(route('users.toggle-follow', { user: targetUser.id }), {}, {
            preserveScroll: true,
            onError: () => setFollowingList(following?.data || [])
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Who ${user.name} Follows`} />
            <FlashMessage />

            <div className="mx-auto w-full max-w-2xl px-4 py-8">
                
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
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                <UserIcon className="h-7 w-7 text-neutral-400" />
                            </div>
                        )}
                    </button>

                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
                            {user.name}
                        </h1>
                        <p className="text-sm font-medium text-neutral-500">
                            {paginationMeta.total} Following
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
                    {followingList.length > 0 ? (
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {followingList.map((f) => (
                                <div 
                                    key={f.id}
                                    className="group flex items-center justify-between p-4 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                                >
                                    <div 
                                        className="flex items-center gap-4 cursor-pointer min-w-0"
                                        onClick={() => router.get(route('profile.show', { user: f.id }))}
                                    >
                                        {f.avatar ? (
                                            <img 
                                                src={f.avatar} 
                                                className="h-11 w-11 rounded-full object-cover shrink-0 ring-1 ring-black/5 shadow-sm" 
                                                alt={f.name} 
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                                <UserIcon className="h-5 w-5 text-neutral-400" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-blue-600 transition-colors">
                                                {f.name}
                                            </h3>
                                            <p className="text-xs text-neutral-500 truncate">{f.email}</p>
                                        </div>
                                    </div>

                                    {current_user_id !== f.id && (
                                        <Button
                                            variant={f.user_is_followed ? "secondary" : "default"}
                                            size="sm"
                                            className={cn(
                                                "rounded-full px-5 py-1 text-xs font-bold transition-all shrink-0 cursor-pointer",
                                                !f.user_is_followed && "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFollow(f);
                                            }}
                                        >
                                            {f.user_is_followed ? "Following" : "Follow"}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16">
                            <EmptyState 
                                icon={UserIcon}
                                title="Not following anyone"
                                description={`${user.name} hasn't followed anyone yet.`}
                            />
                        </div>
                    )}
                </div>

                <PaginationLinks 
                    meta={paginationMeta} 
                    pageName="page" 
                />
            </div>
        </AppLayout>
    );
}
