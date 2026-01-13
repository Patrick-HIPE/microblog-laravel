import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Search, Loader2, User as UserIcon, FileText, X } from "lucide-react";
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

interface SearchResults {
    users: User[];
    posts: SearchPost[];
}

export function GlobalSearch() {
    const [openDialog, setOpenDialog] = useState(false); 
    const [openDropdown, setOpenDropdown] = useState(false); 
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResults>({ users: [], posts: [] });
    const [loading, setLoading] = useState(false);
    
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
        // FIX: Just return if there is no query. 
        // The clearing of state is handled in handleQueryChange.
        if (!query) return;

        const delayDebounceFn = setTimeout(() => {
            setLoading(true);
            setOpenDropdown(true); 
            axios.get(route('global.search'), { params: { query } })
                .then((res) => {
                    setResults(res.data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error(error);
                    setLoading(false);
                });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleQueryChange = (value: string) => {
        setQuery(value);
        if (!value) {
            // Clearing results here (inside the event handler) is the correct React pattern
            setResults({ users: [], posts: [] });
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
        setResults({ users: [], posts: [] });
    }

    const clearSearch = () => {
        setQuery("");
        setResults({ users: [], posts: [] });
        setOpenDropdown(false);
        inputRef.current?.focus();
    };

    return (
        <>
            <div className="md:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={() => setOpenDialog(true)}
                >
                    <Search className="h-5 w-5" />
                </Button>
            </div>

            <div 
                ref={containerRef} 
                className="hidden md:block relative w-full max-w-sm lg:max-w-lg"
            >
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        id="global-search-input"
                        placeholder="Search users or posts..."
                        className="pl-9 pr-9 bg-muted/50 focus:bg-background transition-colors"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onFocus={() => { if (query) setOpenDropdown(true); }}
                        autoComplete="off"
                    />
                    
                    <div className="absolute right-2.5 top-2.5 flex items-center">
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : query ? (
                            <button 
                                onClick={clearSearch}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>
                </div>

                {openDropdown && query && (
                    <div className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-lg outline-none animate-in fade-in-0 zoom-in-95 z-50 overflow-hidden">
                        <Command shouldFilter={false}>
                            <CommandList>
                                {loading && (
                                    <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                                    </div>
                                )}
                                
                                {!loading && results.users.length === 0 && results.posts.length === 0 && (
                                    <CommandEmpty className="py-6 text-center text-sm">
                                        No results found for "{query}"
                                    </CommandEmpty>
                                )}

                                {!loading && results.users.length > 0 && (
                                    <CommandGroup heading="Users" className="p-2">
                                        {results.users.map((user) => (
                                            <CommandItem
                                                key={`user-${user.id}`}
                                                onSelect={() => handleSelectUser(user.id)}
                                                className="flex items-center gap-4 px-3 py-3 cursor-pointer rounded-md transition-colors hover:bg-accent"
                                            >
                                                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <UserIcon className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col space-y-0.5">
                                                    <span className="text-sm font-semibold text-foreground">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}

                                {!loading && results.posts.length > 0 && (
                                    <CommandGroup heading="Posts" className="p-2">
                                        {results.posts.map((post) => (
                                            <CommandItem
                                                key={`post-${post.id}`}
                                                onSelect={() => handleSelectPost(post.id)}
                                                className="flex items-start gap-4 px-3 py-3 cursor-pointer rounded-md transition-colors hover:bg-accent"
                                            >
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground mt-0.5">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col space-y-1 overflow-hidden">
                                                    <span className="text-sm font-semibold leading-tight text-foreground line-clamp-2">
                                                        {post.preview}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="font-medium text-primary/80">@{post.author.replace(/\s+/g, '').toLowerCase()}</span>
                                                        <span>•</span>
                                                        <span>{post.date}</span>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                            </CommandList>
                        </Command>
                    </div>
                )}
            </div>

            <CommandDialog open={openDialog} onOpenChange={setOpenDialog}>
                <CommandInput 
                    placeholder="Search users or posts..." 
                    value={query}
                    onValueChange={handleQueryChange}
                />
                <CommandList>
                    {loading && (
                        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                        </div>
                    )}
                    
                    {!loading && query && results.users.length === 0 && results.posts.length === 0 && (
                        <CommandEmpty>No results found.</CommandEmpty>
                    )}
                    
                    {results.users.length > 0 && (
                        <CommandGroup heading="Users" className="p-2">
                            {results.users.map((user) => (
                                <CommandItem
                                    key={`user-dialog-${user.id}`}
                                    onSelect={() => handleSelectUser(user.id)}
                                    className="flex items-center gap-4 px-3 py-3"
                                >
                                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <UserIcon className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {results.posts.length > 0 && (
                        <CommandGroup heading="Posts" className="p-2">
                            {results.posts.map((post) => (
                                <CommandItem
                                    key={`post-dialog-${post.id}`}
                                    onSelect={() => handleSelectPost(post.id)}
                                    className="flex items-start gap-4 px-3 py-3"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground mt-0.5">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-semibold leading-tight line-clamp-2">{post.preview}</span>
                                        <span className="text-xs text-muted-foreground">by {post.author} • {post.date}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}