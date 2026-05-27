'use client';

import { useState } from 'react';
import { getOpgaver, saveOpgaver, getReparatører } from '@/lib/storage';
import StatusBadge from './StatusBadge';

function formatMinutes(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} t ${m} min` : `${h} time${h > 1 ? 'r' : ''}`;
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <span className="text-sm text-slate-900 text-right">{value}</span>
    </div>
  );
}

export default function TaskModal({ opgave, onClose, onUpdated }) {
  const [conflict, setConflict] = useState(false);
  const [doneNotif, setDoneNotif] = useState(false);
  const reparatører = getReparatører();
  const rep = reparatører.find((r) => r.id === opgave.reparatørId);

  function handleStart() {
    const alle = getOpgaver();
    const iGang = alle.find((o) => o.status === 'I gang' && o.id !== opgave.id && o.reparatørId === opgave.reparatørId);
    if (iGang) { setConflict(true); return; }
    const updated = alle.map((o) => o.id === opgave.id ? { ...o, status: 'I gang' } : o);
    saveOpgaver(updated);
    onUpdated({ ...opgave, status: 'I gang' });
  }

  function handleAfslut() {
    const alle = getOpgaver();
    const updated = alle.map((o) => o.id === opgave.id ? { ...o, status: 'Afsluttet' } : o);
    saveOpgaver(updated);
    onUpdated({ ...opgave, status: 'Afsluttet' });
    setDoneNotif(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-navy-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold">Opgave Detaljer</h2>
            <p className="text-navy-200 text-xs mt-0.5">{opgave.ordrenummer}</p>
          </div>
          <button onClick={onClose} className="text-navy-200 hover:text-white transition-colors p-1 rounded" aria-label="Luk">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
          <section className="px-5 py-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Opgave Information</h3>
            <div className="space-y-2">
              <Row label="Type" value={opgave.opgavetype} />
              <Row label="Beskrivelse" value={opgave.beskrivelse} />
              <Row label="Lokation" value={opgave.lokation} />
              <Row label="Tidspunkt" value={`${opgave.dato} – ${opgave.starttid}`} />
              <Row label="Estimeret tid" value={formatMinutes(opgave.tidsestimat)} />
              {opgave.dele && <Row label="Dele" value={opgave.dele} />}
              {opgave.noter && <Row label="Noter" value={opgave.noter} />}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <StatusBadge status={opgave.status} />
              </div>
              <Row label="Ordrenummer" value={opgave.ordrenummer} />
              {rep && <Row label="Reparatør" value={rep.navn} />}
            </div>
          </section>

          <section className="px-5 py-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Kunde Information</h3>
            <div className="space-y-2">
              <Row label="Navn" value={opgave.kundenavn} />
              <Row label="Adresse" value={opgave.kundeAdresse} />

              {/* Contact buttons */}
              <div className="pt-2 flex gap-2">
                <a
                  href={`tel:${opgave.kundeKontakt.replace(/\s/g, '')}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
                  </svg>
                  Ring op – {opgave.kundeKontakt}
                </a>
                <a
                  href={`mailto:${opgave.kundeEmail}`}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors"
                  title={`Send email til ${opgave.kundeEmail}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                  </svg>
                  Email
                </a>
              </div>
            </div>
          </section>

          <section className="px-5 py-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Bil Information</h3>
            <div className="space-y-2">
              <Row label="Mærke/Model" value={`${opgave.bil.mærke} ${opgave.bil.model}`} />
              <Row label="Årgang" value={String(opgave.bil.årstal)} />
              <Row label="Reg. nr." value={opgave.bil.nummerplade} />
              <Row label="Stelnummer" value={opgave.bil.stelnummer} />
            </div>
          </section>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 shrink-0">
          {opgave.status === 'Afventer' && (
            <button onClick={handleStart} className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" />
              </svg>
              Start opgave
            </button>
          )}
          {opgave.status === 'I gang' && (
            <button onClick={handleAfslut} className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              Afslut opgave
            </button>
          )}
          {opgave.status === 'Afsluttet' && (
            <button disabled className="w-full bg-slate-100 text-slate-400 font-semibold py-3 rounded-lg cursor-not-allowed">
              Opgave afsluttet
            </button>
          )}
        </div>
      </div>

      {/* Conflict popup */}
      {conflict && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-600">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Opgave allerede i gang</h4>
                <p className="text-sm text-slate-600">En opgave er allerede i gang. Afslut den nuværende opgave først.</p>
              </div>
            </div>
            <button onClick={() => setConflict(false)} className="w-full bg-navy-800 hover:bg-navy-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
              OK
            </button>
          </div>
        </div>
      )}

      {/* Completion notification popup */}
      {doneNotif && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-600">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Opgave afsluttet</h4>
                <p className="text-sm text-slate-600">
                  {opgave.kundenavn} er blevet underrettet om at opgaven er afsluttet.
                </p>
              </div>
            </div>
            <button
              onClick={() => { setDoneNotif(false); onClose(); }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
