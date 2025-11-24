import { usePage, Link } from "@inertiajs/react";
import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BookOpen, Folder, LayoutGrid, House, CircleUserRound } from "lucide-react";
import AppLogo from "./app-logo";
import { dashboard } from "@/routes";
import { type NavItem } from "@/types";

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const userId = auth?.user?.id;

    const mainNavItems: NavItem[] = [
        { title: "Home", href: dashboard(), icon: House },
        { title: "My Posts", href: "/posts", icon: LayoutGrid },
        {
            title: "Profile",
            href: userId ? `/profile/${userId}` : "#",
            icon: CircleUserRound,
        },
    ];

    const footerNavItems: NavItem[] = [
        { title: "Repository", href: "https://github.com/laravel/react-starter-kit", icon: Folder },
        { title: "Documentation", href: "https://laravel.com/docs/starter-kits#react", icon: BookOpen },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser {...({ name: auth?.user?.name, profileHref: userId ? `/profile/${userId}` : "#" } as any)} />
            </SidebarFooter>
        </Sidebar>
    );
}
