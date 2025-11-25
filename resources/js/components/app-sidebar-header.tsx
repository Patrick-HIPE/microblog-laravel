import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { GlobalSearch } from '@/components/global-search'; // <--- 1. Import here

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* 2. Add the Search Component here with ml-auto */}
            <div className="ml-auto flex items-center gap-2">
                <GlobalSearch />
            </div>
        </header>
    );
}