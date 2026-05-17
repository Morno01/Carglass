'use client';

import { useState } from 'react';
import { getOpgaver, saveOpgaver, getReparatører } from '@/lib/storage';
import { Opgave, Status } from '@/lib/types';

interface Props {
  defaultDato?: string;
  defaultStarttid?: string;
  defaultReparatørId?: string;
  onClose: () => void;
  onSaved: () => void;
}

const OPGAVETYPER = [
  'Forrude udskiftning',
  'Stenskade reparation',
  'Siderude udskiftning',
];

function generateId(): string {
  return 'opgave-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

export default function NyOpgaveModal({
  defaultDato = '',
  defaultStarttid = '08:00',
  defaultReparatørId = '',
  onClose,
  onSaved,
}: Props) {
  const reparatører = getReparatører();

  const [form, setForm] = useState({
    kundenavn: '',
    kundeKontakt: '',
    mærke: '',
    model: '',
    nummerplade: '',
    opgavetype: OPGAVETYPER[0],
    beskrivelse: '',
    tidsestimat: 60,
    reparatørId: defaultReparatørId || reparatører[0]?.id || '',
    dato: defaultDato,
    starttid: defaultStarttid,
  });
  const [error, setError] = useState('');

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.kundenavn.trim()) return setError('Kundenavn er påkrævet.');
    if (!form.dato) return setError('Dato er påkrævet.');
    if (!form.starttid) return setError('Starttid er påkrævet.');
    if (!form.mærke.trim() || !form.model.trim() || !form.nummerplade.trim())
      return setError('Biloplysninger er påkrævede.');

    // Double-booking check
    const opgaver = getOpgaver();
    const conflict = opgaver.find(
      (o) =>
        o.reparatørId === form.reparatørId &&
        o.dato === form.dato &&
        o.starttid === form.starttid
    );
    if (conflict) {
      const rep = reparatører.find((r) => r.id === form.reparatørId);
      setError(
        `${rep?.navn ?? 'Reparatøren'} har allerede en booking kl. ${form.starttid} den ${form.dato}. Vælg et andet tidspunkt.`
      );
      return;
    }

    const nyOpgave: Opgave = {
      id: generateId(),
      kundenavn: form.kundenavn.trim(),
      kundeKontakt: form.kundeKontakt.trim(),
      bil: {
        mærke: form.mærke.trim(),
        model: form.model.trim(),
        nummerplade: form.nummerplade.trim().toUpperCase(),
      },
      opgavetype: form.opgavetype,
      beskrivelse: form.beskrivelse.trim(),
      tidsestimat: Number(form.tidsestimat),
      status: 'Afventer' as Status,
      reparatørId: form.reparatørId,
      dato: form.dato,
      starttid: form.starttid,
    };

    saveOpgaver([...opgaver, nyOpgave]);
    onSaved();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Ny Booking</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Scheduling */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tidspunkt og reparatør</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dato</label>
                <input
                  type="date"
                  name="dato"
                  value={form.dato}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Starttid</label>
                <input
                  type="time"
                  name="starttid"
                  value={form.starttid}
                  min="08:00"
                  max="17:00"
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reparatør</label>
                <select
                  name="reparatørId"
                  value={form.reparatørId}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {reparatører.map((r) => (
                    <option key={r.id} value={r.id}>{r.navn}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Customer */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Kunde</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Navn</label>
                <input
                  type="text"
                  name="kundenavn"
                  value={form.kundenavn}
                  onChange={handleChange}
                  placeholder="f.eks. Lars Pedersen"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  name="kundeKontakt"
                  value={form.kundeKontakt}
                  onChange={handleChange}
                  placeholder="f.eks. 21345678"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Car */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Bil</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mærke</label>
                <input
                  type="text"
                  name="mærke"
                  value={form.mærke}
                  onChange={handleChange}
                  placeholder="f.eks. Volkswagen"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="f.eks. Golf"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nummerplade</label>
                <input
                  type="text"
                  name="nummerplade"
                  value={form.nummerplade}
                  onChange={handleChange}
                  placeholder="f.eks. AB 12 345"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>
            </div>
          </section>

          {/* Task */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Opgave</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Opgavetype</label>
                <select
                  name="opgavetype"
                  value={form.opgavetype}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {OPGAVETYPER.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tidsestimat (minutter)</label>
                <input
                  type="number"
                  name="tidsestimat"
                  value={form.tidsestimat}
                  onChange={handleChange}
                  min={15}
                  max={480}
                  step={15}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Beskrivelse</label>
              <textarea
                name="beskrivelse"
                value={form.beskrivelse}
                onChange={handleChange}
                rows={3}
                placeholder="Beskriv skaden og eventuelle særlige ønsker fra kunden..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">
              Annuller
            </button>
            <button type="submit" className="btn-primary text-sm">
              Opret booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
