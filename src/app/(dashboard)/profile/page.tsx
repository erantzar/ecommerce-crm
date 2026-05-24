'use client';

import { useRouter } from 'next/navigation';
import {
  Mail,
  Shield,
  CalendarDays,
  RefreshCw,
  Hash,
  CheckCircle2,
  XCircle,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      {/* Identity skeleton */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-5">
            <Skeleton className="h-20 w-20 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Details skeleton */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-md shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface DetailRowProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

/** Single labelled field row used in the Account Information card. */
function DetailRow({ icon: Icon, label, value, mono = false }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <div
          className={[
            'mt-0.5 text-sm font-medium text-foreground break-all',
            mono ? 'font-mono text-xs tracking-tight text-muted-foreground' : '',
          ].join(' ')}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, status, error, logout } = useAuth();

  // currentUser is null while fetchMeThunk is in-flight (page refresh) or
  // when auth failed. Show skeleton until data arrives.
  const isReady = !!currentUser;
  const hasFailed = status === 'failed' && !currentUser;

  async function handleLogout() {
    await logout();
    toast.success('Signed out successfully');
    router.push('/login');
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!isReady && !hasFailed) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <ProfileSkeleton />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (hasFailed) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm text-destructive">Failed to load profile: {error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Render (currentUser is guaranteed non-null here) ───────────────────────
  const user = currentUser!;
  const isAdmin = user.role === 'admin';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* ── Identity Card ─────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Avatar + identity */}
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 shrink-0 text-xl ring-2 ring-border">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 space-y-1.5">
                <p className="text-xl font-bold leading-tight">{user.name}</p>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={isAdmin ? 'default' : 'secondary'}>
                    <Shield className="mr-1 h-3 w-3" />
                    {isAdmin ? 'Administrator' : 'Customer'}
                  </Badge>

                  {user.isVerified ? (
                    <Badge
                      variant="outline"
                      className="border-green-500/30 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-3 w-3" />
                      Unverified
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* Logout — top-right on desktop, stacked on mobile */}
            <Button
              variant="outline"
              size="sm"
              className="w-full shrink-0 border-destructive/20 text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive sm:w-auto"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Account Information ────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your CRM account details and system metadata.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="divide-y divide-border">
            <DetailRow
              icon={Mail}
              label="Email Address"
              value={user.email}
            />

            <DetailRow
              icon={Shield}
              label="System Role"
              value={
                <span className={isAdmin ? 'text-primary' : undefined}>
                  {isAdmin
                    ? 'Administrator — Full CRM Access'
                    : 'Customer — Read-only Access'}
                </span>
              }
            />

            <DetailRow
              icon={user.isVerified ? CheckCircle2 : XCircle}
              label="Account Status"
              value={
                <span
                  className={
                    user.isVerified
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-destructive'
                  }
                >
                  {user.isVerified ? 'Verified & Active' : 'Pending Email Verification'}
                </span>
              }
            />

            <DetailRow
              icon={CalendarDays}
              label="Member Since"
              value={formatDate(user.createdAt)}
            />

            <DetailRow
              icon={RefreshCw}
              label="Last Updated"
              value={formatDate(user.updatedAt)}
            />

            <DetailRow
              icon={Hash}
              label="Account ID"
              value={user._id}
              mono
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
