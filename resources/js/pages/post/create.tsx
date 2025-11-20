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
    { title: 'Create Post', href: '/posts/create' },
];

export default function Index() {
    const { data, setData, post, processing, errors, reset } = useForm<{ content: string; image: File | null }>({
        content: '',
        image: null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Generate preview whenever a new file is selected
    useEffect(() => {
        if (data.image) {
            const url = URL.createObjectURL(data.image);
            setImagePreview(url);

            // Clean up object URL when component unmounts or image changes
            return () => URL.revokeObjectURL(url);
        } else {
            setImagePreview(null);
        }
    }, [data.image]);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('image', file);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('posts.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setImagePreview(null);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Post" />
            <div className="mx-auto w-full max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold text-foreground mt-6">Create Post</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Content Field */}
                    <div className="space-y-2">
                        <Label htmlFor="post-content">Content</Label>
                        <Textarea
                            id="post-content"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            placeholder="What's on your mind?"
                            className="min-h-[120px]"
                        />
                        {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                    </div>

                    {/* Image Upload Field */}
                    <div className="space-y-2">
                        <Label htmlFor="post-image">Image</Label>
                        <Input
                            id="post-image"
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

                    {/* Submit Button */}
                    <div>
                        <Button
                            type="submit"
                            disabled={processing || !data.content}
                            className="cursor-pointer"
                        >
                            {processing ? 'Submitting...' : 'Submit Post'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
