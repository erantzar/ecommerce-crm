'use client';

import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ThemeToggle from '@/features/theme/components/ThemeToggle';

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/products': 'Products',
  '/orders': 'Orders',
  '/profile': 'Profile',
};

function getLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  const segment = pathname.split('/')[1];
  return ROUTE_LABELS[`/${segment}`] ?? segment;
}

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  return (
    <header className="flex h-14 items-center gap-3 border-b bg-card px-4 shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-base font-semibold">{getLabel(pathname)}</h1>
      <Separator orientation="vertical" className="h-5" />
      <p className="hidden sm:block text-xs text-muted-foreground">E-Commerce Admin</p>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
