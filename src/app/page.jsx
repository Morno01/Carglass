'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOpgaver, getReparatører } from '@/lib/storage';
import TopNav from '@/components/TopNav';
import SearchOverlay from '@/components/SearchOverlay';
import TaskModal from '@/components/TaskModal';
import StatusBadge from '@/components/StatusBadge';

function getMonday() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

const WEEKDAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag'];

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

function formatMinutes(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}t ${m}m` : `${h} time${h > 1 ? 'r' : ''}`;
}

function shortDate(d) {
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
}

function StatCard({ label, value, color }) {
  const colors = {
    slate: 'bg-white border-slate-200 text-slate-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  };
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${colors[color]}`}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-sm font-medium opacity-80">{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [opgaver, setOpgaver] = useState([]);
  const [reparatører, setReparatører] = useState([]);
  const [view, setView] = useState('uge');
  const [selectedRep, setSelectedRep] = useState(null);
  const [selectedOpgave, setSelectedOpgave] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const load = useCallback(() => {
    setOpgaver(getOpgaver());
    setReparatører(getReparatører());
  }, []);

  useEffect(() => {
    setMounted(true);
    load();
  }, [load]);

  if (!mounted) return null;

  const monday = getMonday();
  const today = toDateStr(new Date());

  const weekDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const visibleDates = view === 'uge' ? weekDates : weekDates.filter((d) => toDateStr(d) === today);

  const total = opgaver.length;
  const iGangCount = opgaver.filter((o) => o.status === 'I gang').length;
  const afsluttetCount = opgaver.filter((o) => o.status === 'Afsluttet').length;

  const visibleReps = selectedRep ? reparatører.filter((r) => r.id === selectedRep) : reparatører;

  function taskCountForRep(repId) {
    return opgaver.filter((o) => o.reparatørId === repId).length;
  }

  function getTask(repId, dateStr) {
    return opgaver.find((o) => o.reparatørId === repId && o.dato === dateStr);
  }

  function handleTaskUpdated(updated) {
    setOpgaver((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedOpgave(updated);
  }

  const isToday = (d) => toDateStr(d) === today;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopNav onSearchClick={() => setSearchOpen((v) => !v)} searchOpen={searchOpen} />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectOpgave={(o) => { setSelectedOpgave(o); setSearchOpen(false); }}
      />

      <main className="flex-1 px-4 py-5 max-w-7xl mx-auto w-full">
        <div className="flex flex-wrap gap-3 mb-5">
          <StatCard label="Total opgaver" value={total} color="slate" />
          <StatCard label="I gang" value={iGangCount} color="blue" />
          <StatCard label="Afsluttet" value={afsluttetCount} color="green" />
        </div>

        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setView('uge')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'uge' ? 'bg-navy-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Ugevisning
          </button>
          <button
            onClick={() => setView('dag')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'dag' ? 'bg-navy-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Dagsvisning
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: `${180 + visibleDates.length * 200}px` }}>
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3 w-44 border-r border-slate-200 bg-slate-50">
                  Medarbejdere
                </th>
                {visibleDates.map((d, i) => (
                  <th
                    key={i}
                    className={`text-left text-xs font-bold uppercase tracking-wider px-4 py-3 border-r border-slate-200 last:border-r-0 ${
                      isToday(d) ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span>{WEEKDAYS[i]}</span>
                    <span className={`ml-1.5 font-normal normal-case ${isToday(d) ? 'text-blue-500' : 'text-slate-400'}`}>
                      {shortDate(d)}
                    </span>
                    {isToday(d) && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white normal-case tracking-normal">
                        I dag
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleReps.map((rep) => (
                <tr key={rep.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="border-r border-slate-200 px-4 py-3 align-top bg-slate-50/50">
                    <button
                      onClick={() => setSelectedRep(selectedRep === rep.id ? null : rep.id)}
                      className={`w-full text-left rounded-lg p-2 transition-colors ${
                        selectedRep === rep.id ? 'bg-navy-100 ring-2 ring-navy-400' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {rep.navn.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 leading-tight">{rep.navn}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{taskCountForRep(rep.id)} opgaver</p>
                        </div>
                      </div>
                    </button>
                  </td>

                  {visibleDates.map((d, i) => {
                    const task = getTask(rep.id, toDateStr(d));
                    return (
                      <td
                        key={i}
                        className={`border-r border-slate-100 last:border-r-0 px-3 py-3 align-top ${isToday(d) ? 'bg-blue-50/30' : ''}`}
                      >
                        {task ? (
                          <button
                            onClick={() => setSelectedOpgave(task)}
                            className="w-full text-left bg-white border border-slate-200 hover:border-navy-400 hover:shadow-md rounded-lg p-3 transition-all group"
                          >
                            <p className="text-xs font-semibold text-slate-900 leading-snug group-hover:text-navy-800">
                              {task.opgavetype} – {task.bil.mærke} {task.bil.model}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{task.lokation}</p>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                                <path fillRule="evenodd" d="M1 8a7 7 0 1114 0A7 7 0 011 8zm7.75-4.25a.75.75 0 00-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 000-1.5h-2.5v-3.5z" clipRule="evenodd" />
                              </svg>
                              {formatMinutes(task.tidsestimat)}
                            </p>
                            <div className="flex items-center justify-between mt-2 gap-1">
                              <StatusBadge status={task.status} small />
                              <span className="text-[10px] text-slate-400 font-mono">{task.ordrenummer}</span>
                            </div>
                          </button>
                        ) : (
                          <div className="h-full min-h-[60px] flex items-center justify-center">
                            <span className="text-xs text-slate-300">–</span>
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

        {selectedRep && (
          <p className="mt-3 text-sm text-slate-500 text-center">
            Viser kun{' '}
            <span className="font-semibold text-slate-700">
              {reparatører.find((r) => r.id === selectedRep)?.navn}
            </span>
            {' – '}
            <button onClick={() => setSelectedRep(null)} className="text-blue-600 hover:underline">
              Vis alle
            </button>
          </p>
        )}
      </main>

      {selectedOpgave && (
        <TaskModal
          opgave={selectedOpgave}
          onClose={() => setSelectedOpgave(null)}
          onUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}
