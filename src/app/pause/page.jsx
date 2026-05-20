'use client';

import { useEffect, useState, useRef } from 'react';
import { getPauser, savePauser, getPauseSession, setPauseSession, clearPauseSession } from '@/lib/storage';
import TopNav from '@/components/TopNav';
import SearchOverlay from '@/components/SearchOverlay';

const CREDENTIALS = {
  anders: { password: '1234', navn: 'Anders Nielsen', reparatørId: 'rep-1' },
  maria:  { password: '1234', navn: 'Maria Hansen',   reparatørId: 'rep-2' },
  peter:  { password: '1234', navn: 'Peter Jensen',   reparatørId: 'rep-3' },
};

function iDag() {
  return new Date().toISOString().split('T')[0];
}

function formatTid(iso) {
  return new Date(iso).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatClock(date) {
  return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '.');
}

function formatDateDK(date) {
  return date.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function varighedMs(ms) {
  const totalSek = Math.floor(ms / 1000);
  const sek = totalSek % 60;
  const min = Math.floor(totalSek / 60) % 60;
  const timer = Math.floor(totalSek / 3600);
  if (timer > 0) return `${String(timer).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sek).padStart(2, '0')}`;
  return `00:${String(min).padStart(2, '0')}:${String(sek).padStart(2, '0')}`;
}

function varighedLabel(start, slut) {
  const ms = (slut ? new Date(slut) : new Date()).getTime() - new Date(start).getTime();
  return varighedMs(ms);
}

export default function PausePage() {
  const [session, setSession] = useState(null);
  const [pauser, setPauser] = useState([]);
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginFejl, setLoginFejl] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    const s = getPauseSession();
    setSession(s);
    if (s) loadPauser(s.reparatørId);
    setMounted(true);
    intervalRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function loadPauser(repId) {
    const alle = getPauser();
    setPauser(alle.filter((p) => p.reparatørId === repId && p.dato === iDag()));
  }

  function handleLogin(e) {
    e.preventDefault();
    const cred = CREDENTIALS[username.toLowerCase()];
    if (!cred || cred.password !== password) {
      setLoginFejl('Forkert brugernavn eller adgangskode.');
      return;
    }
    const s = { reparatørId: cred.reparatørId, navn: cred.navn };
    setPauseSession(s);
    setSession(s);
    loadPauser(cred.reparatørId);
    setLoginFejl('');
  }

  function handleLogout() {
    clearPauseSession();
    setSession(null);
    setPauser([]);
    setUsername('');
    setPassword('');
  }

  const aktivPause = pauser.find((p) => p.slut === null) ?? null;

  function startPause() {
    if (!session || aktivPause) return;
    const ny = {
      id: `pause-${Date.now()}`,
      reparatørId: session.reparatørId,
      dato: iDag(),
      start: new Date().toISOString(),
      slut: null,
    };
    const opdateret = [...pauser, ny];
    setPauser(opdateret);
    const alle = getPauser().filter((p) => !(p.reparatørId === session.reparatørId && p.dato === iDag()));
    savePauser([...alle, ...opdateret]);
  }

  function slutPause() {
    if (!session || !aktivPause) return;
    const opdateret = pauser.map((p) => p.id === aktivPause.id ? { ...p, slut: new Date().toISOString() } : p);
    setPauser(opdateret);
    const alle = getPauser().filter((p) => !(p.reparatørId === session.reparatørId && p.dato === iDag()));
    savePauser([...alle, ...opdateret]);
  }

  const afsluttedePauser = pauser.filter((p) => p.slut !== null);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopNav onSearchClick={() => setSearchOpen((v) => !v)} searchOpen={searchOpen} />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectOpgave={() => setSearchOpen(false)}
      />

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {!session ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-navy-800 px-6 py-6 text-center">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                </div>
                <h1 className="text-white font-bold text-lg">Pause-stempling</h1>
                <p className="text-navy-200 text-sm mt-1">Log ind for at stemple pause</p>
              </div>
              <form onSubmit={handleLogin} className="px-6 py-6 space-y-4">
                {loginFejl && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                    {loginFejl}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Brugernavn</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setLoginFejl(''); }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                    placeholder="anders, maria eller peter"
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Adgangskode</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLoginFejl(''); }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                    placeholder="••••"
                    autoComplete="current-password"
                  />
                </div>
                <button type="submit" className="w-full bg-navy-800 hover:bg-navy-700 text-white font-semibold py-3 rounded-lg transition-colors">
                  Log ind
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-sm">
                    {session.navn.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{session.navn}</p>
                    <p className="text-xs text-slate-500">Reparatør</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1">
                  Log ud
                </button>
              </div>

              <div className="bg-navy-800 rounded-xl px-4 py-5 text-center">
                <p className="text-4xl font-bold text-white font-mono tracking-wider" suppressHydrationWarning>
                  {formatClock(now)}
                </p>
                <p className="text-navy-300 text-sm mt-2 capitalize" suppressHydrationWarning>
                  {formatDateDK(now)}
                </p>
              </div>

              {aktivPause ? (
                <div className="bg-white rounded-xl border-2 border-orange-400 shadow-sm px-4 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
                    <p className="text-sm font-bold text-orange-600">Du holder pause</p>
                  </div>
                  <p className="text-4xl font-mono font-bold text-slate-900 text-center mb-1" suppressHydrationWarning>
                    {varighedLabel(aktivPause.start, null)}
                  </p>
                  <p className="text-xs text-slate-500 text-center mb-1">
                    Startet kl. {formatTid(aktivPause.start)}
                  </p>
                  <p className="text-xs text-slate-400 text-center mb-4" suppressHydrationWarning>
                    Nuværende tid: {formatClock(now)}
                  </p>
                  <button onClick={slutPause} className="w-full bg-navy-800 hover:bg-navy-700 text-white font-semibold py-3 rounded-lg transition-colors">
                    Stemple ud af pause
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-slate-400">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Ingen aktiv pause</p>
                  <p className="text-xs text-slate-400 mb-4">Klik for at starte pause</p>
                  <button onClick={startPause} className="w-full bg-navy-800 hover:bg-navy-700 text-white font-semibold py-3 rounded-lg transition-colors">
                    Stemple ind til pause
                  </button>
                </div>
              )}

              {afsluttedePauser.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pauser i dag</h2>
                  <ul className="space-y-2">
                    {[...afsluttedePauser].reverse().map((p, i) => (
                      <li key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                            {afsluttedePauser.length - i}
                          </span>
                          <div className="text-sm">
                            <span className="font-medium text-slate-800">{formatTid(p.start)}</span>
                            <span className="text-slate-400 mx-1">→</span>
                            <span className="text-slate-600">{formatTid(p.slut)}</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-mono">
                          {varighedLabel(p.start, p.slut)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
