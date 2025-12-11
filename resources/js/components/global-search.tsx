import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Search, Loader2, User as UserIcon, X } from "lucide-react";
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

interface User {
    id: number;
    name: string;
    email: string;
}

interface SearchResults {
    users: User[];
}

export function GlobalSearch() {
    // === State ===
    const [openDialog, setOpenDialog] = useState(false); // Mobile Modal state
    const [openDropdown, setOpenDropdown] = useState(false); // Desktop Dropdown state
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResults>({ users: [] });
    const [loading, setLoading] = useState(false);
    
    // Ref for detecting clicks outside the component on desktop
    const containerRef = useRef<HTMLDivElement>(null);

    // === Effects ===

    // Keyboard shortcut (Cmd+K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (window.innerWidth >= 768) {
                    // Desktop: Focus the existing input
                    const input = document.querySelector('#global-search-input') as HTMLInputElement;
                    input?.focus();
                } else {
                    // Mobile: Open the modal
                    setOpenDialog((open) => !open);
                }
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Handle clicking outside to close desktop dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpenDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search API Logic (Debounced)
    useEffect(() => {
        if (!query) {
            setResults({ users: [] });
            setOpenDropdown(false);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            setLoading(true);
            setOpenDropdown(true); // Ensure dropdown is open when searching
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

    // === Handlers ===

    const handleSelectUser = (id: number) => {
        setOpenDialog(false);
        setOpenDropdown(false);
        setQuery(""); // Clear query on selection (optional)
        router.visit(route('profile.show', id));
    };

    const clearSearch = () => {
        setQuery("");
        setOpenDropdown(false);
        // Focus back on input
        const input = document.querySelector('#global-search-input') as HTMLInputElement;
        input?.focus();
    };

    return (
        <>
            {/* ==============================
                MOBILE VIEW (< md)
                Just an Icon Button -> Opens Modal
               ============================== */}
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

            {/* ==============================
                DESKTOP VIEW (>= md)
                Direct Input -> Drops down results
               ============================== */}
            <div 
                ref={containerRef} 
                className="hidden md:block relative w-full max-w-sm lg:max-w-lg"
            >
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="global-search-input"
                        placeholder="Search users..."
                        className="pl-9 pr-9 bg-muted/50 focus:bg-background transition-colors"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => { if (query) setOpenDropdown(true); }}
                        autoComplete="off"
                    />
                    
                    {/* Loading Spinner or Clear Button */}
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

                {/* The Floating Dropdown Results */}
                {openDropdown && query && (
                    <div className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-lg outline-none animate-in fade-in-0 zoom-in-95 z-50 overflow-hidden">
                        <Command shouldFilter={false}>
                            <CommandList>
                                {/* Loading State inside dropdown (optional, if you want to show it here too) */}
                                {loading && (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                        Searching...
                                    </div>
                                )}
                                
                                {/* Empty State */}
                                {!loading && results.users.length === 0 && (
                                    <CommandEmpty className="py-6 text-center text-sm">
                                        No users found.
                                    </CommandEmpty>
                                )}

                                {/* Results */}
                                {!loading && results.users.length > 0 && (
                                    <CommandGroup heading="Users">
                                        {results.users.map((user) => (
                                            <CommandItem
                                                key={user.id}
                                                value={`${user.name} ${user.email}`}
                                                onSelect={() => handleSelectUser(user.id)}
                                                className="cursor-pointer"
                                            >
                                                <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
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

            {/* ==============================
                SHARED: Mobile Modal Component
               ============================== */}
            <CommandDialog open={openDialog} onOpenChange={setOpenDialog}>
                <CommandInput 
                    placeholder="Search users..." 
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    {loading && (
                        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                        </div>
                    )}
                    {!loading && query && results.users.length === 0 && (
                        <CommandEmpty>No results found.</CommandEmpty>
                    )}
                    {results.users.length > 0 && (
                        <CommandGroup heading="Users">
                            {results.users.map((user) => (
                                <CommandItem
                                    key={user.id}
                                    value={`${user.name} ${user.email}`}
                                    onSelect={() => handleSelectUser(user.id)}
                                >
                                    <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <div className="flex flex-col">
                                        <span>{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
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