'use client';

import { useState, useEffect, useRef } from 'react';
import { getOpgaver, getReparatører } from '@/lib/storage';
import StatusBadge from './StatusBadge';

export default function SearchOverlay({ open, onClose, onSelectOpgave }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [alle, setAlle] = useState([]);
  const inputRef = useRef(null);
  const reparatører = getReparatører();

  useEffect(() => {
    if (open) {
      setAlle(getOpgaver());
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults([]); return; }
    const found = alle.filter((o) =>
      o.kundenavn.toLowerCase().includes(q) ||
      o.kundeAdresse.toLowerCase().includes(q) ||
      o.bil.mærke.toLowerCase().includes(q) ||
      o.bil.model.toLowerCase().includes(q) ||
      o.bil.nummerplade.toLowerCase().includes(q) ||
      o.ordrenummer.toLowerCase().includes(q) ||
      o.lokation.toLowerCase().includes(q) ||
      o.opgavetype.toLowerCase().includes(q) ||
      o.dato.includes(q) ||
      o.dato.replace(/-/g, '.').includes(q) ||
      new Date(o.dato + 'T00:00:00').toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase().includes(q)
    );
    setResults(found);
  }, [query, alle]);

  if (!open) return null;

  const borderColor = (status) =>
    status === 'Afsluttet' ? 'border-l-blue-500'  :
    status === 'I gang'    ? 'border-l-green-500' :
                             'border-l-slate-300';

  return (
    <div className="relative z-30">
      <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400 shrink-0">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søg efter kunde, bil, adresse, ordrenummer…"
            className="flex-1 text-sm outline-none placeholder:text-slate-400 text-slate-900"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded" aria-label="Luk søgning">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>

      {query.trim() && (
        <div className="bg-white border-b border-slate-200 shadow-lg max-h-96 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {results.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Ingen resultater for &ldquo;{query}&rdquo;</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {results.map((o) => {
                  const rep = reparatører.find((r) => r.id === o.reparatørId);
                  return (
                    <li key={o.id}>
                      <button
                        onClick={() => { onSelectOpgave(o); onClose(); }}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 border-l-4 ${borderColor(o.status)}`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {o.opgavetype} – {o.bil.mærke} {o.bil.model}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>{o.lokation}</span>
                            <span>{o.kundenavn}</span>
                            <span>{o.bil.nummerplade}</span>
                            {rep && <span>– {rep.navn}</span>}
                          </p>
                        </div>
                        <StatusBadge status={o.status} small />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
