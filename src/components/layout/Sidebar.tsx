'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  UserCircle,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/features/auth/hooks/useAuth';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  return (
    <aside
      className={cn(
        // Base styles — always applied
        'flex flex-col h-full border-r bg-card px-4 py-6 shrink-0 w-64',
        // Mobile: fixed overlay drawer, off-screen by default
        'fixed inset-y-0 left-0 z-30 transition-transform duration-200',
        // Desktop: static column, always visible
        'lg:static lg:translate-x-0',
        // Toggle visibility on mobile
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      {/* Mobile close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="Close menu"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="mb-6 px-2 pr-10 lg:pr-2">
        <span className="text-xl font-bold tracking-tight">CRM Admin</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-4" />

      <div className="flex items-center gap-3 px-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={currentUser?.image} />
          <AvatarFallback>{currentUser?.name?.charAt(0) ?? 'A'}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{currentUser?.name ?? 'Admin'}</p>
          <p className="truncate text-xs text-muted-foreground">{currentUser?.email ?? ''}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => logout()}
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
