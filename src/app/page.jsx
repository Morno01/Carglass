'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

function toDateStr(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayName(d) {
  return d.toLocaleDateString('da-DK', { weekday: 'long' });
}

function shortDate(d) {
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
}

function formatMinutes(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}t ${m}m` : `${h} time${h > 1 ? 'r' : ''}`;
}

function StatCard({ label, value, color }) {
  const colors = {
    slate: 'bg-white border-slate-200 text-slate-900',
    blue:  'bg-blue-50 border-blue-200 text-blue-700',
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
  const router = useRouter();
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

  // Stats: only today's tasks in dagsvisning
  const statsOpgaver = view === 'dag' ? opgaver.filter((o) => o.dato === today) : opgaver;
  const total = statsOpgaver.length;
  const iGangCount = statsOpgaver.filter((o) => o.status === 'I gang').length;
  const afsluttetCount = statsOpgaver.filter((o) => o.status === 'Afsluttet').length;

  const visibleReps = selectedRep ? reparatører.filter((r) => r.id === selectedRep) : reparatører;

  function taskCountForRep(repId) {
    return opgaver.filter((o) => o.reparatørId === repId).length;
  }

  // Returns ALL tasks for a repairman on a given date, sorted by time
  function getTasksForCell(repId, dateStr) {
    return opgaver
      .filter((o) => o.reparatørId === repId && o.dato === dateStr)
      .sort((a, b) => a.starttid.localeCompare(b.starttid));
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

        {/* Stats row + nav buttons */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex flex-wrap gap-3">
            <StatCard label="Total opgaver" value={total} color="slate" />
            <StatCard label="I gang" value={iGangCount} color="green" />
            <StatCard label="Afsluttet" value={afsluttetCount} color="blue" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/kalender')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-500">
                <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
              </svg>
              Kalender
            </button>
            <button
              onClick={() => router.push('/pause')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-500">
                <path fillRule="evenodd" d="M2.5 3A1.5 1.5 0 001 4.5v4A1.5 1.5 0 002.5 10h.75a.75.75 0 010 1.5H2.5A3 3 0 01-.5 8.5v-4A3 3 0 012.5 1.5h15A3 3 0 0120.5 4.5v4A3 3 0 0117.5 11.5h-.75a.75.75 0 010-1.5h.75A1.5 1.5 0 0019 8.5v-4A1.5 1.5 0 0017.5 3h-15z" clipRule="evenodd" />
                <path d="M3 13.5a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 13.5zM3 16.5a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 16.5z" />
              </svg>
              Pause
            </button>
          </div>
        </div>

        {/* View toggle */}
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

        {/* Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: `${180 + visibleDates.length * 220}px` }}>
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3 w-44 border-r border-slate-200 bg-slate-50">
                  Medarbejdere
                </th>
                {visibleDates.map((d, i) => (
                  <th
                    key={i}
                    className={`text-left text-xs font-bold uppercase tracking-wider px-4 py-3 border-r border-slate-200 last:border-r-0 capitalize ${
                      isToday(d) ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span>{getDayName(d)}</span>
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
                  {/* Repairman cell */}
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

                  {/* Task cells — shows ALL tasks for this rep on this day */}
                  {visibleDates.map((d, i) => {
                    const tasks = getTasksForCell(rep.id, toDateStr(d));
                    return (
                      <td
                        key={i}
                        className={`border-r border-slate-100 last:border-r-0 px-2 py-2 align-top ${isToday(d) ? 'bg-blue-50/20' : ''}`}
                      >
                        {tasks.length === 0 ? (
                          <div className="min-h-[48px] flex items-center justify-center">
                            <span className="text-xs text-slate-300">–</span>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {tasks.map((task) => (
                              <button
                                key={task.id}
                                onClick={() => setSelectedOpgave(task)}
                                className="w-full text-left bg-white border border-slate-200 hover:border-navy-400 hover:shadow-sm rounded-lg p-2.5 transition-all group"
                              >
                                <div className="flex items-start justify-between gap-1 mb-1">
                                  <span className="text-[11px] font-mono text-slate-400">{task.starttid}</span>
                                  <StatusBadge status={task.status} size="sm" />
                                </div>
                                <p className="text-xs font-semibold text-slate-900 leading-snug group-hover:text-navy-800 line-clamp-2">
                                  {task.opgavetype}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {task.bil.mærke} {task.bil.model}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-2.5 h-2.5">
                                      <path fillRule="evenodd" d="M1 8a7 7 0 1114 0A7 7 0 011 8zm7.75-4.25a.75.75 0 00-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 000-1.5h-2.5v-3.5z" clipRule="evenodd" />
                                    </svg>
                                    {formatMinutes(task.tidsestimat)}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">{task.ordrenummer}</span>
                                </div>
                              </button>
                            ))}
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
