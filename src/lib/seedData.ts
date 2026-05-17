import { Opgave, Pause } from './types';

function getWeekDate(dayOffset: number): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  // Find Monday of this week
  const monday = new Date(now);
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const target = new Date(monday);
  target.setDate(monday.getDate() + dayOffset);
  return target.toISOString().split('T')[0];
}

export const seedOpgaver: Opgave[] = [
  {
    id: 'opgave-1',
    kundenavn: 'Lars Pedersen',
    kundeKontakt: '21345678',
    bil: { mærke: 'Volkswagen', model: 'Golf', nummerplade: 'AB 12 345' },
    opgavetype: 'Forrude udskiftning',
    beskrivelse: 'Forruden er revnet fra bunden og op langs siden. Skal udskiftes hurtigst muligt. Kunden ønsker at blive kontaktet når bilen er klar.',
    tidsestimat: 90,
    status: 'Afventer',
    reparatørId: 'rep-1',
    dato: getWeekDate(0), // Monday
    starttid: '08:00',
  },
  {
    id: 'opgave-2',
    kundenavn: 'Sofie Andersen',
    kundeKontakt: '31456789',
    bil: { mærke: 'Toyota', model: 'Corolla', nummerplade: 'CD 23 456' },
    opgavetype: 'Stenskade reparation',
    beskrivelse: 'Lille stenskade i øjenhøjde på forruden. Revnen er ca. 2 cm og skal repareres inden den spreder sig.',
    tidsestimat: 30,
    status: 'Afventer',
    reparatørId: 'rep-2',
    dato: getWeekDate(0), // Monday
    starttid: '09:00',
  },
  {
    id: 'opgave-3',
    kundenavn: 'Mikkel Sørensen',
    kundeKontakt: '41567890',
    bil: { mærke: 'Ford', model: 'Focus', nummerplade: 'EF 34 567' },
    opgavetype: 'Siderude udskiftning',
    beskrivelse: 'Venstre bagsiderude er smadret. Muligvis indbrud. Kunden har anmeldt det til politiet. Ny rude skal monteres.',
    tidsestimat: 60,
    status: 'Afventer',
    reparatørId: 'rep-3',
    dato: getWeekDate(0), // Monday
    starttid: '10:00',
  },
  {
    id: 'opgave-4',
    kundenavn: 'Hanne Møller',
    kundeKontakt: '51678901',
    bil: { mærke: 'Peugeot', model: '308', nummerplade: 'GH 45 678' },
    opgavetype: 'Forrude udskiftning',
    beskrivelse: 'Forruden har fået et kraftigt slag fra en lastbil på motorvejen. Hele den øvre del er revnet. Akut udskiftning nødvendig.',
    tidsestimat: 90,
    status: 'Afventer',
    reparatørId: 'rep-1',
    dato: getWeekDate(1), // Tuesday
    starttid: '08:30',
  },
  {
    id: 'opgave-5',
    kundenavn: 'Thomas Christensen',
    kundeKontakt: '61789012',
    bil: { mærke: 'BMW', model: '320i', nummerplade: 'IJ 56 789' },
    opgavetype: 'Stenskade reparation',
    beskrivelse: 'To stenskader på forruden, begge under 2 cm. Reparation bør kunne klares inden for 45 minutter.',
    tidsestimat: 45,
    status: 'Afventer',
    reparatørId: 'rep-2',
    dato: getWeekDate(1), // Tuesday
    starttid: '11:00',
  },
  {
    id: 'opgave-6',
    kundenavn: 'Birgitte Hansen',
    kundeKontakt: '71890123',
    bil: { mærke: 'Audi', model: 'A4', nummerplade: 'KL 67 890' },
    opgavetype: 'Forrude udskiftning',
    beskrivelse: 'Forruden er slået af vandaler natten til i dag. Kunden er meget frustreret og ønsker hurtig ekspedition.',
    tidsestimat: 90,
    status: 'Afventer',
    reparatørId: 'rep-3',
    dato: getWeekDate(2), // Wednesday
    starttid: '09:00',
  },
  {
    id: 'opgave-7',
    kundenavn: 'Jesper Rasmussen',
    kundeKontakt: '81901234',
    bil: { mærke: 'Skoda', model: 'Octavia', nummerplade: 'MN 78 901' },
    opgavetype: 'Siderude udskiftning',
    beskrivelse: 'Forreste højre siderude er knust. Kunden afleverer bilen om morgenen og henter den om eftermiddagen.',
    tidsestimat: 60,
    status: 'Afventer',
    reparatørId: 'rep-1',
    dato: getWeekDate(3), // Thursday
    starttid: '08:00',
  },
  {
    id: 'opgave-8',
    kundenavn: 'Camilla Nielsen',
    kundeKontakt: '91012345',
    bil: { mærke: 'Renault', model: 'Megane', nummerplade: 'OP 89 012' },
    opgavetype: 'Stenskade reparation',
    beskrivelse: 'Stenskade midt på forruden. Revnen er 3 cm og risikerer at sprede sig. Kunden ønsker reparation i stedet for udskiftning om muligt.',
    tidsestimat: 30,
    status: 'Afventer',
    reparatørId: 'rep-2',
    dato: getWeekDate(4), // Friday
    starttid: '13:00',
  },
];

export const seedPauser: Pause[] = [];
