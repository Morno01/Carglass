export type Status = 'Afventer' | 'I gang' | 'Afsluttet';

export interface Reparatør {
  id: string;
  navn: string;
}

export interface Opgave {
  id: string;
  ordrenummer: string;
  kundenavn: string;
  kundeKontakt: string;
  kundeEmail: string;
  kundeAdresse: string;
  bil: {
    mærke: string;
    model: string;
    nummerplade: string;
    årstal: number;
    stelnummer: string;
  };
  opgavetype: string;
  beskrivelse: string;
  lokation: string;
  dele: string;
  noter: string;
  tidsestimat: number; // minutes
  status: Status;
  reparatørId: string;
  dato: string; // YYYY-MM-DD
  starttid: string; // HH:MM
}

export interface Pause {
  id: string;
  reparatørId: string;
  dato: string;
  start: string; // ISO timestamp
  slut: string | null;
}

export interface PauseSession {
  reparatørId: string;
  navn: string;
}
