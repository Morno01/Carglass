'use client';

import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isStart = pathname === '/';
  return (
    <main className={isStart ? 'min-h-screen' : 'ml-64 min-h-screen'}>
      {children}
    </main>
  );
}
