import AppLayout from '@/layouts/app-layout';
import CommentModal from '@/components/CommentModal';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type Post as PostType, type Share as ShareType, type User as UserType } from '@/types'; 
import { Head, router, usePage, Link } from '@inertiajs/react'; 
import { route } from 'ziggy-js';
import { useMemo, useState } from 'react'; 
import Post from '@/components/Post';
import ShareItem from '@/components/ShareItem';
import { FileText, User } from 'lucide-react'; 
import FlashMessage from '@/components/flash-message';
import EmptyState from "@/components/EmptyState";
import PaginationLinks from '@/components/PaginationLinks';

const breadcrumbs: BreadcrumbItem[] = [{ 
    title: 'Home', href: dashboard().url 
}];

interface DashboardProps {
    posts: {
        data: (PostType | ShareType)[];
        meta: { current_page: number; last_page: number; total: number };
    };
    auth_user?: UserType;
}

interface PageProps {
    auth: { user: UserType };
    [key: string]: unknown; 
}

export default function Dashboard({ posts, auth_user }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const currentUser = auth_user || auth.user;

    const normalizedPosts = useMemo(() => {
        return posts.data.map((p) => ({
            ...p,
            updated_at: p.updated_at || p.created_at,
            likes_count: p.likes_count ?? 0,
            comments_count: p.comments_count ?? 0,
            shares_count: p.shares_count ?? 0,
            liked_by_user: p.liked_by_user ?? false,
            shared_by_user: p.shared_by_user ?? false,
            user: p.user ?? { id: 0, name: 'Unknown User' },
            is_share: p.is_share ?? false,
        }));
    }, [posts.data]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

    const selectedPost = useMemo(() => 
        selectedPostId ? (normalizedPosts.find(p => p.id === selectedPostId) as PostType) : null
    , [selectedPostId, normalizedPosts]);

    const handlePostClick = (id: number) => router.get(route('posts.show', id));
    
    const handleLike = (id: number) => 
        router.post(route('posts.toggle-like', id), {}, { preserveScroll: true });
    
    const handleShare = (id: number) => 
        router.post(route('posts.share', id), {}, { preserveScroll: true });

    const handleEdit = (post: PostType) => router.get(route('posts.edit', post.id));

    const handleDelete = (postId: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        router.delete(route('posts.destroy', postId), {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['posts'] }),
        });
    };

    const openCommentModal = (post: PostType) => { setSelectedPostId(post.id); setIsModalOpen(true); };
    const closeCommentModal = () => { setIsModalOpen(false); setSelectedPostId(null); };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            <FlashMessage />
            
            <div className="flex flex-1 flex-col items-center bg-neutral-100 p-4 dark:bg-black/10">
                <div className="w-full max-w-[680px] space-y-4">
                    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <Link href={route('profile.show', currentUser.id)}>
                            <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                {currentUser.avatar ? <img src={currentUser.avatar} className="h-full w-full object-cover" /> : <User className="m-auto h-10 w-5 text-neutral-400" />}
                            </div>
                        </Link>
                        <button 
                            onClick={() => router.get(route('posts.create'))} 
                            className="flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-left text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-750 dark:hover:border-neutral-600 transition-colors cursor-text"
                        >
                            What's on your mind?
                        </button>
                    </div>

                    {normalizedPosts.length ? (
                        <>
                            <div className="flex flex-col gap-4">
                                {normalizedPosts.map((item) => (
                                    item.is_share ? (
                                        <ShareItem 
                                            key={`share-${item.id}`} 
                                            share={item as ShareType} 
                                            currentUserId={auth.user.id} 
                                            onLike={handleLike} 
                                            onComment={openCommentModal} 
                                            onClick={handlePostClick} 
                                            onShare={handleShare} 
                                            onEdit={handleEdit} 
                                            onDelete={handleDelete} 
                                        />
                                    ) : (
                                        <Post 
                                            key={`post-${item.id}`} 
                                            post={item as PostType} 
                                            currentUserId={auth.user.id} 
                                            onClick={handlePostClick} 
                                            onLike={handleLike} 
                                            onComment={openCommentModal} 
                                            onShare={handleShare} 
                                            onEdit={handleEdit} 
                                            onDelete={handleDelete}  
                                        />
                                    )
                                ))}
                            </div>
                            <PaginationLinks meta={posts.meta} />
                        </>
                    ) : (
                        <EmptyState icon={FileText} title="No activity yet" description="Follow people to see updates." />
                    )}
                </div>
            </div>

            <CommentModal 
                isOpen={isModalOpen} 
                onClose={closeCommentModal} 
                post={selectedPost} 
                currentUser={currentUser} 
                onPostUpdate={() => router.reload({ only: ['posts'] })} 
            />
        </AppLayout>
    );
}
