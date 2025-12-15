import { Heart, MessageCircle, Share2, User, MoreHorizontal } from 'lucide-react';
import { Post as PostType } from '@/types';

interface PostProps {
    post: PostType;
    currentUserId: number;
    onLike: (postId: number) => void;
    onComment: (post: PostType) => void;
    onClick: (postId: number) => void;
    onShare: (postId: number) => void;
    children?: React.ReactNode;
}

export default function Post({ post, onLike, onComment, onClick, onShare, children }: PostProps) {
    return (
        <div className="flex flex-col rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <User className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {post.user?.name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-neutral-500">
                            {new Date(post.created_at).toLocaleDateString(undefined, {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                        </span>
                    </div>
                </div>
                <MoreHorizontal className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
            </div>

            {/* Content */}
            <div className="cursor-pointer px-4 py-3" onClick={() => onClick(post.id)}>
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-900 dark:text-neutral-100">
                    {post.content}
                </p>
            </div>

            {/* Image */}
            {post.image_url && (
                <div className="cursor-pointer overflow-hidden bg-neutral-100 dark:bg-neutral-800" onClick={() => onClick(post.id)}>
                    <img src={post.image_url} alt="Post image" className="h-auto w-full object-cover" loading="lazy" />
                </div>
            )}

            {/* Counts */}
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

            {/* Actions */}
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
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                    <Share2 className="h-5 w-5" />
                    Share
                </button>
            </div>

            {children && <div className="p-4">{children}</div>}
        </div>
    );
}
