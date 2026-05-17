export type Status = 'Afventer' | 'I gang' | 'Færdig';

export interface Reparatør {
  id: string;
  navn: string;
}

export interface Opgave {
  id: string;
  kundenavn: string;
  kundeKontakt: string;
  bil: {
    mærke: string;
    model: string;
    nummerplade: string;
  };
  opgavetype: string;
  beskrivelse: string;
  tidsestimat: number; // minutes
  status: Status;
  reparatørId: string;
  dato: string;    // YYYY-MM-DD
  starttid: string; // HH:MM
}

export interface Pause {
  id: string;
  reparatørId: string;
  dato: string;  // YYYY-MM-DD
  start: string; // ISO timestamp
  slut: string | null;
}
