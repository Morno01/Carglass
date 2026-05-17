'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getOpgaver, saveOpgaver, getCurrentReparatør, getReparatører } from '@/lib/storage';
import { Opgave, Status } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

const STATUSER: Status[] = ['Afventer', 'I gang', 'Færdig'];

const statusStyle: Record<Status, string> = {
  Afventer: 'border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100',
  'I gang': 'border-blue-400 bg-blue-50 text-blue-800 hover:bg-blue-100',
  Færdig:   'border-green-400 bg-green-50 text-green-800 hover:bg-green-100',
};
const statusActiveStyle: Record<Status, string> = {
  Afventer: 'border-amber-500 bg-amber-500 text-white shadow-md scale-105',
  'I gang': 'border-blue-600 bg-blue-600 text-white shadow-md scale-105',
  Færdig:   'border-green-600 bg-green-600 text-white shadow-md scale-105',
};

function formatDato(dato: string): string {
  const d = new Date(dato + 'T00:00:00');
  return d.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function OpgaveDetaljerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [opgave, setOpgave] = useState<Opgave | null>(null);
  const [reparatørNavn, setReparatørNavn] = useState('');
  const [gemt, setGemt] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const rep = getCurrentReparatør();
    if (!rep) { router.push('/'); return; }
    const alle = getOpgaver();
    const found = alle.find((o) => o.id === id) ?? null;
    setOpgave(found);
    const reps = getReparatører();
    if (found) {
      const r = reps.find((r) => r.id === found.reparatørId);
      setReparatørNavn(r?.navn ?? 'Ukendt');
    }
    setMounted(true);
  }, [id, router]);

  function opdaterStatus(nyStatus: Status) {
    if (!opgave) return;
    const opdateret = { ...opgave, status: nyStatus };
    setOpgave(opdateret);
    const alle = getOpgaver();
    saveOpgaver(alle.map((o) => (o.id === opgave.id ? opdateret : o)));
    setGemt(true);
    setTimeout(() => setGemt(false), 2000);
  }

  if (!mounted) return null;
  if (!opgave) return (
    <div className="p-8">
      <p className="text-slate-500">Opgave ikke fundet.</p>
      <Link href="/dagsoversigt" className="btn-primary inline-block mt-4">Tilbage</Link>
    </div>
  );

  return (
    <div className="p-8 max-w-3xl">
      {/* Back + title */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dagsoversigt" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tilbage
        </Link>
        <div className="h-4 w-px bg-slate-300" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{opgave.kundenavn}</h1>
          <p className="text-sm text-slate-500 capitalize">{formatDato(opgave.dato)} · {opgave.starttid}</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left column */}
        <div className="col-span-3 space-y-5">
          {/* Customer */}
          <div className="card p-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Kundeinformation</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-navy-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {opgave.kundenavn.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{opgave.kundenavn}</p>
                  <a href={`tel:${opgave.kundeKontakt}`} className="text-sm text-blue-600 hover:underline">{opgave.kundeKontakt}</a>
                </div>
              </div>
            </div>
          </div>

          {/* Car */}
          <div className="card p-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Bilinformation</h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Mærke</p>
                <p className="font-semibold text-slate-800">{opgave.bil.mærke}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Model</p>
                <p className="font-semibold text-slate-800">{opgave.bil.model}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Nummerplade</p>
                <p className="font-bold font-mono text-slate-900 bg-yellow-50 border border-yellow-300 rounded px-2 py-0.5 inline-block">{opgave.bil.nummerplade}</p>
              </div>
            </div>
          </div>

          {/* Task info */}
          <div className="card p-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Opgavebeskrivelse</h2>
            <p className="text-sm font-semibold text-blue-700 mb-2">{opgave.opgavetype}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{opgave.beskrivelse || 'Ingen beskrivelse.'}</p>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-2 space-y-5">
          {/* Quick stats */}
          <div className="card p-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detaljer</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Reparatør</span>
                <span className="font-semibold text-slate-800">{reparatørNavn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tidsestimat</span>
                <span className="font-semibold text-slate-800">{opgave.tidsestimat} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Starttid</span>
                <span className="font-semibold text-slate-800">{opgave.starttid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status</span>
                <StatusBadge status={opgave.status} size="sm" />
              </div>
            </div>
          </div>

          {/* Status change */}
          <div className="card p-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Skift status</h2>
            <div className="space-y-2">
              {STATUSER.map((s) => {
                const isActive = opgave.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => opdaterStatus(s)}
                    className={`w-full py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all duration-150 ${isActive ? statusActiveStyle[s] : statusStyle[s]}`}
                  >
                    {isActive && <span className="mr-2">✓</span>}
                    {s}
                  </button>
                );
              })}
            </div>
            {gemt && (
              <div className="mt-3 text-center text-xs font-semibold text-green-600 bg-green-50 rounded-lg py-2">
                Status gemt ✓
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
