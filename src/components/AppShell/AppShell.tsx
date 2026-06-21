'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import Sidebar from '@/components/Sidebar/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loginRole, teacher } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  // Public routes that don't need auth
  const isPublicRoute = pathname === '/login' || pathname === '/';
  const isParentRoute = pathname.startsWith('/parent');

  React.useEffect(() => {
    if (!isLoggedIn && !isPublicRoute) {
      router.push('/login');
    }
    
    // Redirect logged in users away from public routes
    if (isLoggedIn) {
      if (loginRole === 'parent' && !isParentRoute) {
        router.push('/parent');
      } else if (loginRole === 'teacher' && isPublicRoute) {
        // If they are an admin, go to /admin. Otherwise /dashboard.
        router.push(teacher?.role === 'admin' ? '/admin' : '/dashboard');
      }
    }
  }, [isLoggedIn, loginRole, teacher, pathname, isPublicRoute, isParentRoute, router]);

  // Login page — no sidebar, no margin
  if (isPublicRoute || !isLoggedIn) {
    return <>{children}</>;
  }

  // Parent portal — no sidebar, centered layout
  if (isParentRoute) {
    return (
      <main style={{
        minHeight: '100vh',
        padding: '32px',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        {children}
      </main>
    );
  }

  // Teacher dashboard — full layout with sidebar
  return (
    <>
      <Sidebar />
      <main style={{
        marginLeft: 'var(--sidebar-width)',
        minHeight: '100vh',
        padding: '32px',
        transition: 'margin-left 250ms cubic-bezier(0.2, 0, 0, 1)',
      }}>
        {children}
      </main>
    </>
  );
}
