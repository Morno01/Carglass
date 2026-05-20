'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOpgaver, getReparatører } from '@/lib/storage';
import TopNav from '@/components/TopNav';
import SearchOverlay from '@/components/SearchOverlay';
import TaskModal from '@/components/TaskModal';
import StatusBadge from '@/components/StatusBadge';

function toDateStr(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const startOffset = startDow === 0 ? 6 : startDow - 1;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startOffset);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  // Trim to minimum rows needed (stop when last row is fully outside the month)
  while (days.length > 35) {
    const lastRow = days.slice(-7);
    if (lastRow.every((d) => d.getMonth() !== month)) {
      days.splice(-7);
    } else {
      break;
    }
  }
  return days;
}

const DAY_NAMES = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

const STATUS_DOT = {
  'Afsluttet': 'bg-blue-400',
  'I gang': 'bg-green-500',
  'Afventer': 'bg-slate-400',
};

export default function KalenderPage() {
  const [opgaver, setOpgaver] = useState([]);
  const [reparatører, setReparatører] = useState([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
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

  const now = new Date();
  const today = toDateStr(now);
  const viewYear = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1).getFullYear();
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1).getMonth();

  const days = getMonthGrid(viewYear, viewMonth);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('da-DK', {
    month: 'long', year: 'numeric',
  });

  function tasksForDate(ds) {
    return opgaver
      .filter((o) => o.dato === ds)
      .sort((a, b) => a.starttid.localeCompare(b.starttid));
  }

  function handleTaskUpdated(updated) {
    setOpgaver((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedOpgave(updated);
  }

  const selectedDateTasks = selectedDate ? tasksForDate(selectedDate) : [];
  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopNav onSearchClick={() => setSearchOpen((v) => !v)} searchOpen={searchOpen} />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectOpgave={(o) => { setSelectedOpgave(o); setSearchOpen(false); }}
      />

      <main className="flex-1 px-4 py-5 max-w-5xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-slate-900 capitalize">{monthLabel}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthOffset((v) => v - 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              aria-label="Forrige måned"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
            </button>
            {monthOffset !== 0 && (
              <button
                onClick={() => { setMonthOffset(0); setSelectedDate(null); }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors"
              >
                I dag
              </button>
            )}
            <button
              onClick={() => setMonthOffset((v) => v + 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              aria-label="Næste måned"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-200">
            {DAY_NAMES.map((name) => (
              <div key={name} className="py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                {name}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 divide-x divide-slate-100">
            {days.map((d, i) => {
              const ds = toDateStr(d);
              const inMonth = d.getMonth() === viewMonth;
              const isToday = ds === today;
              const isSelected = ds === selectedDate;
              const tasks = tasksForDate(ds);
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;

              return (
                <button
                  key={ds}
                  onClick={() => setSelectedDate(isSelected ? null : ds)}
                  className={`min-h-[90px] p-2 text-left transition-colors border-b border-slate-100 relative
                    ${isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-400' : 'hover:bg-slate-50'}
                    ${!inMonth ? 'bg-slate-50/60' : ''}
                    ${isWeekend && inMonth && !isSelected ? 'bg-slate-50/40' : ''}
                  `}
                >
                  {/* Date number */}
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1
                    ${isToday ? 'bg-blue-600 text-white' : inMonth ? 'text-slate-700' : 'text-slate-300'}
                  `}>
                    {d.getDate()}
                  </div>

                  {/* Task dots / previews */}
                  {tasks.length > 0 && inMonth && (
                    <div className="space-y-0.5">
                      {tasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-1 truncate"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[task.status] ?? 'bg-slate-400'}`} />
                          <span className="text-[10px] text-slate-600 truncate leading-tight">{task.starttid} {task.opgavetype}</span>
                        </div>
                      ))}
                      {tasks.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{tasks.length - 3} mere</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day task list */}
        {selectedDate && (
          <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className={`px-4 py-3 border-b border-slate-100 flex items-center gap-2 ${selectedDate === today ? 'bg-blue-50' : 'bg-slate-50'}`}>
              <h2 className={`text-sm font-bold capitalize ${selectedDate === today ? 'text-blue-700' : 'text-slate-700'}`}>
                {selectedDateObj?.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              {selectedDate === today && (
                <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  I dag
                </span>
              )}
              <span className="ml-auto text-xs text-slate-400">
                {selectedDateTasks.length} opgave{selectedDateTasks.length !== 1 ? 'r' : ''}
              </span>
              <button
                onClick={() => setSelectedDate(null)}
                className="ml-2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Luk"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400">
                Ingen opgaver denne dag
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {selectedDateTasks.map((task) => {
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
