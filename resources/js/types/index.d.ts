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
    avatar?: string;
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
    image_url: string | null;
    created_at: string;
    updated_at: string;
    likes_count: number;
    comments_count?: number;
    shares_count?: number;
    liked_by_user: boolean;
    comments?: Comment[];
    user?: PostUser;
}
