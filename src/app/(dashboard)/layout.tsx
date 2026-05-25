import DashboardShell from '@/components/layout/DashboardShell';
import TokenExpiryWatcher from '@/components/layout/TokenExpiryWatcher';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      <TokenExpiryWatcher />
      <ErrorBoundary>{children}</ErrorBoundary>
    </DashboardShell>
  );
}
