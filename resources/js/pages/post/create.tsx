import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Create Post', href: '/posts/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm<{
        content: string;
        image: File | null;
    }>({
        content: '',
        image: null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (data.image) {
            const url = URL.createObjectURL(data.image);
            setImagePreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setImagePreview(null);
        }
    }, [data.image]);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('image', file);
    }

    function handleRemoveImage() {
        setData('image', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setImagePreview(null);
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
                    {/* Content */}
                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            placeholder="What's on your mind?"
                            className="min-h-[100px]"
                        />
                        {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="image">Image</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/png, image/jpg, image/jpeg, image/webp"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            className="mt-1 block w-full text-sm text-gray-700 cursor-pointer"
                        />
                        {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}

                        {/* Image Preview with Remove Button */}
                        {imagePreview && (
                            <div className="relative mt-2">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="rounded-lg max-h-64 border object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 bg-white/30 hover:bg-white/50 rounded-full p-1"
                                    title="Remove image"
                                >
                                    <X className="w-4 h-4 text-black cursor-pointer" />
                                </button>
                            </div>
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
