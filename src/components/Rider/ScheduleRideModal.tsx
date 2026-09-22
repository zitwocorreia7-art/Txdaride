import React, { useState } from 'react';
import { Calendar, Clock, FileText, Info, ShieldCheck, Tag, X } from 'lucide-react';
import { FareBreakdown, LocationPoint, PaymentMethodType, PromoCode, RideTier, ScheduledTrip } from '../../types';

interface ScheduleRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSchedule: (scheduledTripData: {
    scheduledTime: number;
    scheduledDateFormatted: string;
    notes?: string;
  }) => void;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  tier: RideTier;
  fareBreakdown: FareBreakdown;
  paymentMethod: PaymentMethodType;
  appliedPromo?: PromoCode | null;
  t: Record<string, string>;
}

export const ScheduleRideModal: React.FC<ScheduleRideModalProps> = ({
  isOpen,
  onClose,
  onConfirmSchedule,
  pickup,
  dropoff,
  tier,
  fareBreakdown,
  paymentMethod,
  appliedPromo,
  t,
}) => {
  // Helper to get formatted default date/time (e.g., 2 hours in the future)
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15); // snap to next 15-min interval

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    return {
      date: `${yyyy}-${mm}-${dd}`,
      time: `${hh}:${min}`,
    };
  };

  const defaults = getDefaultDateTime();
  const [selectedDate, setSelectedDate] = useState<string>(defaults.date);
  const [selectedTime, setSelectedTime] = useState<string>(defaults.time);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  // Compute minimum selectable date (today)
  const todayStr = new Date().toISOString().split('T')[0];

  // Quick preset shortcuts (e.g., in 1 hour, tomorrow 08:00, tomorrow 18:00)
  const applyPreset = (type: 'plus1h' | 'tomorrow_morning' | 'tomorrow_evening') => {
    const now = new Date();
    if (type === 'plus1h') {
      now.setHours(now.getHours() + 1);
    } else if (type === 'tomorrow_morning') {
      now.setDate(now.getDate() + 1);
      now.setHours(8, 0, 0, 0);
    } else if (type === 'tomorrow_evening') {
      now.setDate(now.getDate() + 1);
      now.setHours(18, 30, 0, 0);
    }

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    setSelectedDate(`${yyyy}-${mm}-${dd}`);
    setSelectedTime(`${hh}:${min}`);
    setError('');
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError('Por favor selecione a data e a hora.');
      return;
    }

    const combinedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const now = new Date();

    // Check if at least 15 minutes in the future
    if (combinedDateTime.getTime() <= now.getTime() + 10 * 60 * 1000) {
      setError('O agendamento deve ser para pelo menos 15 minutos no futuro.');
      return;
    }

    const formattedDate = combinedDateTime.toLocaleDateString('pt-CV', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    onConfirmSchedule({
      scheduledTime: combinedDateTime.getTime(),
      scheduledDateFormatted: formattedDate,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div id="schedule-ride-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        id="schedule-ride-modal"
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
                {t.scheduled_badge || 'Pré-Agendamento'}
              </span>
              <h2 className="text-lg font-extrabold text-white mt-0.5">
                {t.schedule_modal_title || 'Agendar Viagem com Antecedência'}
              </h2>
            </div>
          </div>
          <button
            id="close-schedule-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-[11px] text-slate-400 self-center">Atalhos:</span>
          <button
            type="button"
            onClick={() => applyPreset('plus1h')}
            className="text-xs font-medium px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 border border-slate-700 transition"
          >
            Daqui a 1 hora
          </button>
          <button
            type="button"
            onClick={() => applyPreset('tomorrow_morning')}
            className="text-xs font-medium px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 border border-slate-700 transition"
          >
            Amanhã 08:00
          </button>
          <button
            type="button"
            onClick={() => applyPreset('tomorrow_evening')}
            className="text-xs font-medium px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 border border-slate-700 transition"
          >
            Amanhã 18:30
          </button>
        </div>

        {/* Date & Time Selectors Form */}
        <form onSubmit={handleConfirm} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Date Input */}
            <div>
              <label htmlFor="schedule-date-input" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.select_date || 'Data da Viagem'}</span>
              </label>
              <input
                id="schedule-date-input"
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setError('');
                }}
                required
                className="w-full bg-slate-800/90 text-white font-mono text-sm px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {/* Time Input */}
            <div>
              <label htmlFor="schedule-time-input" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.select_time || 'Hora de Partida'}</span>
              </label>
              <input
                id="schedule-time-input"
                type="time"
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                  setError('');
                }}
                required
                className="w-full bg-slate-800/90 text-white font-mono text-sm px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* Special Pickup Notes */}
          <div>
            <label htmlFor="schedule-notes-input" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.pickup_notes || 'Instruções para o Motorista (opcional)'}</span>
            </label>
            <input
              id="schedule-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notes_placeholder || 'Ex: Voo no aeroporto Nelson Mandela, bagagem volumosa, à porta...'}
              className="w-full bg-slate-800/90 text-white placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          {error && (
            <p id="schedule-error-msg" className="text-xs text-rose-400 font-medium">
              {error}
            </p>
          )}

          {/* Route & Guaranteed Pricing Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 font-medium">Itinerário:</span>
              <span className="font-semibold text-right truncate max-w-[240px]">
                {pickup.name.split('(')[0]} → {dropoff.name.split('(')[0]}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 font-medium">Categoria & Veículo:</span>
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                {tier === 'standard' ? 'Txada Pop' : tier === 'comfort' ? 'Txada Confort' : 'Hiace Coletivo'}
              </span>
            </div>

            {fareBreakdown.discountCVE && (
              <div className="flex items-center justify-between text-emerald-400">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>Desconto ({fareBreakdown.appliedPromoCode}):</span>
                </span>
                <span className="font-mono font-bold">-{fareBreakdown.discountCVE} CVE</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Preço Garantido Agendado:
                </span>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Sem surpresas na hora da partida
                </p>
              </div>
              <div className="text-right">
                {fareBreakdown.originalFareCVE && (
                  <span className="text-[11px] text-slate-500 line-through font-mono mr-1.5">
                    {fareBreakdown.originalFareCVE} CVE
                  </span>
                )}
                <span className="text-xl font-black text-amber-400 font-mono">
                  {fareBreakdown.finalFareCVE} <span className="text-xs text-white">CVE</span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              O sistema irá notificar e alocar automaticamente um motorista verificado cerca de 15 minutos antes da hora agendada. Pode cancelar gratuitamente a qualquer momento.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              id="btn-cancel-schedule-modal"
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition text-center"
            >
              Voltar
            </button>
            <button
              id="btn-submit-schedule-ride"
              type="submit"
              className="w-2/3 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.confirm_schedule || 'Confirmar Agendamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
