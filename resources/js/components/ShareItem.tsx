import { Share2, FileWarning } from 'lucide-react';
import Post from '@/components/Post';
import EmptyState from '@/components/EmptyState';
import { Post as PostType, Share as ShareType } from '@/types';

interface ShareItemProps {
    share: ShareType;
    currentUserId: number;
    onLike: (postId: number) => void;
    onComment: (post: PostType) => void;
    onClick: (postId: number) => void;
    onShare: (postId: number) => void;
}

export default function ShareItem({ share, currentUserId, onLike, onComment, onClick, onShare }: ShareItemProps) {
    if (!share) return null;

    const shareDate = share.shared_at ? new Date(share.shared_at).toLocaleDateString(undefined, {
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    }) : '';

    return (
        <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50/50 p-2 dark:border-neutral-800 dark:bg-neutral-900/50 shadow-sm">
            <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-500 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                    <Share2 className="h-3.5 w-3.5 text-blue-500" />
                    <span className="font-bold text-gray-700 dark:text-gray-200">
                        {share.shared_by?.name}
                    </span>
                    <span>shared this</span>
                </div>
                <span className="text-[10px] opacity-70">
                    {shareDate}
                </span>
            </div>

            <div className="mt-1">
                {share.is_deleted ? (
                    <div className="overflow-hidden rounded-lg">
                        <EmptyState 
                            icon={FileWarning}
                            description="Content is not available."
                        />
                    </div>
                ) : (
                    <Post 
                        post={share} 
                        currentUserId={currentUserId}
                        onLike={onLike}
                        onComment={onComment}
                        onClick={onClick}
                        onShare={onShare}
                    />
                )}
            </div>
        </div>
    );
}
