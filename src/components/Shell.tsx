'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStartPage = pathname === '/';

  if (isStartPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation />
      <main className="ml-64 min-h-screen">{children}</main>
    </>
  );
}
