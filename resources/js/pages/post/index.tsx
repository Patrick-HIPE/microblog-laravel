import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Post {
    id: number;
    content: string;
    image_url?: string | null;
    created_at: string;
}

interface Props {
    posts: Post[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Posts', href: route('posts.index') },
];

export default function Index({ posts }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Posts" />
            <div className="mx-auto w-full max-w-6xl px-4 space-y-6">
                <div className="flex justify-between items-center mt-6">
                    <h1 className="text-2xl font-semibold text-foreground">My Posts</h1>
                    <Link href={route('posts.create')}>
                        <Button className="cursor-pointer">Create Post</Button>
                    </Link>
                </div>

                {posts.length === 0 ? (
                    <p className="text-gray-500 text-center mt-10">You have no posts yet.</p>
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="relative block border rounded-lg shadow-sm overflow-hidden bg-white hover:shadow-md transition"
                            >
                                {/* Content */}
                                <div className="p-4 space-y-2">
                                    <p className="text-sm text-gray-800">{post.content}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(post.created_at).toLocaleString()}
                                    </p>
                                </div>

                                {/* Image */}
                                {post.image_url && (
                                    <img
                                        src={post.image_url}
                                        alt="Post image"
                                        className="w-full h-48 object-cover"
                                    />
                                )}

                                {/* Edit icon */}
                                <Link
                                    href={route('posts.edit', post.id)}
                                    className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/80 px-2 py-1 rounded"
                                >
                                    <Pencil className="w-4 h-4 text-gray-700" />
                                    <span className="text-xs text-gray-700">Edit</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
