'use client';

import { useRouter } from 'next/navigation';
import { getReparatører, setCurrentReparatør } from '@/lib/storage';
import { Reparatør } from '@/lib/types';

export default function StartPage() {
  const router = useRouter();
  const reparatører = getReparatører();

  function vælgBruger(r: Reparatør) {
    setCurrentReparatør(r);
    router.push('/dagsoversigt');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
      <div className="w-full max-w-md px-6">
        {/* Logo / Brand block */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-blue-500 rounded-2xl p-4 mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-.001M13 16l2-5h5l2 5M13 16H9m4 0h6" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Carglass</h1>
          <p className="text-navy-300 mt-1 text-sm">Værkstedssystem</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-6 bg-slate-50 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 text-center">Hvem er du?</h2>
            <p className="text-sm text-slate-500 text-center mt-1">Vælg dit navn for at fortsætte</p>
          </div>
          <div className="p-6 space-y-3">
            {reparatører.map((r) => (
              <button
                key={r.id}
                onClick={() => vælgBruger(r)}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-150 group"
              >
                {/* Avatar */}
                <div className="h-11 w-11 rounded-full bg-navy-800 flex items-center justify-center text-white font-bold text-base flex-shrink-0 group-hover:bg-blue-600 transition-colors duration-150">
                  {r.navn.split(' ').map((n) => n[0]).join('')}
                </div>
                <span className="text-slate-800 font-semibold text-base group-hover:text-blue-700 transition-colors">
                  {r.navn}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300 group-hover:text-blue-500 ml-auto transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-navy-500 text-xs mt-6">© 2024 Carglass A/S · Internt system</p>
      </div>
    </div>
  );
}
