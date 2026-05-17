'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOpgaver, getCurrentReparatør } from '@/lib/storage';
import { Opgave, Reparatør } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('da-DK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const opgavetypeIcon: Record<string, string> = {
  'Forrude udskiftning': '🪟',
  'Stenskade reparation': '🔍',
  'Siderude udskiftning': '🚗',
};

function getIcon(type: string) {
  return opgavetypeIcon[type] ?? '🔧';
}

export default function DagsoversightPage() {
  const router = useRouter();
  const [reparatør, setReparatør] = useState<Reparatør | null>(null);
  const [opgaver, setOpgaver] = useState<Opgave[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const rep = getCurrentReparatør();
    if (!rep) {
      router.push('/');
      return;
    }
    setReparatør(rep);
    const today = todayString();
    const alle = getOpgaver();
    const dagensOpgaver = alle
      .filter((o) => o.reparatørId === rep.id && o.dato === today)
      .sort((a, b) => a.starttid.localeCompare(b.starttid));
    setOpgaver(dagensOpgaver);
  }, [router]);

  if (!mounted) return null;

  const afventer = opgaver.filter((o) => o.status === 'Afventer').length;
  const iGang = opgaver.filter((o) => o.status === 'I gang').length;
  const færdig = opgaver.filter((o) => o.status === 'Færdig').length;

  return (
    <div className="p-8 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dagsoversigt</h1>
        <p className="text-slate-500 mt-1 capitalize">{formatDate(todayString())}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Afventer</p>
          <p className="text-3xl font-bold text-amber-600">{afventer}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">I gang</p>
          <p className="text-3xl font-bold text-blue-600">{iGang}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Færdig</p>
          <p className="text-3xl font-bold text-green-600">{færdig}</p>
        </div>
      </div>

      {/* Task list */}
      {opgaver.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-slate-500 font-medium text-lg">Ingen opgaver i dag</p>
          <p className="text-slate-400 text-sm mt-1">
            {reparatør?.navn} har ingen bookinger for i dag.
          </p>
          <Link href="/kalender" className="btn-primary inline-block mt-5 text-sm">
            Se kalender
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {opgaver.map((opgave) => (
            <Link
              key={opgave.id}
              href={`/opgave/${opgave.id}`}
              className="card flex items-center gap-5 p-5 hover:shadow-md hover:border-blue-200 transition-all duration-150 block"
            >
              {/* Time */}
              <div className="flex-shrink-0 text-center w-16">
                <p className="text-2xl font-bold text-navy-800">{opgave.starttid}</p>
                <p className="text-xs text-slate-400">{opgave.tidsestimat} min</p>
              </div>

              {/* Divider */}
              <div className="w-px h-14 bg-slate-200 flex-shrink-0" />

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{getIcon(opgave.opgavetype)}</span>
                  <p className="font-semibold text-slate-800 text-base truncate">{opgave.kundenavn}</p>
                </div>
                <p className="text-sm text-slate-500 truncate">
                  {opgave.bil.mærke} {opgave.bil.model} · <span className="font-mono">{opgave.bil.nummerplade}</span>
                </p>
                <p className="text-sm text-slate-600 mt-0.5">{opgave.opgavetype}</p>
              </div>

              {/* Status */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                <StatusBadge status={opgave.status} size="sm" />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
