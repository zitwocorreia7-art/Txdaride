import React from 'react';
import { Calendar, CheckCircle2, ChevronRight, Clock, MapPin, Navigation, Tag, Trash2, X } from 'lucide-react';
import { ScheduledTrip } from '../../types';

interface ScheduledTripsListProps {
  scheduledTrips: ScheduledTrip[];
  onDispatchScheduledTrip: (trip: ScheduledTrip) => void;
  onCancelScheduledTrip: (tripId: string) => void;
  t: Record<string, string>;
}

export const ScheduledTripsList: React.FC<ScheduledTripsListProps> = ({
  scheduledTrips,
  onDispatchScheduledTrip,
  onCancelScheduledTrip,
  t,
}) => {
  if (scheduledTrips.length === 0) return null;

  return (
    <div id="scheduled-trips-container" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-sm text-white">
            {t.scheduled_rides_title || 'Viagens Agendadas'} ({scheduledTrips.length})
          </h3>
        </div>
        <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
          {t.scheduled_badge || 'Pré-Agendado'}
        </span>
      </div>

      <div className="space-y-3">
        {scheduledTrips.map((scheduled) => {
          const isSoon = scheduled.scheduledTime - Date.now() < 3600000 && scheduled.scheduledTime - Date.now() > 0;

          return (
            <div
              key={scheduled.id}
              id={`scheduled-card-${scheduled.id}`}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{scheduled.scheduledDateFormatted}</span>
                  {isSoon && (
                    <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold px-1.5 py-0.2 rounded uppercase">
                      Em breve
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-black text-amber-400">
                    {scheduled.fareBreakdown.finalFareCVE} CVE
                  </span>
                </div>
              </div>

              {/* Locations */}
              <div className="mt-2.5 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-300 truncate">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate">{scheduled.pickup.name.split('(')[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 truncate">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="truncate">{scheduled.dropoff.name.split('(')[0]}</span>
                </div>
              </div>

              {scheduled.notes && (
                <p className="mt-2 text-[11px] text-slate-400 italic bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                  "{scheduled.notes}"
                </p>
              )}

              {/* Actions: Dispatch Immediately or Cancel */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  id={`btn-cancel-scheduled-${scheduled.id}`}
                  onClick={() => onCancelScheduledTrip(scheduled.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-medium border border-slate-700 hover:border-rose-500/30 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t.cancel_scheduled || 'Cancelar'}</span>
                </button>

                <button
                  id={`btn-dispatch-scheduled-${scheduled.id}`}
                  onClick={() => onDispatchScheduledTrip(scheduled)}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-sm transition flex items-center gap-1.5"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{t.dispatch_now || 'Despachar Agora'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
