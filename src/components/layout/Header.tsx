'use client';

import { usePathname } from 'next/navigation';
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

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-6 shrink-0">
      <h1 className="text-base font-semibold">{getLabel(pathname)}</h1>
      <Separator orientation="vertical" className="h-5" />
      <p className="text-xs text-muted-foreground">E-Commerce Admin</p>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
