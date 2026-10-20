'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { rememberNavigation } from '@/lib/navigation-context';
export function NavigationContext() {
  const pathname = usePathname();
  useEffect(() => {
    rememberNavigation(window.location.href, window.location.origin);
    const remember = () => rememberNavigation(window.location.href, window.location.origin);
    document.addEventListener('click', remember, true);
    return () => document.removeEventListener('click', remember, true);
  }, [pathname]);
  return null;
}
