'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function TopNav({ onSearchClick, searchOpen }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-navy-800 text-white shadow-md">
      <div className="flex items-center justify-between px-4 h-auto">
        <button
          onClick={() => router.push('/')}
          className="text-white font-bold text-lg tracking-tight hover:text-navy-200 transition-colors"
        >
          Carglass Dashboard
        </button>

        <button
          onClick={onSearchClick}
          aria-label="Søg"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            searchOpen ? 'bg-white/20 text-white' : 'text-navy-200 hover:bg-white/10 hover:text-white'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          Søg
        </button>
      </div>
    </header>
  );
}
