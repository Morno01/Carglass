'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function TopNav({ onSearchClick, searchOpen }) {
  const router = useRouter();
  const pathname = usePathname();

  const btnBase = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
  const btnActive = 'bg-white/20 text-white';
  const btnInactive = 'text-navy-200 hover:bg-white/10 hover:text-white';

  return (
    <header className="sticky top-0 z-40 bg-navy-800 text-white shadow-md">
      {/* Row 1: brand + dashboard button */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-navy-700/60">
        <span className="text-white font-bold text-lg tracking-tight">
          Carglass Dashboard
        </span>
        <button
          onClick={() => router.push('/')}
          aria-label="Dashboard"
          className={`${btnBase} ${pathname === '/' ? btnActive : btnInactive}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M1 2.75A.75.75 0 011.75 2h4a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4A.75.75 0 011 7.25v-4.5zM1 12.75a.75.75 0 01.75-.75h4a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4a.75.75 0 01-.75-.75v-4.5zM9.25 2a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h4a.75.75 0 00.75-.75v-4.5A.75.75 0 0013.25 2h-4zM9.25 12a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h4a.75.75 0 00.75-.75v-4.5a.75.75 0 00-.75-.75h-4z" clipRule="evenodd" />
          </svg>
          Dashboard
        </button>
      </div>

      {/* Row 2: nav buttons */}
      <div className="flex items-center justify-end gap-1 px-4 py-1.5">
        <button
          onClick={onSearchClick}
          aria-label="Søg"
          className={`${btnBase} ${searchOpen ? btnActive : btnInactive}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          Søg
        </button>

        <button
          onClick={() => router.push('/kalender')}
          aria-label="Kalender"
          className={`${btnBase} ${pathname === '/kalender' ? btnActive : btnInactive}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
          </svg>
          Kalender
        </button>

        <button
          onClick={() => router.push('/pause')}
          aria-label="Pause"
          className={`${btnBase} ${pathname === '/pause' ? btnActive : btnInactive}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M2.5 3A1.5 1.5 0 001 4.5v4A1.5 1.5 0 002.5 10h.75a.75.75 0 010 1.5H2.5A3 3 0 01-.5 8.5v-4A3 3 0 012.5 1.5h15A3 3 0 0120.5 4.5v4A3 3 0 0117.5 11.5h-.75a.75.75 0 010-1.5h.75A1.5 1.5 0 0019 8.5v-4A1.5 1.5 0 0017.5 3h-15z" clipRule="evenodd" />
            <path d="M3 13.5a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 13.5zM3 16.5a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 16.5z" />
          </svg>
          Pause
        </button>
      </div>
    </header>
  );
}
