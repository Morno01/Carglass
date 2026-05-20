import { seedOpgaver, seedPauser } from './seedData';

const KEYS = {
  opgaver: 'carglass_opgaver',
  pauser: 'carglass_pauser',
  pauseSession: 'carglass_pause_session',
};

const REPARATØRER = [
  { id: 'rep-1', navn: 'Anders Nielsen' },
  { id: 'rep-2', navn: 'Maria Hansen' },
  { id: 'rep-3', navn: 'Peter Jensen' },
];

// ── Opgaver ────────────────────────────────────────────────────────────────

export function getOpgaver() {
  if (typeof window === 'undefined') return seedOpgaver;
  try {
    const raw = localStorage.getItem(KEYS.opgaver);
    if (!raw) {
      saveOpgaver(seedOpgaver);
      return seedOpgaver;
    }
    return JSON.parse(raw);
  } catch {
    return seedOpgaver;
  }
}

export function saveOpgaver(opgaver) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.opgaver, JSON.stringify(opgaver));
}

// ── Reparatører ────────────────────────────────────────────────────────────

export function getReparatører() {
  return REPARATØRER;
}

// ── Pauser ─────────────────────────────────────────────────────────────────

export function getPauser() {
  if (typeof window === 'undefined') return seedPauser;
  try {
    const raw = localStorage.getItem(KEYS.pauser);
    if (!raw) {
      savePauser(seedPauser);
      return seedPauser;
    }
    return JSON.parse(raw);
  } catch {
    return seedPauser;
  }
}

export function savePauser(pauser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.pauser, JSON.stringify(pauser));
}

// ── Pause Session ──────────────────────────────────────────────────────────

export function getPauseSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEYS.pauseSession);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setPauseSession(s) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.pauseSession, JSON.stringify(s));
}

export function clearPauseSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.pauseSession);
}
