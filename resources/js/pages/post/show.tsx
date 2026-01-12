import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type Post as PostType, type User as UserType } from '@/types';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Heart, MessageCircle, Share2, User, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';
import FlashMessage from '@/components/flash-message';
import CommentModal from '@/components/CommentModal';

interface PageProps {
    auth: {
        user: UserType;
    };
    [key: string]: unknown;
}

interface ShowPostProps {
    post: PostType;
    auth_user?: UserType;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: dashboard().url },
    { title: 'Post Details', href: '#' },
];

export default function ShowPost({ post: initialPost, auth_user }: ShowPostProps) {
    const { auth } = usePage<PageProps>().props;
    
    const currentUser = auth_user || auth.user;
    const currentUserId = currentUser?.id;

    const [currentPost, setCurrentPost] = useState<PostType>(initialPost);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    useEffect(() => {
        setCurrentPost(initialPost);
    }, [initialPost]);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleLike = () => {
        router.post(route('posts.toggle-like', currentPost.id));
    };

    const handleEdit = () => {
        router.get(route('posts.edit', currentPost.id));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(route('posts.destroy', currentPost.id));
        }
    };

    const handleShare = () => {
        router.post(route('posts.share', currentPost.id));
    }

    const openCommentModal = () => {
        setIsModalOpen(true);
    };

    const closeCommentModal = () => {
        setIsModalOpen(false);
    };

    const handlePostUpdate = (updatedPost: PostType) => {
        setCurrentPost(updatedPost);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Post" />
            <FlashMessage />

            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 items-center">
                <div className="w-full flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 md:max-w-2xl">
                    
                    <div className="flex items-start justify-between px-4 pt-4">
                        <div className="flex items-center gap-3">
                            {currentPost.user ? (
                                <Link 
                                    href={route('profile.show', currentPost.user.id)}
                                    className="flex items-center gap-3 group"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
                                        {currentPost.user.avatar ? (
                                            <img src={currentPost.user.avatar} alt={currentPost.user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5 text-gray-400 dark:text-neutral-500" />
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                            {currentPost.user.name}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-neutral-400">
                                            {new Date(currentPost.created_at).toLocaleDateString(undefined, {
                                                month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-3 opacity-60">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Unknown User</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            {(currentPost.user?.id === currentUserId) && (
                                <button 
                                    onClick={toggleMenu}
                                    className={`rounded-full p-2 transition-colors cursor-pointer ${
                                        showMenu 
                                        ? 'bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-white' 
                                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300'
                                    }`}
                                >
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            )}

                            {showMenu && (
                                <div 
                                    ref={menuRef}
                                    className="absolute right-0 top-full z-30 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-100 dark:border-neutral-800 dark:bg-neutral-900"
                                    onClick={(e) => e.stopPropagation()} 
                                >
                                    <div className="p-1.5 space-y-0.5">
                                        <button
                                            onClick={() => { setShowMenu(false); handleEdit(); }}
                                            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                        >
                                            <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Edit
                                        </button>
                                        <button
                                            onClick={() => { setShowMenu(false); handleDelete(); }}
                                            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-4 py-4 md:px-4 md:py-5">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200 break-words">
                            {currentPost.content}
                        </p>
                    </div>

                    {currentPost.image_url ? (
                        <div className="w-full bg-gray-50 dark:bg-black/50 border-y border-gray-100 dark:border-neutral-800">
                            <img
                                src={currentPost.image_url}
                                alt="Post Image"
                                className="max-h-[600px] w-full object-contain mx-auto"
                            />
                        </div>
                    ) : (
                        <div className="relative w-full border-y border-neutral-100 bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900/50" style={{ paddingTop: '40%' }}>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5" />
                        </div>
                    )}

                    <div className="mx-4 mt-3 flex items-center justify-between border-b border-gray-100 pb-3 text-xs text-gray-500 dark:border-neutral-800 dark:text-neutral-400 font-medium">
                        <div className="flex items-center gap-1.5 min-h-[20px]">
                            {currentPost.likes_count > 0 && (
                                <>
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
                                        <Heart className="h-3 w-3 fill-white text-white" />
                                    </div>
                                    <span>{currentPost.likes_count} {currentPost.likes_count === 1 ? 'like' : 'likes'}</span>
                                </>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <span>{currentPost.comments_count} comments</span>
                            <span>{currentPost.shares_count} shares</span>
                        </div>
                    </div>

                    <div className="flex px-2 py-1 pb-2">
                        <button
                            onClick={handleLike}
                            className={`group flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-50 active:scale-95 dark:hover:bg-neutral-800 ${
                                currentPost.liked_by_user 
                                ? 'text-rose-600 dark:text-rose-500' 
                                : 'text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400'
                            }`}
                        >
                            <Heart className={`h-5 w-5 transition-transform group-hover:scale-110 ${currentPost.liked_by_user ? 'fill-current' : ''}`} />
                            Like
                        </button>

                        <button
                            onClick={openCommentModal}
                            className="group flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-gray-500 transition-all duration-200 hover:bg-gray-50 hover:text-blue-600 active:scale-95 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                        >
                            <MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                            Comment
                        </button>

                        <button
                            onClick={handleShare}
                            className={`group flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-50 active:scale-95 dark:hover:bg-neutral-800 ${
                                currentPost.shared_by_user 
                                ? 'text-blue-600 dark:text-blue-500'    
                                : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                            }`}
                        >
                            <Share2 className={`h-5 w-5 transition-transform group-hover:scale-110 ${currentPost.shared_by_user ? 'fill-current' : ''}`} />
                            Share
                        </button>
                    </div>
                </div>
            </div>

            <CommentModal 
                isOpen={isModalOpen}
                onClose={closeCommentModal}
                post={currentPost}
                currentUser={currentUser}
                onPostUpdate={handlePostUpdate}
            />
        </AppLayout>
    );
}