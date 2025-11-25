import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Search, Loader2, User as UserIcon } from "lucide-react";
import { route } from 'ziggy-js';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Button } from '@/components/ui/button';

interface SearchResults {
    users: { id: number; name: string; email: string }[];
}

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResults>({ users: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    useEffect(() => {
        if (!query) {
            setResults({ users: [] });
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            setLoading(true);
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

    const handleSelectUser = (id: number) => {
        setOpen(false);
        router.visit(route('profile.show', id));
    };

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-50 lg:w-80 cursor-pointer"
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline-flex">Search users...</span>
                <span className="inline-flex lg:hidden">Search...</span>
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput 
                    placeholder="Enter a name or email..." 
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
                                    className="cursor-pointer"
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
