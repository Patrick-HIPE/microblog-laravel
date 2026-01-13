import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, User, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';       
import { Post as PostType } from '@/types';

interface PostProps {
    post: PostType;
    currentUserId: number;
    onLike: (postId: number) => void;
    onComment: (post: PostType) => void;
    onClick: (postId: number) => void;
    onShare: (postId: number) => void;
    onEdit?: (post: PostType) => void;
    onDelete?: (postId: number) => void;
    children?: React.ReactNode;
}

export default function Post({ 
    post, 
    currentUserId, 
    onLike, 
    onComment, 
    onClick, 
    onShare, 
    onEdit, 
    onDelete, 
    children 
}: PostProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const CHAR_LIMIT = 80;
    const isLongText = post.content.length > CHAR_LIMIT;
    const isOwner = post.user?.id === currentUserId;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isOwner) {
            setShowMenu(!showMenu);
        }
    };

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between px-4 pt-4">
                <div className="flex items-center gap-3">
                    {post.user ? (
                        <Link 
                            href={route('profile.show', post.user.id)}
                            className="flex items-center gap-3 group"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
                                {post.user.avatar ? (
                                    <img 
                                        src={post.user.avatar} 
                                        alt={post.user.name} 
                                        className="h-full w-full object-cover" 
                                    />
                                ) : (
                                    <User className="h-5 w-5 text-gray-400 dark:text-neutral-500" />
                                )}
                            </div>
                            
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                    {post.user.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-neutral-400">
                                    {new Date(post.created_at).toLocaleDateString(undefined, {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
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
                    <button 
                        onClick={toggleMenu}
                        disabled={!isOwner}
                        className={`rounded-full p-2 transition-colors ${
                            isOwner 
                                ? showMenu 
                                    ? 'bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-white cursor-pointer' 
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 cursor-pointer'
                                : 'text-gray-200 dark:text-neutral-800 cursor-default' 
                        }`}
                    >
                        <MoreHorizontal className="h-5 w-5" />
                    </button>

                    {showMenu && isOwner && (
                        <div 
                            ref={menuRef}
                            className="absolute right-0 top-full z-30 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-100 dark:border-neutral-800 dark:bg-neutral-900"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            <div className="p-1.5 space-y-0.5">
                                {onEdit && (
                                    <button
                                        onClick={() => { setShowMenu(false); onEdit(post); }}
                                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                    >
                                        <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Edit
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => { setShowMenu(false); onDelete(post.id); }}
                                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4" /> Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-4 py-3">
                <div 
                    className={`whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200 break-words
                        ${!isExpanded ? 'line-clamp-3' : ''} 
                    `}
                >
                    {post.content}
                </div>
                
                {isLongText && (
                    <button 
                        onClick={toggleExpand}
                        className="mt-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:underline dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer"
                    >
                        {isExpanded ? 'Show Less' : 'Read More'}
                    </button>
                )}
            </div>

            {post.image_url && (
                <div className="cursor-pointer w-full bg-gray-50 dark:bg-black/50 border-y border-gray-100 dark:border-neutral-800" onClick={() => onClick(post.id)}>
                    <img src={post.image_url} alt="Post content" className="max-h-[500px] w-full object-contain mx-auto" loading="lazy" />
                </div>
            )}

            <div className="mx-4 mt-3 flex items-center justify-between border-b border-gray-100 pb-3 text-xs text-gray-500 dark:border-neutral-800 dark:text-neutral-400 font-medium">
                <div className="flex items-center gap-1.5 min-h-[20px]">
                    {post.likes_count > 0 && (
                        <>
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                                <Heart className="h-2.5 w-2.5 fill-white text-white" />
                            </div>
                            <span>{post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}</span>
                        </>
                    )}
                </div>
                <div className="flex gap-4">
                    <span className="hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); onComment(post); }}>
                        {post.comments_count} comments
                    </span>
                    <span className="hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); onShare(post.id); }}>
                        {post.shares_count} shares
                    </span>
                </div>
            </div>

            <div className="flex px-2 py-1">
                <button
                    onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
                    className={`group flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-50 active:scale-95 dark:hover:bg-neutral-800 ${
                        post.liked_by_user 
                        ? 'text-rose-600 dark:text-rose-500' 
                        : 'text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400'
                    }`}
                >
                    <Heart className={`h-5 w-5 transition-transform group-hover:scale-110 ${post.liked_by_user ? 'fill-current' : ''}`} />
                    Like
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onComment(post); }}
                    className="group flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-gray-500 transition-all duration-200 hover:bg-gray-50 hover:text-blue-600 active:scale-95 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                >
                    <MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                    Comment
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onShare(post.id); }}
                    className={`group flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-50 active:scale-95 dark:hover:bg-neutral-800 ${
                        post.shared_by_user 
                        ? 'text-blue-600 dark:text-blue-500'   
                        : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                    }`}
                >
                    <Share2 className={`h-5 w-5 transition-transform group-hover:scale-110 ${post.shared_by_user ? 'fill-current' : ''}`} />
                    Share
                </button>
            </div>

            {children && <div className="px-4 pb-4">{children}</div>}
        </div>
    );
}