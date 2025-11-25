import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { User as UserIcon } from "lucide-react";
import { BreadcrumbItem } from "@/types";
import { route } from "ziggy-js";

export interface Following {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  user_is_followed: boolean;
}

interface Props {
  user: {
    id: number;
    name: string;
  };
  following: Following[];
  current_user_id: number | null;
}

export default function FollowingPage({ user, following, current_user_id }: Props) {
  const toggleFollow = (f: Following) => {
    router.post(route('users.toggle-follow', { user: f.id }), {}, {
      preserveScroll: true,
    });
  };

  const goToProfile = (id: number) => {
    router.get(route('profile.show', { user: id }));
  };

  // Build breadcrumbs dynamically
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profile', href: route('profile.show', { user: user.id }) },
    { title: 'Following', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${user.name}'s Following`} />

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">{user.name}'s Following</h2>

        {following.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {following.map((f) => {
              const isOwnProfile = current_user_id === f.id;

              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => goToProfile(f.id)}
                  >
                    {f.avatar_url ? (
                      <img
                        src={f.avatar_url}
                        alt={f.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <UserIcon className="h-6 w-6 text-neutral-500 dark:text-neutral-300" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{f.name}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{f.email}</p>
                    </div>
                  </div>

                  {!isOwnProfile && (
                    <button
                      onClick={() => toggleFollow(f)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                        f.user_is_followed
                          ? "bg-neutral-500 text-white hover:bg-neutral-600"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {f.user_is_followed ? "Followed" : "Follow"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserIcon className="mb-4 h-12 w-12 text-neutral-500 dark:text-neutral-300" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Not following anyone yet
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              This user hasn’t followed anyone yet.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
