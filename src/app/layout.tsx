import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import ThemeProviders from './ThemeProviders';
import MuiProvider from '@/components/providers/MuiProvider';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'E-Commerce CRM',
  description: 'Internal admin dashboard for e-commerce management',
};

const themeInitScript = `
try {
  var t = localStorage.getItem('crm_theme');
  if (t === 'dark') document.documentElement.classList.add('dark');
} catch (_) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background">
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProviders>
            <MuiProvider>
              {children}
              <Toaster richColors position="top-center" />
            </MuiProvider>
          </ThemeProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
