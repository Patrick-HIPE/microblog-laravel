import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Edit Post', href: '/posts/update' },
];

interface Post {
    id: number;
    content: string;
    image_url?: string | null;
}

interface Props {
    post: Post;
}

export default function Update({ post }: Props) {
    const { data, setData, put, processing, errors, delete: destroy } = useForm<{
        content: string;
        image: File | null;
    }>({
        content: post.content ?? '',
        image: null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(post.image_url || null);

    useEffect(() => {
        if (data.image) {
            const url = URL.createObjectURL(data.image);
            setImagePreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setImagePreview(post.image_url ?? null);
        }
    }, [data.image, post.image_url]);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('image', file);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('posts.update', post.id), {
            forceFormData: true,
        });
    }

    function handleDelete() {
        if (!confirm('Are you sure you want to delete this post?')) return;
        destroy(route('posts.destroy', post.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Post" />
            <div className="mx-auto w-full max-w-2xl space-y-6">
                <div className="flex items-center justify-between mt-6">
                    <h1 className="text-2xl font-semibold text-foreground m-0">Edit Post</h1>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        className="cursor-pointer"
                    >
                        Delete
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Content Field */}
                    <div className="space-y-2">
                        <Label htmlFor="post-content">Content</Label>
                        <Textarea
                            id="post-content"
                            name="content"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            placeholder="What's on your mind?"
                            className="min-h-[100px]"
                        />
                        {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                    </div>

                    {/* Image Upload Field */}
                    <div className="space-y-2">
                        <Label htmlFor="post-image">Image</Label>
                        <Input
                            id="post-image"
                            name="image"
                            type="file"
                            accept="image/png, image/jpg, image/jpeg, image/webp"
                            onChange={handleImageChange}
                            className="mt-1 block w-full text-sm text-gray-700 cursor-pointer"
                        />
                        {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}

                        {/* Image Preview */}
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="mt-2 rounded-lg max-h-64 border object-cover"
                            />
                        )}
                    </div>

                    {/* Submit */}
                    <div>
                        <Button
                            type="submit"
                            disabled={processing || !data.content}
                            className="cursor-pointer"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
