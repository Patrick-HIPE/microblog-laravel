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
import { LayoutGrid, House, CircleUserRound } from "lucide-react";
import AppLogo from "./app-logo";
import { route } from "ziggy-js";
import { type NavItem, type SharedData } from "@/types";

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const userId = auth?.user?.id;

    const mainNavItems: NavItem[] = [
        { 
            title: "Home", 
            href: route("dashboard"),
            icon: House 
        },
        { 
            title: "My Posts", 
            href: route("posts.index"),
            icon: LayoutGrid 
        },
        {
            title: "Profile",
            href: userId ? route("profile.show", { user: userId }) : "#",
            icon: CircleUserRound,
        },
    ];

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route("dashboard")} prefetch>
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
                {auth.user && <NavUser />}
            </SidebarFooter>
        </Sidebar>
    );
}
