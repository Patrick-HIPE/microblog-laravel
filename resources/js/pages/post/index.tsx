import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Posts', href: route('posts.index') },
];

interface Post {
    id: number;
    content: string;
    image_url?: string | null;
    created_at: string;
}

interface Props {
    posts: Post[];
}

export default function Index({ posts }: Props) {

    function handleDelete(postId: number) {
        if (!confirm('Are you sure you want to delete this post?')) return;

        router.delete(route('posts.destroy', postId), {
            onSuccess: () => {
                console.log('Post deleted successfully');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Posts" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-1 flex-col gap-4 rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                    <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">My Posts</h2>
                    <Link href={route('posts.create')}>
                        <Button className="cursor-pointer">Create</Button>
                    </Link>

                    {posts?.length ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <div key={post.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                                    {post.image_url ? (
                                        <div className="aspect-video w-full overflow-hidden">
                                            <img 
                                                src={post.image_url} 
                                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative aspect-video w-full bg-neutral-100 dark:bg-neutral-900">
                                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                                        </div>
                                    )}
                                    
                                    <div className="p-4">
                                        <h3 className="mb-2 truncate text-lg font-bold text-neutral-900 dark:text-white">
                                            {post.content.slice(0, 50)}
                                        </h3>
                                        <p className="mb-4 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
                                            {post.content}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-500">
                                            <span>{new Date(post.created_at).toLocaleString()}</span>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger className="outline-none">
                                                    <MoreHorizontal className="h-4 w-4 cursor-pointer" />
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route("posts.edit", post.id)} className="flex items-center gap-2 cursor-pointer">
                                                            <Pencil className="h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    className="flex items-center gap-2 cursor-pointer"
                                                    onClick={() => handleDelete(post.id)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-neutral-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">No posts created yet</h3>
                            <p className="mt-1 text-sm text-neutral-500">Get started by creating a new post.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
