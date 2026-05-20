'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOpgaver, getReparatører } from '@/lib/storage';
import TopNav from '@/components/TopNav';
import SearchOverlay from '@/components/SearchOverlay';
import TaskModal from '@/components/TaskModal';
import StatusBadge from '@/components/StatusBadge';

function getMonday(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

function formatDate(d) {
  return d.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function KalenderPage() {
  const [opgaver, setOpgaver] = useState([]);
  const [reparatører, setReparatører] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
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

  const monday = getMonday(weekOffset);
  const today = toDateStr(new Date());

  const weekDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const tasksByDate = {};
  for (const d of weekDates) {
    const ds = toDateStr(d);
    tasksByDate[ds] = opgaver
      .filter((o) => o.dato === ds)
      .sort((a, b) => a.starttid.localeCompare(b.starttid));
  }

  function handleTaskUpdated(updated) {
    setOpgaver((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedOpgave(updated);
  }

  const weekStart = weekDates[0];
  const weekEnd = weekDates[4];
  const weekLabel = `${weekStart.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })} – ${weekEnd.toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopNav onSearchClick={() => setSearchOpen((v) => !v)} searchOpen={searchOpen} />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectOpgave={(o) => { setSelectedOpgave(o); setSearchOpen(false); }}
      />

      <main className="flex-1 px-4 py-5 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Kalender</h1>
            <p className="text-sm text-slate-500 mt-0.5">{weekLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((v) => v - 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              aria-label="Forrige uge"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors"
              >
                I dag
              </button>
            )}
            <button
              onClick={() => setWeekOffset((v) => v + 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              aria-label="Næste uge"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {weekDates.map((d) => {
            const ds = toDateStr(d);
            const tasks = tasksByDate[ds] ?? [];
            const isToday = ds === today;

            return (
              <div key={ds} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className={`px-4 py-3 border-b border-slate-100 flex items-center gap-2 ${isToday ? 'bg-blue-50' : 'bg-slate-50'}`}>
                  <h2 className={`text-sm font-bold capitalize ${isToday ? 'text-blue-700' : 'text-slate-700'}`}>
                    {formatDate(d)}
                  </h2>
                  {isToday && (
                    <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      I dag
                    </span>
                  )}
                  <span className="ml-auto text-xs text-slate-400">{tasks.length} opgave{tasks.length !== 1 ? 'r' : ''}</span>
                </div>

                {tasks.length === 0 ? (
                  <div className="px-4 py-5 text-center text-sm text-slate-400">
                    Ingen opgaver denne dag
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {tasks.map((task) => {
                      const rep = reparatører.find((r) => r.id === task.reparatørId);
                      return (
                        <li key={task.id}>
                          <button
                            onClick={() => setSelectedOpgave(task)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3"
                          >
                            <span className="text-sm font-mono text-slate-500 w-12 shrink-0 pt-0.5">{task.starttid}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {task.opgavetype} – {task.bil.mærke} {task.bil.model}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 flex items-center flex-wrap gap-x-3 gap-y-0.5">
                                <span>{task.lokation}</span>
                                <span>{task.kundenavn}</span>
                                <span>{task.bil.nummerplade}</span>
                                {rep && <span className="text-slate-400">– {rep.navn}</span>}
                              </p>
                            </div>
                            <StatusBadge status={task.status} small />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
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
