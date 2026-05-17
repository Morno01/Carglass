'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentReparatør } from '@/lib/storage';
import { Reparatør } from '@/lib/types';

const navItems = [
  {
    href: '/dagsoversigt',
    label: 'Dagsoversigt',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: '/kalender',
    label: 'Kalender',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/pause',
    label: 'Pause',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [reparatør, setReparatør] = useState<Reparatør | null>(null);

  useEffect(() => {
    setReparatør(getCurrentReparatør());
  }, [pathname]);

  // Hide sidebar on start/login page
  if (pathname === '/') return null;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-navy-800 text-white flex flex-col shadow-xl z-40">
      {/* Logo / Brand */}
      <div className="px-6 py-5 border-b border-navy-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 rounded-lg p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold tracking-wide text-white">Carglass</p>
            <p className="text-xs text-navy-300">Værkstedssystem</p>
          </div>
        </div>
      </div>

      {/* Current repairman */}
      {reparatør && (
        <div className="px-4 py-4 border-b border-navy-700">
          <p className="text-xs text-navy-400 uppercase tracking-wider mb-1">Aktiv bruger</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold text-white">
                {reparatør.navn.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-sm font-medium text-white truncate max-w-[110px]">{reparatør.navn}</span>
            </div>
            <Link
              href="/"
              className="text-xs text-navy-300 hover:text-white transition-colors underline underline-offset-2"
            >
              Skift
            </Link>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-navy-200 hover:bg-navy-700 hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-navy-400'}>{item.icon}</span>
              {item.label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-300" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-navy-700">
        <p className="text-xs text-navy-500 text-center">
          © 2024 Carglass A/S
        </p>
      </div>
    </aside>
  );
}
