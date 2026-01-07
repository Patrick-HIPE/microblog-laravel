import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react'; 
import { FormEventHandler, useState, useRef } from 'react';
import { User } from 'lucide-react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit, update as updateRoute } from '@/routes/profile'; 
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        _method: 'PATCH', 
        name: auth.user.name,
        email: auth.user.email,
        avatar: null as File | null,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(auth.user.avatar || null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(updateRoute().url, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Profile information"
                        description="Update your name, email address, and profile picture"
                    />

                    <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                        
                        <div className="flex items-center gap-6">
                            <div 
                                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {previewUrl ? (
                                    <img 
                                        src={previewUrl} 
                                        alt="Avatar" 
                                        className="h-full w-full object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                                        <User className="h-10 w-10 text-neutral-400" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="avatar" className="cursor-pointer font-medium text-neutral-700 dark:text-neutral-300">
                                    Profile Picture
                                </Label>
                                <input
                                    type="file"
                                    id="avatar"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Select New Photo
                                </Button>
                                <InputError message={errors.avatar} className="mt-2" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name" className={errors.name ? "text-red-600" : ""}>
                                Name
                            </Label>
                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email" className={errors.email ? "text-red-600" : ""}>
                                Email address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="-mt-4 text-sm text-muted-foreground">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>
                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing} className="cursor-pointer">Save</Button>
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}