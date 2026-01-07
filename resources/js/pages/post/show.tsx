import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
// 1. Add Link to imports
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
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: dashboard().url },
    { title: 'Post Details', href: '#' },
];

export default function ShowPost({ post: initialPost }: ShowPostProps) {
    const { auth } = usePage<PageProps>().props;
    const currentUserId = auth?.user?.id;

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        };
    };

    const { date, time } = formatDate(currentPost.created_at);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Post" />
            <FlashMessage />

            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:max-w-3xl">
                    
                    {currentPost.image_url ? (
                        <div className="w-full bg-white dark:bg-neutral-900">
                            <img
                                src={currentPost.image_url}
                                alt="Post Image"
                                className="max-h-[500px] w-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="relative w-full border-b border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900" style={{ paddingTop: '30%' }}>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5" />
                        </div>
                    )}

                    <div className="p-4 md:p-4">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            
                            {/* --- UPDATED USER SECTION START --- */}
                            <div className="flex items-center gap-3">
                                {currentPost.user ? (
                                    <Link 
                                        href={route('profile.show', currentPost.user.id)}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-200 transition-opacity group-hover:opacity-80 dark:bg-neutral-800 dark:ring-neutral-700">
                                            {currentPost.user.avatar ? (
                                                <img src={currentPost.user.avatar} alt={currentPost.user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-5 w-5 text-neutral-400" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                                {currentPost.user.name}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-neutral-500">
                                                {date}
                                                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                                                {time}
                                            </span>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-3 opacity-50">
                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
                                            <User className="h-5 w-5 text-neutral-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                Unknown User
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-neutral-500">
                                                {date}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* --- UPDATED USER SECTION END --- */}

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                {currentPost.user?.id === currentUserId && (
                                    <div className="relative">
                                        <button 
                                            onClick={toggleMenu}
                                            className={`cursor-pointer rounded-full p-2 transition-colors ${
                                                showMenu 
                                                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white' 
                                                : 'text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                            }`}
                                        >
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>

                                        {showMenu && (
                                            <div 
                                                ref={menuRef}
                                                className="animate-in fade-in zoom-in-95 absolute bottom-full right-0 mb-2 min-w-[140px] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg duration-100 dark:border-neutral-700 dark:bg-neutral-900"
                                                onClick={(e) => e.stopPropagation()} 
                                            >
                                                <div className="p-1">
                                                    <button
                                                        onClick={() => { setShowMenu(false); handleEdit(); }}
                                                        className="flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                                    >
                                                        <Pencil className="h-4 w-4" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => { setShowMenu(false); handleDelete(); }}
                                                        className="flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-2 md:px-4 md:py-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-900 dark:text-neutral-100">
                            {currentPost.content}
                        </p>
                    </div>

                    <div className="border-t border-neutral-100 bg-white px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                            <div className="flex items-center gap-1">
                                {currentPost.likes_count > 0 && (
                                    <>
                                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                                            <Heart className="h-2.5 w-2.5 fill-white text-white" />
                                        </div>
                                        <span className="font-medium">{currentPost.likes_count}</span>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <span>{currentPost.comments_count} comments</span>
                                <span>{currentPost.shares_count} shares</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleLike}
                                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                                    currentPost.liked_by_user ? 'text-red-600 dark:text-red-500' : 'text-neutral-600 dark:text-neutral-400'
                                }`}
                            >
                                <Heart className={`h-4 w-4 ${currentPost.liked_by_user ? 'fill-current' : ''}`} />
                                Like
                            </button>

                            <button 
                                onClick={openCommentModal}
                                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Comment
                            </button>

                            <button
                                onClick={handleShare}
                                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                                    currentPost.shared_by_user 
                                    ? 'text-blue-600 dark:text-blue-500'   
                                    : 'text-neutral-600 dark:text-neutral-400'
                                }`}
                            >
                                <Share2 className={`h-4 w-4 ${currentPost.shared_by_user ? 'fill-current' : ''}`} />
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <CommentModal 
                isOpen={isModalOpen}
                onClose={closeCommentModal}
                post={currentPost}
                currentUser={auth.user}
                onPostUpdate={handlePostUpdate}
            />
        </AppLayout>
    );
}