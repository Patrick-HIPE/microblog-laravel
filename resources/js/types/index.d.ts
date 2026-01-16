import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    avatar?: string | null;
    followers_count?: number;
    following_count?: number;
    followers?: { id: number }[];
    following?: { id: number }[];
}

export interface Comment {
    id: number;
    body: string;
    created_at: string;
    user: User;
}

export interface PostUser {
  id: number;
  name: string;
  avatar?: string | null;
}

export interface Post {
    id: number;
    content: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
    likes_count: number;
    comments_count?: number;
    shares_count?: number;
    liked_by_user: boolean;
    shared_by_user: boolean;
    comments?: Comment[];
    user?: PostUser;
    is_share?: boolean;
    is_deleted?: boolean;
    shared_at?: string;
    shared_by?: PostUser;
}

export interface Share extends Post {
    is_deleted: boolean;
    shared_by: PostUser;
    is_share?: boolean;
    shared_at: string;
    error?: string;
    id: number;
    user_id: number;
    post_id: number;
    created_at: string;
    updated_at: string;
    user: User;
    post: Post;
}
