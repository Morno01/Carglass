'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentReparatør, getPauser, savePauser } from '@/lib/storage';
import { Pause, Reparatør } from '@/lib/types';

function iDag(): string {
  return new Date().toISOString().split('T')[0];
}

function formatTid(iso: string): string {
  return new Date(iso).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function varighed(start: string, slut: string | null): string {
  const ms = (slut ? new Date(slut) : new Date()).getTime() - new Date(start).getTime();
  const sek = Math.floor(ms / 1000);
  const min = Math.floor(sek / 60);
  const timer = Math.floor(min / 60);
  if (timer > 0) return `${timer}t ${min % 60}m`;
  return `${min}m ${sek % 60}s`;
}

export default function PausePage() {
  const router = useRouter();
  const [reparatør, setReparatør] = useState<Reparatør | null>(null);
  const [pauser, setPauser] = useState<Pause[]>([]);
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const rep = getCurrentReparatør();
    if (!rep) { router.push('/'); return; }
    setReparatør(rep);
    const alle = getPauser();
    const dagensP = alle.filter((p) => p.reparatørId === rep.id && p.dato === iDag());
    setPauser(dagensP);
    setMounted(true);
  }, [router]);

  useEffect(() => {
    intervalRef.current = setInterval(() => setTick((t) => t + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const aktivPause = pauser.find((p) => p.slut === null) ?? null;

  function startPause() {
    if (!reparatør || aktivPause) return;
    const ny: Pause = {
      id: `pause-${Date.now()}`,
      reparatørId: reparatør.id,
      dato: iDag(),
      start: new Date().toISOString(),
      slut: null,
    };
    const opdateret = [...pauser, ny];
    setPauser(opdateret);
    const alle = getPauser().filter((p) => !(p.reparatørId === reparatør.id && p.dato === iDag()));
    savePauser([...alle, ...opdateret]);
  }

  function slutPause() {
    if (!reparatør || !aktivPause) return;
    const opdateret = pauser.map((p) =>
      p.id === aktivPause.id ? { ...p, slut: new Date().toISOString() } : p
    );
    setPauser(opdateret);
    const alle = getPauser().filter((p) => !(p.reparatørId === reparatør.id && p.dato === iDag()));
    savePauser([...alle, ...opdateret]);
  }

  const samletMs = pauser
    .filter((p) => p.slut !== null)
    .reduce((acc, p) => acc + new Date(p.slut!).getTime() - new Date(p.start).getTime(), 0);
  const samletMin = Math.floor(samletMs / 60000);

  if (!mounted) return null;

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Pause-stempling</h1>
        <p className="text-slate-500 mt-1">{reparatør?.navn}</p>
      </div>

      {/* Main action */}
      <div className="card p-8 text-center mb-6">
        {aktivPause ? (
          <>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Pause aktiv
            </div>
            <p className="text-5xl font-bold text-slate-900 font-mono mb-2" suppressHydrationWarning>
              {varighed(aktivPause.start, null)}
            </p>
            <p className="text-sm text-slate-500 mb-8">Startet kl. {formatTid(aktivPause.start)}</p>
            <button
              onClick={slutPause}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-10 rounded-xl text-lg transition-colors shadow-sm w-full"
            >
              Slut pause
            </button>
          </>
        ) : (
          <>
            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium mb-1">Ingen aktiv pause</p>
            <p className="text-slate-400 text-sm mb-8">Tryk for at starte din pause</p>
            <button
              onClick={startPause}
              className="btn-primary py-4 px-10 text-lg w-full"
            >
              Start pause
            </button>
          </>
        )}
      </div>

      {/* Today's total */}
      <div className="card p-5 flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Samlet pausetid i dag</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{samletMin} min</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* History */}
      {pauser.length > 0 && (
        <div className="card p-5">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Pauser i dag</h2>
          <div className="space-y-3">
            {[...pauser].reverse().map((p, i) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                    {pauser.length - i}
                  </span>
                  <div className="text-sm">
                    <span className="font-medium text-slate-800">{formatTid(p.start)}</span>
                    {p.slut && (
                      <span className="text-slate-400"> → {formatTid(p.slut)}</span>
                    )}
                    {!p.slut && (
                      <span className="text-blue-500 font-medium"> (aktiv)</span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full" suppressHydrationWarning>
                  {varighed(p.start, p.slut)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
