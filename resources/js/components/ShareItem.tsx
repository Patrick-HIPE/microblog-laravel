import { Share2, FileWarning } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js'; 
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
    onEdit?: (post: PostType) => void;
    onDelete?: (postId: number) => void;
}

export default function ShareItem({ share, currentUserId, onLike, onComment, onClick, onShare, onEdit, onDelete }: ShareItemProps) {
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
                    
                    <Link 
                        href={route('profile.show', share.shared_by?.id)}
                        className="font-bold text-gray-700 hover:text-blue-600 transition-colors dark:text-gray-200 dark:hover:text-blue-400"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {share.shared_by?.name}
                    </Link>

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
                        onEdit={onEdit}   
                        onDelete={onDelete}
                    />
                )}
            </div>
        </div>
    );
}
