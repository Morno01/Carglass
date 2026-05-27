'use client';

import { useState, useEffect, useRef } from 'react';
import { getOpgaver, getReparatører } from '@/lib/storage';
import StatusBadge from './StatusBadge';

const FILTERS = [
  { id: 'alle',       label: 'Alle' },
  { id: 'ordrenummer', label: 'Ordrenummer' },
  { id: 'kundenavn',  label: 'Kundenavn' },
  { id: 'adresse',    label: 'Adresse' },
  { id: 'telefon',    label: 'Telefon' },
  { id: 'bil',        label: 'Bilmærke/model' },
  { id: 'reparatør',  label: 'Reparatør' },
  { id: 'opgavetype', label: 'Opgavetype' },
];

function matchesFilter(o, q, filterId, repNavn) {
  switch (filterId) {
    case 'ordrenummer': return o.ordrenummer.toLowerCase().includes(q);
    case 'kundenavn':   return o.kundenavn.toLowerCase().includes(q);
    case 'adresse':     return o.kundeAdresse.toLowerCase().includes(q);
    case 'telefon':     return o.kundeKontakt.replace(/\s/g, '').includes(q.replace(/\s/g, ''));
    case 'bil':         return (o.bil.mærke + ' ' + o.bil.model).toLowerCase().includes(q) || o.bil.nummerplade.toLowerCase().includes(q);
    case 'reparatør':   return repNavn?.toLowerCase().includes(q) ?? false;
    case 'opgavetype':  return o.opgavetype.toLowerCase().includes(q);
    default:
      return (
        o.kundenavn.toLowerCase().includes(q) ||
        o.kundeAdresse.toLowerCase().includes(q) ||
        o.bil.mærke.toLowerCase().includes(q) ||
        o.bil.model.toLowerCase().includes(q) ||
        o.bil.nummerplade.toLowerCase().includes(q) ||
        o.ordrenummer.toLowerCase().includes(q) ||
        o.opgavetype.toLowerCase().includes(q) ||
        o.kundeKontakt.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
        (repNavn?.toLowerCase().includes(q) ?? false)
      );
  }
}

function getMatchField(o, q, repNavn) {
  if (o.ordrenummer.toLowerCase().includes(q)) return 'Ordrenummer';
  if (o.kundenavn.toLowerCase().includes(q)) return 'Kundenavn';
  if (o.kundeAdresse.toLowerCase().includes(q)) return 'Adresse';
  if (o.kundeKontakt.replace(/\s/g, '').includes(q.replace(/\s/g, ''))) return 'Telefon';
  if ((o.bil.mærke + ' ' + o.bil.model).toLowerCase().includes(q) || o.bil.nummerplade.toLowerCase().includes(q)) return 'Bil';
  if (repNavn?.toLowerCase().includes(q)) return 'Reparatør';
  if (o.opgavetype.toLowerCase().includes(q)) return 'Opgavetype';
  return null;
}

function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-slate-900 rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchOverlay({ open, onClose, onSelectOpgave }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('alle');
  const [results, setResults] = useState([]);
  const [alle, setAlle] = useState([]);
  const inputRef = useRef(null);
  const reparatører = getReparatører();

  useEffect(() => {
    if (open) {
      setAlle(getOpgaver());
      setQuery('');
      setResults([]);
      setActiveFilter('alle');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults([]); return; }
    const found = alle.filter((o) => {
      const rep = reparatører.find((r) => r.id === o.reparatørId);
      return matchesFilter(o, q, activeFilter, rep?.navn);
    });
    setResults(found);
  }, [query, alle, activeFilter]);

  if (!open) return null;

  const borderColor = (status) =>
    status === 'Afsluttet' ? 'border-l-blue-500' :
    status === 'I gang'    ? 'border-l-green-500' :
                             'border-l-slate-300';

  const q = query.trim().toLowerCase();

  return (
    <div className="relative z-30">
      <div className="bg-white border-b border-slate-200 px-4 pt-3 pb-2 shadow-md">
        <div className="max-w-2xl mx-auto">
          {/* Search input */}
          <div className="flex items-center gap-3 mb-2">
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

          {/* Filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activeFilter === f.id
                    ? 'bg-navy-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {query.trim() && (
        <div className="bg-white border-b border-slate-200 shadow-lg max-h-96 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {results.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Ingen resultater for &ldquo;{query}&rdquo;</p>
            ) : (
              <>
                <p className="text-xs text-slate-400 px-4 pt-2 pb-1">{results.length} resultat{results.length !== 1 ? 'er' : ''}</p>
                <ul className="divide-y divide-slate-100">
                  {results.map((o) => {
                    const rep = reparatører.find((r) => r.id === o.reparatørId);
                    const matchField = activeFilter === 'alle' ? getMatchField(o, q, rep?.navn) : null;
                    return (
                      <li key={o.id}>
                        <button
                          onClick={() => { onSelectOpgave(o); onClose(); }}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 border-l-4 ${borderColor(o.status)}`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                <Highlight text={o.opgavetype} query={activeFilter === 'alle' || activeFilter === 'opgavetype' ? query.trim() : ''} />
                                {' – '}
                                <Highlight text={`${o.bil.mærke} ${o.bil.model}`} query={activeFilter === 'alle' || activeFilter === 'bil' ? query.trim() : ''} />
                              </p>
                              {matchField && (
                                <span className="inline-flex items-center rounded-full bg-yellow-100 border border-yellow-300 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800 shrink-0">
                                  {matchField}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                              <span>
                                <Highlight text={o.kundenavn} query={activeFilter === 'alle' || activeFilter === 'kundenavn' ? query.trim() : ''} />
                              </span>
                              <span>
                                <Highlight text={o.bil.nummerplade} query={activeFilter === 'alle' || activeFilter === 'bil' ? query.trim() : ''} />
                              </span>
                              <span>
                                <Highlight text={o.ordrenummer} query={activeFilter === 'alle' || activeFilter === 'ordrenummer' ? query.trim() : ''} />
                              </span>
                              {rep && (
                                <span className="text-slate-400">
                                  – <Highlight text={rep.navn} query={activeFilter === 'alle' || activeFilter === 'reparatør' ? query.trim() : ''} />
                                </span>
                              )}
                            </p>
                          </div>
                          <StatusBadge status={o.status} small />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
