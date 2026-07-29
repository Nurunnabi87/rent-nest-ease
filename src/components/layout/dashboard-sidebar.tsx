"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ClipboardList,
  Home,
  LayoutDashboard,
  ListChecks,
  Menu,
  PlusCircle,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { Role } from "@/types/models";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  TENANT: [
    { href: "/dashboard/tenant", label: "Overview", icon: LayoutDashboard },
    { href: "/properties", label: "Browse properties", icon: Home },
  ],
  LANDLORD: [
    { href: "/dashboard/landlord", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/landlord/properties", label: "My properties", icon: Building2 },
    { href: "/dashboard/landlord/properties/new", label: "Add property", icon: PlusCircle },
    { href: "/dashboard/landlord/requests", label: "Rental requests", icon: ClipboardList },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/properties", label: "All properties", icon: Building2 },
    { href: "/dashboard/admin/rentals", label: "All rentals", icon: ListChecks },
  ],
};

function NavLinks({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = NAV_BY_ROLE[role] ?? [];

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r pt-6 pr-4 lg:block">
        <div className="sticky top-20">
          <p className="mb-3 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {user.role} panel
          </p>
          <NavLinks role={user.role} />
        </div>
      </aside>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="mb-4">
              <Menu className="size-4" />
              Dashboard menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>{user.role} panel</SheetTitle>
            </SheetHeader>
            <div className="px-4">
              <NavLinks role={user.role} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
