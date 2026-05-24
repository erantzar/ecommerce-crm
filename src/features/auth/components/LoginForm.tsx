'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { verify2FAThunk } from '../store/authThunks';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const { twoFAStep, userId, status, error, adminLogin, verify2FA } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const isLoading = status === 'loading';

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    await adminLogin({ email, password });
  }

  async function handle2FASubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    const result = await verify2FA({ userId, code });
    if (verify2FAThunk.fulfilled.match(result as never)) {
      toast.success('Logged in successfully');
      // Honour the ?redirect= param set by the 401 interceptor — admin lands
      // back on the page they were on when their session expired.
      // Guard: only follow relative paths to prevent open-redirect attacks.
      const raw = searchParams.get('redirect') ?? '/';
      const redirectTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
      // Hard navigation: ensures the browser sends the freshly-set cookie to
      // the middleware on a clean request, and bootstrapAdminThunk re-runs on
      // the new page mount to populate currentUser in Redux.
      window.location.href = redirectTo;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            {twoFAStep ? 'Enter the 6-digit code sent to your email' : 'Sign in to the CRM dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!twoFAStep ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                {isLoading ? 'Verifying…' : 'Verify Code'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
