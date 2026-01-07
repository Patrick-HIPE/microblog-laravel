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
        setShowMenu(!showMenu);
    };

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="flex flex-col rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between px-4 pt-4">
                
                <div className="flex items-center gap-3">
                    {post.user ? (
                        <Link 
                            href={route('profile.show', post.user.id)}
                            className="flex items-center gap-3 group"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Avatar Display */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 transition-opacity group-hover:opacity-80 dark:bg-neutral-700">
                                {post.user.avatar ? (
                                    <img 
                                        src={post.user.avatar} 
                                        alt={post.user.name} 
                                        className="h-full w-full object-cover" 
                                    />
                                ) : (
                                    <User className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                                )}
                            </div>
                            
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                    {post.user.name}
                                </span>
                                <span className="text-xs text-neutral-500">
                                    {new Date(post.created_at).toLocaleDateString(undefined, {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3 opacity-50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                                <User className="h-5 w-5 text-neutral-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-neutral-900 dark:text-white">Unknown User</span>
                            </div>
                        </div>
                    )}
                </div>

                {post.user?.id === currentUserId && (
                    <div className="relative">
                        <button 
                            onClick={toggleMenu}
                            className={`rounded-full p-1.5 transition-colors cursor-pointer ${
                                showMenu 
                                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white' 
                                : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                            }`}
                        >
                            <MoreHorizontal className="h-5 w-5" />
                        </button>

                        {showMenu && (
                            <div 
                                ref={menuRef}
                                className="absolute right-0 top-full z-30 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100 dark:border-neutral-700 dark:bg-neutral-900"
                                onClick={(e) => e.stopPropagation()} 
                            >
                                <div className="p-1">
                                    {onEdit && (
                                        <button
                                            onClick={() => { setShowMenu(false); onEdit(post); }}
                                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-700 rounded-md hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                        >
                                            <Pencil className="h-4 w-4" /> Edit
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => { setShowMenu(false); onDelete(post.id); }}
                                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 rounded-md hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {post.user?.id !== currentUserId && (
                     <MoreHorizontal className="h-5 w-5 text-neutral-300 dark:text-neutral-700" />
                )}
            </div>

            <div className="px-4 py-3">
                <div 
                    className={`whitespace-pre-wrap text-sm leading-relaxed text-neutral-900 dark:text-neutral-100 break-all
                        ${!isExpanded ? 'line-clamp-1' : ''} 
                    `}
                >
                    {post.content}
                </div>
                
                {isLongText && (
                    <button 
                        onClick={toggleExpand}
                        className="mt-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:underline dark:hover:text-white cursor-pointer"
                    >
                        {isExpanded ? 'See Less' : 'See More'}
                    </button>
                )}
            </div>

            {post.image_url && (
                <div className="cursor-pointer w-full bg-neutral-100 dark:bg-neutral-900" onClick={() => onClick(post.id)}>
                    <img src={post.image_url} alt="Post image" className="h-auto w-full object-cover" loading="lazy" />
                </div>
            )}

            <div className="mx-4 mt-3 flex items-center justify-between border-b border-neutral-100 pb-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <div className="flex items-center gap-1">
                    {post.likes_count > 0 && (
                        <>
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                                <Heart className="h-2.5 w-2.5 fill-white text-white" />
                            </div>
                            <span>{post.likes_count}</span>
                        </>
                    )}
                </div>
                <div className="flex gap-3">
                    <span>{post.comments_count} comments</span>
                    <span>{post.shares_count} shares</span>
                </div>
            </div>

            <div className="flex px-2 py-1">
                <button
                    onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                        post.liked_by_user ? 'text-red-600 dark:text-red-500' : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                >
                    <Heart className={`h-5 w-5 ${post.liked_by_user ? 'fill-current' : ''}`} />
                    Like
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onComment(post); }}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                    <MessageCircle className="h-5 w-5" />
                    Comment
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onShare(post.id); }}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                        post.shared_by_user 
                        ? 'text-blue-600 dark:text-blue-500'   
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                >
                    <Share2 className={`h-5 w-5 ${post.shared_by_user ? 'fill-current' : ''}`} />
                    Share
                </button>
            </div>

            {children && <div className="p-4">{children}</div>}
        </div>
    );
}