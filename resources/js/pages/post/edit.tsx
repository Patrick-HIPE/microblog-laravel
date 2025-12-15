import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
  const { data, setData, post: submitPost, processing, isDirty, errors, delete: destroy } = useForm({
    _method: 'PUT', 
    content: post.content,
    image: null as File | null, 
    removeImage: false,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(post.image_url || null);

  useEffect(() => {
    if (data.image instanceof File) {
      const url = URL.createObjectURL(data.image);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (data.removeImage) {
      setImagePreview(null);
    } else {
      setImagePreview(post.image_url ?? null);
    }
  }, [data.image, data.removeImage, post.image_url]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setData('image', file);
    setData('removeImage', false);
  }

  function handleRemoveImage() {
    setData('image', null);
    setData('removeImage', true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitPost(route('posts.update', post.id), {
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
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex flex-1 flex-col gap-4 rounded-xl border border-sidebar-border/70 p-10 md:min-h-min dark:border-sidebar-border">
          
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                Edit Post
            </h2>
            <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete} 
                className="cursor-pointer shrink-0"
            >
                Delete
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                      className="absolute top-2 right-2 bg-white/30 hover:bg-white/50 rounded-full p-1 transition-colors"
                      title="Remove image"
                  >
                  <X className="w-4 h-4 text-black cursor-pointer" />
                  </button>
              </div>
              )}
            </div>

            <div>
              <Button type="submit" disabled={!isDirty || processing || !data.content} className="cursor-pointer w-full sm:w-auto">
                {processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}