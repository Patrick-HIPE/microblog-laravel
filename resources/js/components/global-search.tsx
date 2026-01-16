import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Search, Loader2, User as UserIcon, FileText, X, ChevronDown } from "lucide-react";
import { route } from 'ziggy-js';
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Post } from '@/types';

interface SearchPost extends Post {
    author: string;
    preview: string;
    date: string;
}

interface PaginatedResponse<T> {
    data: T[];
    next_page_url: string | null;
}

interface SearchResults {
    users: PaginatedResponse<User>;
    posts: PaginatedResponse<SearchPost>;
}

const emptyResults: SearchResults = {
    users: { data: [], next_page_url: null },
    posts: { data: [], next_page_url: null }
};

export function GlobalSearch() {
    const [openDialog, setOpenDialog] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResults>(emptyResults);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState({ users: false, posts: false });

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (window.innerWidth >= 768) {
                    inputRef.current?.focus();
                } else {
                    setOpenDialog((open) => !open);
                }
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpenDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query) return;

        const delayDebounceFn = setTimeout(() => {
            setLoading(true);
            setOpenDropdown(true);
            axios.get(route('global.search'), { params: { query } })
                .then((res) => {
                    setResults(res.data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const loadMore = async (type: 'users' | 'posts') => {
        const url = results[type].next_page_url;
        if (!url || loadingMore[type]) return;

        setLoadingMore(prev => ({ ...prev, [type]: true }));
        try {
            const res = await axios.get(url, { params: { query } });
            setResults(prev => ({
                ...prev,
                [type]: {
                    data: [...prev[type].data, ...res.data[type].data],
                    next_page_url: res.data[type].next_page_url
                }
            }));
        } finally {
            setLoadingMore(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleQueryChange = (value: string) => {
        setQuery(value);
        if (!value) {
            setResults(emptyResults);
            setOpenDropdown(false);
        }
    };

    const handleSelectUser = (id: number) => {
        closeAll();
        router.visit(route('profile.show', id));
    };

    const handleSelectPost = (id: number) => {
        closeAll();
        router.visit(`/posts/${id}`);
    };

    const closeAll = () => {
        setOpenDialog(false);
        setOpenDropdown(false);
        setQuery("");
        setResults(emptyResults);
    }

    const clearSearch = () => {
        setQuery("");
        setResults(emptyResults);
        setOpenDropdown(false);
        inputRef.current?.focus();
    };

    const LoadMoreTrigger = ({ type }: { type: 'users' | 'posts' }) => {
        if (!results[type].next_page_url) return null;
        return (
            <div className="p-1 border-t mt-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-foreground justify-center gap-2 cursor-pointer"
                    onClick={(e) => {
                        e.preventDefault();
                        loadMore(type);
                    }}
                    disabled={loadingMore[type]}
                >
                    {loadingMore[type] ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <ChevronDown className="h-3 w-3" />
                    )}
                    Load more {type}
                </Button>
            </div>
        );
    };

    return (
        <>
            <div className="md:hidden">
                <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setOpenDialog(true)}>
                    <Search className="h-5 w-5" />
                </Button>
            </div>

            <div ref={containerRef} className="hidden md:block relative w-full max-w-sm lg:max-w-lg">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        placeholder="Search users or posts..."
                        className="pl-9 pr-9 bg-muted/50 focus:bg-background transition-colors"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onFocus={() => { if (query) setOpenDropdown(true); }}
                        autoComplete="off"
                    />
                    <div className="absolute right-2.5 top-2.5 flex items-center">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : query ? (
                            <button onClick={clearSearch} className="text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>
                </div>

                {openDropdown && query && (
                    <div className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-lg z-50 overflow-hidden">
                        <Command shouldFilter={false}>
                            <CommandList className="max-h-[450px]">
                                {loading && results.users.data.length === 0 && (
                                    <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                                    </div>
                                )}

                                {!loading && results.users.data.length === 0 && results.posts.data.length === 0 && (
                                    <CommandEmpty className="py-6 text-center text-sm">No results found for "{query}"</CommandEmpty>
                                )}

                                {results.users.data.length > 0 && (
                                    <CommandGroup heading="Users" className="p-2">
                                        {results.users.data.map((user) => (
                                            <CommandItem key={`user-${user.id}`} onSelect={() => handleSelectUser(user.id)} className="flex items-center gap-4 px-3 py-3 cursor-pointer">
                                                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center">
                                                    {user.avatar ? <img src={user.avatar} className="h-full w-full object-cover" /> : <UserIcon className="h-5 w-5 text-primary" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                        <LoadMoreTrigger type="users" />
                                    </CommandGroup>
                                )}

                                {results.posts.data.length > 0 && (
                                    <CommandGroup heading="Posts" className="p-2">
                                        {results.posts.data.map((post) => (
                                            <CommandItem key={`post-${post.id}`} onSelect={() => handleSelectPost(post.id)} className="flex items-start gap-4 px-3 py-3 cursor-pointer">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground mt-0.5">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col space-y-1 overflow-hidden">
                                                    <span className="text-sm font-semibold line-clamp-2">{post.preview}</span>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="font-medium text-primary/80">@{post.author.replace(/\s+/g, '').toLowerCase()}</span>
                                                        <span>• {post.date}</span>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                        <LoadMoreTrigger type="posts" />
                                    </CommandGroup>
                                )}
                            </CommandList>
                        </Command>
                    </div>
                )}
            </div>

            <CommandDialog open={openDialog} onOpenChange={setOpenDialog}>
                <CommandInput placeholder="Search users or posts..." value={query} onValueChange={handleQueryChange} />
                <CommandList>
                    {loading && results.users.data.length === 0 && (
                        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
                        </div>
                    )}
                    
                    {results.users.data.length > 0 && (
                        <CommandGroup heading="Users" className="p-2">
                            {results.users.data.map((user) => (
                                <CommandItem key={`user-dialog-${user.id}`} onSelect={() => handleSelectUser(user.id)} className="flex items-center gap-4 px-3 py-3">
                                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center">
                                        {user.avatar ? <img src={user.avatar} className="h-full w-full object-cover" /> : <UserIcon className="h-5 w-5 text-primary" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </CommandItem>
                            ))}
                            <LoadMoreTrigger type="users" />
                        </CommandGroup>
                    )}

                    {results.posts.data.length > 0 && (
                        <CommandGroup heading="Posts" className="p-2">
                            {results.posts.data.map((post) => (
                                <CommandItem key={`post-dialog-${post.id}`} onSelect={() => handleSelectPost(post.id)} className="flex items-start gap-4 px-3 py-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground mt-0.5">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-semibold line-clamp-2">{post.preview}</span>
                                        <span className="text-xs text-muted-foreground">by {post.author} • {post.date}</span>
                                    </div>
                                </CommandItem>
                            ))}
                            <LoadMoreTrigger type="posts" />
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
