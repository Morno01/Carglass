import { Opgave, Pause, Reparatør } from './types';
import { seedOpgaver, seedPauser } from './seedData';

const KEYS = {
  opgaver: 'carglass_opgaver',
  reparatør: 'carglass_current_reparatør',
  pauser: 'carglass_pauser',
};

const REPARATØRER: Reparatør[] = [
  { id: 'rep-1', navn: 'Anders Nielsen' },
  { id: 'rep-2', navn: 'Mette Christensen' },
  { id: 'rep-3', navn: 'Kasper Jensen' },
];

// ── Opgaver ────────────────────────────────────────────────────────────────

export function getOpgaver(): Opgave[] {
  if (typeof window === 'undefined') return seedOpgaver;
  try {
    const raw = localStorage.getItem(KEYS.opgaver);
    if (!raw) {
      saveOpgaver(seedOpgaver);
      return seedOpgaver;
    }
    return JSON.parse(raw) as Opgave[];
  } catch {
    return seedOpgaver;
  }
}

export function saveOpgaver(opgaver: Opgave[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.opgaver, JSON.stringify(opgaver));
}

// ── Reparatører ────────────────────────────────────────────────────────────

export function getReparatører(): Reparatør[] {
  return REPARATØRER;
}

export function getCurrentReparatør(): Reparatør | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEYS.reparatør);
    if (!raw) return null;
    return JSON.parse(raw) as Reparatør;
  } catch {
    return null;
  }
}

export function setCurrentReparatør(r: Reparatør): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.reparatør, JSON.stringify(r));
}

// ── Pauser ─────────────────────────────────────────────────────────────────

export function getPauser(): Pause[] {
  if (typeof window === 'undefined') return seedPauser;
  try {
    const raw = localStorage.getItem(KEYS.pauser);
    if (!raw) {
      savePauser(seedPauser);
      return seedPauser;
    }
    return JSON.parse(raw) as Pause[];
  } catch {
    return seedPauser;
  }
}

export function savePauser(pauser: Pause[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.pauser, JSON.stringify(pauser));
}
