import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: dashboard().url },
    { title: 'Post Details', href: dashboard().url },
];

interface Post {
    id: number;
    content: string;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

interface ShowPostProps {
    post: Post;
}

export default function ShowPost({ post }: ShowPostProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Post" />

            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800 max-w-full md:max-w-3xl mx-auto">
                    {post.image_url ? (
                        <div className="w-full overflow-hidden">
                            <img
                                src={post.image_url}
                                alt="Post Image"
                                className="w-full max-h-64 object-cover transition-transform duration-300 hover:scale-105 md:max-h-80 lg:max-h-96"
                            />
                        </div>
                    ) : (
                        <div className="relative w-full bg-neutral-100 dark:bg-neutral-900" style={{ paddingTop: '40%' }}>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                        </div>
                    )}

                    <div className="p-4 md:p-6">
                        <h1 className="mb-2 text-lg md:text-xl font-bold text-neutral-900 dark:text-white">
                            Post Details
                        </h1>
                        <p className="mb-4 text-sm md:text-base text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                            {post.content}
                        </p>
                        <div className="flex flex-col md:flex-row justify-between text-xs md:text-sm text-neutral-500 dark:text-neutral-400 gap-1 md:gap-0">
                            <span>Created at: {new Date(post.created_at).toLocaleString()}</span>
                            <span>Last updated: {new Date(post.updated_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
