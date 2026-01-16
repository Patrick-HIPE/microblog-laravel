import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { router } from '@inertiajs/react';

interface Props {
    meta: {
        current_page: number;
        last_page: number;
    };
    params?: Record<string, string | number>; // For extra data like { tab: 'shares' }
}

export default function PaginationLinks({ meta, params = {} }: Props) {
    const { current_page, last_page } = meta;

    const handlePageChange = (page: number) => {
        if (page < 1 || page > last_page || page === current_page) return;

        router.get(window.location.pathname, { ...params, page }, {
            preserveState: true,
            preserveScroll: false, // Profile usually feels better scrolling to top on page change
            onSuccess: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        });
    };

    const getPageNumbers = () => {
        const items: (number | string)[] = [];
        const maxVisiblePages = 5;
        if (last_page <= maxVisiblePages) {
            for (let i = 1; i <= last_page; i++) items.push(i);
        } else {
            items.push(1);
            if (current_page > 3) items.push('ellipsis-start');
            const start = Math.max(2, current_page - 1);
            const end = Math.min(last_page - 1, current_page + 1);
            for (let i = start; i <= end; i++) items.push(i);
            if (current_page < last_page - 2) items.push('ellipsis-end');
            items.push(last_page);
        }
        return items;
    };

    if (last_page <= 1) return null;

    return (
        <Pagination className="mt-10">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href="#" 
                        onClick={(e) => { e.preventDefault(); handlePageChange(current_page - 1); }}
                        className={current_page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                    />
                </PaginationItem>

                {getPageNumbers().map((item, index) => (
                    <PaginationItem key={index}>
                        {typeof item === 'number' ? (
                            <PaginationLink href="#" isActive={item === current_page}
                                onClick={(e) => { e.preventDefault(); handlePageChange(item); }}>
                                {item}
                            </PaginationLink>
                        ) : <PaginationEllipsis />}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext href="#" 
                        onClick={(e) => { e.preventDefault(); handlePageChange(current_page + 1); }}
                        className={current_page >= last_page ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
