'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOpgaver, getReparatører } from '@/lib/storage';
import TopNav from '@/components/TopNav';
import SearchOverlay from '@/components/SearchOverlay';
import TaskModal from '@/components/TaskModal';
import StatusBadge from '@/components/StatusBadge';

function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function toDateStr(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonday() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
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

// 45 marks: 07:00–18:00 in 15-min steps. 18:00 is a boundary-only end marker.
// Scheduleable: 07:00–17:45 (44 slots). Each slot = 15 min.
const TIME_SLOTS = [];
for (let h = 7; h <= 18; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 18 && m > 0) break;
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

function timeToSlotIndex(time) {
  const [h, m] = time.split(':').map(Number);
  return (h - 7) * 4 + Math.floor(m / 15);
}

const COL_W = 36;   // px per 15-min slot
const NAME_W = 160; // px for repairman name column
const ROW_H = 80;   // px per repairman row
const HEADER_H = 40; // px for time label row

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
  const [view, setView] = useState('dag');
  const [dayOffset, setDayOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
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

  const today = toDateStr(new Date());
  const monday = getMonday();

  // Day view: offset from today
  const currentDay = new Date();
  currentDay.setDate(currentDay.getDate() + dayOffset);
  currentDay.setHours(0, 0, 0, 0);
  const currentDateStr = toDateStr(currentDay);
  const isCurrentDayToday = currentDateStr === today;

  // Week view: offset from current week
  const weekStart = new Date(monday);
  weekStart.setDate(monday.getDate() + weekOffset * 7);
  const weekDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const weekDateStrs = weekDates.map(toDateStr);

  const weekLabel = (() => {
    const start = weekDates[0];
    const end = weekDates[4];
    const sameMonth = start.getMonth() === end.getMonth();
    if (sameMonth) {
      return `${start.getDate()}–${end.getDate()}. ${end.toLocaleDateString('da-DK', { month: 'long', year: 'numeric' })}`;
    }
    return `${start.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  })();

  // Stats: filtered by current view/week and selected rep
  const statsOpgaver = view === 'dag'
    ? opgaver.filter((o) => o.dato === currentDateStr && (!selectedRep || o.reparatørId === selectedRep))
    : opgaver.filter((o) => weekDateStrs.includes(o.dato) && (!selectedRep || o.reparatørId === selectedRep));
  const total = statsOpgaver.length;
  const iGangCount = statsOpgaver.filter((o) => o.status === 'I gang').length;
  const afsluttetCount = statsOpgaver.filter((o) => o.status === 'Afsluttet').length;

  const visibleReps = selectedRep ? reparatører.filter((r) => r.id === selectedRep) : reparatører;

  function taskCountForRep(repId) {
    return opgaver.filter((o) => o.reparatørId === repId).length;
  }

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

  const statusBorder = (status) =>
    status === 'Afsluttet' ? 'border-t-blue-400' :
    status === 'I gang'    ? 'border-t-green-400' :
                             'border-t-slate-300';

  const statusBg = (status) =>
    status === 'Afsluttet' ? 'bg-blue-50' :
    status === 'I gang'    ? 'bg-green-50' :
                             'bg-white';

  const longDate = currentDay.toLocaleDateString('da-DK', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopNav onSearchClick={() => setSearchOpen((v) => !v)} searchOpen={searchOpen} />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectOpgave={(o) => { setSelectedOpgave(o); setSearchOpen(false); }}
      />

      <main className="flex-1 px-4 py-5 max-w-7xl mx-auto w-full">

        {/* Stats row */}
        <div className="flex flex-wrap gap-3 mb-5">
          <StatCard label="Total opgaver" value={total} color="slate" />
          <StatCard label="I gang" value={iGangCount} color="green" />
          <StatCard label="Afsluttet" value={afsluttetCount} color="blue" />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setView('dag')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'dag' ? 'bg-navy-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Dagsvisning
          </button>
          <button
            onClick={() => setView('uge')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'uge' ? 'bg-navy-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Ugevisning
          </button>
        </div>

        {/* ── DAG VIEW ── */}
        {view === 'dag' && (
          <>
            {/* Date header with prev/next */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setDayOffset((v) => v - 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                aria-label="Forrige dag"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <h2 className={`text-base font-bold capitalize ${isCurrentDayToday ? 'text-blue-700' : 'text-slate-800'}`}>
                  {longDate}
                </h2>
                {isCurrentDayToday && (
                  <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    I dag
                  </span>
                )}
              </div>

              {dayOffset !== 0 && (
                <button
                  onClick={() => setDayOffset(0)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors"
                >
                  I dag
                </button>
              )}

              <button
                onClick={() => setDayOffset((v) => v + 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                aria-label="Næste dag"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Rep filter hint */}
            {selectedRep && (
              <p className="mb-3 text-sm text-slate-500">
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

            {/* Timeline — div/absolute layout so all columns are exactly COL_W px */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
              <div style={{ width: NAME_W + TIME_SLOTS.length * COL_W }}>

                {/* Header row */}
                <div className="flex border-b border-slate-200">
                  <div
                    className="shrink-0 flex items-center px-3 bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider"
                    style={{ width: NAME_W, height: HEADER_H }}
                  >
                    Medarbejder
                  </div>
                  <div className="relative" style={{ width: TIME_SLOTS.length * COL_W, height: HEADER_H }}>
                    {/* Vertical grid lines in header */}
                    {TIME_SLOTS.map((slot, si) => {
                      const mins = slot.slice(3);
                      const isHour = mins === '00';
                      const isHalf = mins === '30';
                      return (
                        <div
                          key={slot}
                          className={`absolute top-0 bottom-0 ${isHour ? 'border-l-2 border-slate-300' : isHalf ? 'border-l border-slate-200' : 'border-l border-slate-100'}`}
                          style={{ left: si * COL_W, width: COL_W }}
                        />
                      );
                    })}
                    {/* Time labels — centered on each column boundary */}
                    {TIME_SLOTS.map((slot, si) => {
                      const mins = slot.slice(3);
                      const isHour = mins === '00';
                      const isHalf = mins === '30';
                      return (
                        <span
                          key={`lbl-${slot}`}
                          className={
                            isHour ? 'text-[11px] font-semibold font-mono text-slate-600' :
                            isHalf ? 'text-[10px] font-mono text-slate-400' :
                                     'text-[9px] font-mono text-slate-300'
                          }
                          style={{
                            position: 'absolute',
                            left: si * COL_W,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            userSelect: 'none',
                          }}
                        >
                          {isHour ? slot : `:${mins}`}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Repairman rows */}
                {visibleReps.map((rep) => {
                  const repTasks = getTasksForCell(rep.id, currentDateStr);
                  return (
                    <div key={rep.id} className="flex border-b border-slate-100 last:border-b-0">
                      {/* Name cell */}
                      <div
                        className="shrink-0 flex items-center border-r border-slate-200 bg-slate-50/50 px-2"
                        style={{ width: NAME_W, height: ROW_H }}
                      >
                        <button
                          onClick={() => setSelectedRep(selectedRep === rep.id ? null : rep.id)}
                          className={`w-full text-left rounded-lg px-2 py-1.5 transition-colors ${
                            selectedRep === rep.id ? 'bg-navy-100 ring-2 ring-navy-400' : 'hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-navy-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {rep.navn.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">{rep.navn}</span>
                          </div>
                        </button>
                      </div>

                      {/* Task area — absolute positioning */}
                      <div className="relative" style={{ width: TIME_SLOTS.length * COL_W, height: ROW_H }}>
                        {/* Background grid lines */}
                        {TIME_SLOTS.map((slot, si) => {
                          const mins = slot.slice(3);
                          const isHour = mins === '00';
                          const isHalf = mins === '30';
                          return (
                            <div
                              key={slot}
                              className={`absolute top-0 bottom-0 ${isHour ? 'border-l-2 border-slate-200' : isHalf ? 'border-l border-slate-150' : 'border-l border-slate-100'}`}
                              style={{ left: si * COL_W, width: COL_W }}
                            />
                          );
                        })}

                        {/* Tasks */}
                        {repTasks.map((task) => {
                          const si = timeToSlotIndex(task.starttid);
                          const span = Math.max(1, Math.round(task.tidsestimat / 15));
                          const left = si * COL_W;
                          const width = span * COL_W;
                          return (
                            <button
                              key={task.id}
                              onClick={() => setSelectedOpgave(task)}
                              className={`absolute rounded-lg border-t-4 border p-1.5 text-left transition-all hover:shadow-md group overflow-hidden ${statusBorder(task.status)} ${statusBg(task.status)} border-slate-200`}
                              style={{ left: left + 1, width: width - 2, top: 4, bottom: 4 }}
                            >
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                                  {task.starttid}–{addMinutes(task.starttid, task.tidsestimat)}
                                </span>
                                <StatusBadge status={task.status} size="sm" />
                              </div>
                              <p className="text-[11px] font-semibold text-slate-900 leading-snug group-hover:text-navy-800 truncate">
                                {task.opgavetype}
                              </p>
                              {span >= 4 && (
                                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                                  {task.bil.mærke} {task.bil.model}
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── UGE VIEW ── */}
        {view === 'uge' && (
          <>
            {/* Week navigation */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setWeekOffset((v) => v - 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                aria-label="Forrige uge"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-slate-700 capitalize">{weekLabel}</span>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors"
                >
                  Denne uge
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

            {/* Rep filter hint */}
            {selectedRep && (
              <p className="mb-3 text-sm text-slate-500">
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

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: `${180 + weekDates.length * 200}px` }}>
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3 w-44 border-r border-slate-200 bg-slate-50">
                      Medarbejdere
                    </th>
                    {weekDates.map((d, i) => (
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

                      {weekDates.map((d, i) => {
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
                                      <span className="text-[10px] text-slate-400">{formatMinutes(task.tidsestimat)}</span>
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
          </>
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
