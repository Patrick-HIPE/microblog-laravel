import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { User as UserIcon } from "lucide-react";
import { BreadcrumbItem } from "@/types";
import { route } from "ziggy-js";

export interface Follower {
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
  followers: Follower[];
  current_user_id: number | null;
}

export default function FollowersPage({ user, followers, current_user_id }: Props) {
  const toggleFollow = (follower: Follower) => {
    router.post(route('users.toggle-follow', { user: follower.id }), {}, {
      preserveScroll: true,
    });
  };

  const goToProfile = (followerId: number) => {
    router.get(route('profile.show', { user: followerId }));
  };

  // Build breadcrumbs dynamically
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profile', href: route('profile.show', { user: user.id }) },
    { title: 'Followers', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${user.name}'s Followers`} />

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">{user.name}'s Followers</h2>

        {followers.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {followers.map((follower) => {
              const isOwnProfile = current_user_id === follower.id;

              return (
                <div
                  key={follower.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => goToProfile(follower.id)}
                  >
                    {follower.avatar_url ? (
                      <img
                        src={follower.avatar_url}
                        alt={follower.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <UserIcon className="h-6 w-6 text-neutral-500 dark:text-neutral-300" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{follower.name}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{follower.email}</p>
                    </div>
                  </div>

                  {!isOwnProfile && (
                    <button
                      onClick={() => toggleFollow(follower)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                        follower.user_is_followed
                          ? "bg-neutral-500 text-white hover:bg-neutral-600"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {follower.user_is_followed ? "Followed" : "Follow"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserIcon className="mb-4 h-12 w-12 text-neutral-500 dark:text-neutral-300" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No followers yet</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              This user hasn’t been followed by anyone yet.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
