'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOpgaver, saveOpgaver, getReparatører, getCurrentReparatør } from '@/lib/storage';
import { Opgave, Reparatør } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

const HOURS = Array.from({ length: 9 }, (_, i) => i + 8); // 08–16
const DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag'];

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function formatDayLabel(dato: string, idx: number): string {
  const d = new Date(dato + 'T00:00:00');
  return `${DAYS[idx]} ${d.getDate()}/${d.getMonth() + 1}`;
}

const REP_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'rep-1': { bg: 'bg-blue-100',   border: 'border-blue-400',   text: 'text-blue-800' },
  'rep-2': { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-800' },
  'rep-3': { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-800' },
};
const DEFAULT_COLOR = { bg: 'bg-slate-100', border: 'border-slate-400', text: 'text-slate-800' };

interface NyOpgaveState {
  dato: string;
  starttid: string;
}

export default function KalenderPage() {
  const router = useRouter();
  const [opgaver, setOpgaver] = useState<Opgave[]>([]);
  const [reparatører, setReparatører] = useState<Reparatør[]>([]);
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [modal, setModal] = useState<NyOpgaveState | null>(null);
  const [mounted, setMounted] = useState(false);

  const load = useCallback(() => {
    const rep = getCurrentReparatør();
    if (!rep) { router.push('/'); return; }
    setOpgaver(getOpgaver());
    setReparatører(getReparatører());
    setWeekDates(getWeekDates());
    setMounted(true);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  function getOpgaverForSlot(dato: string, hour: number): Opgave[] {
    const tidStr = `${String(hour).padStart(2, '0')}:00`;
    return opgaver.filter((o) => o.dato === dato && o.starttid === tidStr);
  }

  function openModal(dato: string, hour: number) {
    setModal({ dato, starttid: `${String(hour).padStart(2, '0')}:00` });
  }

  if (!mounted) return null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kalender</h1>
          <p className="text-slate-500 mt-1">Ugeoversigt — klik på et tidslot for at booke</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3">
          {reparatører.map((r) => {
            const c = REP_COLORS[r.id] ?? DEFAULT_COLOR;
            return (
              <div key={r.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${c.bg} ${c.border} ${c.text}`}>
                <span className={`h-2 w-2 rounded-full ${c.border.replace('border-', 'bg-')}`} />
                {r.navn.split(' ')[0]}
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="w-16 py-3 px-3 text-slate-400 font-medium text-right border-r border-slate-200">Tid</th>
              {weekDates.map((dato, idx) => {
                const isToday = dato === new Date().toISOString().split('T')[0];
                return (
                  <th key={dato} className={`py-3 px-2 font-semibold text-center border-r border-slate-200 last:border-r-0 ${isToday ? 'text-blue-700 bg-blue-50' : 'text-slate-600'}`}>
                    {formatDayLabel(dato, idx)}
                    {isToday && <span className="block text-xs font-normal text-blue-500">I dag</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-2 px-3 text-slate-400 text-xs font-medium text-right border-r border-slate-200 align-top pt-3 w-16">
                  {String(hour).padStart(2, '0')}:00
                </td>
                {weekDates.map((dato) => {
                  const slots = getOpgaverForSlot(dato, hour);
                  return (
                    <td
                      key={dato}
                      className="p-1 border-r border-slate-100 last:border-r-0 align-top min-w-[140px] cursor-pointer group"
                      onClick={() => { if (slots.length === 0) openModal(dato, hour); }}
                    >
                      {slots.length === 0 ? (
                        <div className="h-12 rounded-lg border border-dashed border-transparent group-hover:border-blue-300 group-hover:bg-blue-50 transition-all flex items-center justify-center">
                          <span className="text-blue-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">+ Book</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {slots.map((o) => {
                            const c = REP_COLORS[o.reparatørId] ?? DEFAULT_COLOR;
                            return (
                              <Link
                                key={o.id}
                                href={`/opgave/${o.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className={`block rounded-lg border px-2 py-1.5 ${c.bg} ${c.border} ${c.text} hover:opacity-80 transition-opacity`}
                              >
                                <p className="font-semibold text-xs truncate">{o.kundenavn}</p>
                                <p className="text-xs opacity-75 truncate">{o.opgavetype}</p>
                                <p className="text-xs opacity-60">{o.tidsestimat} min</p>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <NyOpgaveModal
          dato={modal.dato}
          starttid={modal.starttid}
          reparatører={reparatører}
          opgaver={opgaver}
          onGem={(ny) => {
            const opdateret = [...opgaver, ny];
            saveOpgaver(opdateret);
            setOpgaver(opdateret);
            setModal(null);
          }}
          onLuk={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ─── Inline modal ────────────────────────────────────────────────────────────

interface ModalProps {
  dato: string;
  starttid: string;
  reparatører: Reparatør[];
  opgaver: Opgave[];
  onGem: (o: Opgave) => void;
  onLuk: () => void;
}

function NyOpgaveModal({ dato, starttid, reparatører, opgaver, onGem, onLuk }: ModalProps) {
  const [form, setForm] = useState({
    kundenavn: '',
    kundeKontakt: '',
    bilMærke: '',
    bilModel: '',
    nummerplade: '',
    opgavetype: 'Forrude udskiftning',
    beskrivelse: '',
    tidsestimat: 60,
    reparatørId: reparatører[0]?.id ?? '',
    starttid,
  });
  const [fejl, setFejl] = useState('');

  function set(k: string, v: string | number) {
    setForm((f) => ({ ...f, [k]: v }));
    setFejl('');
  }

  function gem() {
    if (!form.kundenavn || !form.kundeKontakt || !form.bilMærke || !form.bilModel || !form.nummerplade) {
      setFejl('Udfyld venligst alle obligatoriske felter.');
      return;
    }
    // Dobbeltbooking check
    const konflikt = opgaver.find(
      (o) => o.dato === dato && o.starttid === form.starttid && o.reparatørId === form.reparatørId
    );
    if (konflikt) {
      setFejl(`${reparatører.find(r => r.id === form.reparatørId)?.navn} er allerede booket kl. ${form.starttid} denne dag.`);
      return;
    }
    const ny: Opgave = {
      id: `opgave-${Date.now()}`,
      kundenavn: form.kundenavn,
      kundeKontakt: form.kundeKontakt,
      bil: { mærke: form.bilMærke, model: form.bilModel, nummerplade: form.nummerplade },
      opgavetype: form.opgavetype,
      beskrivelse: form.beskrivelse,
      tidsestimat: Number(form.tidsestimat),
      status: 'Afventer',
      reparatørId: form.reparatørId,
      dato,
      starttid: form.starttid,
    };
    onGem(ny);
  }

  const field = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onLuk}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Ny booking</h2>
            <p className="text-sm text-slate-500">{dato} kl. {starttid}</p>
          </div>
          <button onClick={onLuk} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {fejl && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3 font-medium">
              {fejl}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Reparatør *</label>
              <select className={field} value={form.reparatørId} onChange={(e) => set('reparatørId', e.target.value)}>
                {reparatører.map((r) => <option key={r.id} value={r.id}>{r.navn}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tidspunkt *</label>
              <select className={field} value={form.starttid} onChange={(e) => set('starttid', e.target.value)}>
                {HOURS.map((h) => {
                  const t = `${String(h).padStart(2, '0')}:00`;
                  return <option key={t} value={t}>{t}</option>;
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kundenavn *</label>
              <input className={field} value={form.kundenavn} onChange={(e) => set('kundenavn', e.target.value)} placeholder="Fulde navn" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Telefon *</label>
              <input className={field} value={form.kundeKontakt} onChange={(e) => set('kundeKontakt', e.target.value)} placeholder="12345678" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Bilmærke *</label>
              <input className={field} value={form.bilMærke} onChange={(e) => set('bilMærke', e.target.value)} placeholder="Toyota" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Model *</label>
              <input className={field} value={form.bilModel} onChange={(e) => set('bilModel', e.target.value)} placeholder="Corolla" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nummerplade *</label>
              <input className={field} value={form.nummerplade} onChange={(e) => set('nummerplade', e.target.value.toUpperCase())} placeholder="AB 12 345" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Opgavetype</label>
              <select className={field} value={form.opgavetype} onChange={(e) => set('opgavetype', e.target.value)}>
                <option>Forrude udskiftning</option>
                <option>Stenskade reparation</option>
                <option>Siderude udskiftning</option>
                <option>Bagrude udskiftning</option>
                <option>Andet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tidsestimat (min)</label>
              <input type="number" className={field} min={15} max={480} step={15} value={form.tidsestimat} onChange={(e) => set('tidsestimat', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Beskrivelse</label>
            <textarea className={`${field} resize-none h-20`} value={form.beskrivelse} onChange={(e) => set('beskrivelse', e.target.value)} placeholder="Yderligere noter om opgaven..." />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onLuk} className="btn-secondary">Annuller</button>
          <button onClick={gem} className="btn-primary">Gem booking</button>
        </div>
      </div>
    </div>
  );
}
