import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Navigation, Phone, Shield, ShieldAlert, Star, X } from 'lucide-react';
import { ActiveTrip, TripStatus } from '../../types';

interface ActiveTripPanelProps {
  trip: ActiveTrip;
  onCancelTrip: () => void;
  onSimulateProgress: () => void;
  onCompleteTrip: () => void;
  t: Record<string, string>;
}

export const ActiveTripPanel: React.FC<ActiveTripPanelProps> = ({
  trip,
  onCancelTrip,
  onSimulateProgress,
  onCompleteTrip,
  t,
}) => {
  const getStatusLabel = (status: TripStatus): { title: string; desc: string; color: string } => {
    switch (status) {
      case 'dispatching':
        return {
          title: t.dispatching_driver || 'A despachar motorista mais próximo...',
          desc: 'O algoritmo inteligente está a selecionar o melhor veículo disponível.',
          color: 'text-amber-400',
        };
      case 'driver_accepted':
      case 'driver_arriving':
        return {
          title: `${trip.driver.name} ${t.driver_arriving || 'está a caminho!'}`,
          desc: 'Aguarde no ponto de partida com segurança.',
          color: 'text-blue-400',
        };
      case 'driver_arrived':
        return {
          title: t.driver_arrived || 'O seu motorista chegou!',
          desc: 'Confira a matrícula antes de embarcar e informe o PIN.',
          color: 'text-emerald-400',
        };
      case 'trip_in_progress':
        return {
          title: t.trip_in_progress || 'Em viagem para o seu destino',
          desc: 'Rastreio GPS em tempo real ativo.',
          color: 'text-emerald-400',
        };
      case 'trip_completed':
        return {
          title: t.trip_completed || 'Chegou ao seu destino!',
          desc: 'Pagamento processado com sucesso.',
          color: 'text-emerald-300',
        };
      default:
        return { title: 'Viagem Ativa', desc: '', color: 'text-white' };
    }
  };

  const statusInfo = getStatusLabel(trip.status);

  return (
    <div id="active-trip-panel" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Status Progress Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className={`font-bold text-base ${statusInfo.color}`}>
              {statusInfo.title}
            </h3>
            {trip.isPreBooked && (
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                {t.scheduled_badge || 'Pré-Agendado'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{statusInfo.desc}</p>
        </div>

        {/* ETA badge */}
        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">ETA Estimado</div>
          <div className="text-xl font-extrabold text-amber-400 font-mono">
            {trip.etaMinutes} <span className="text-xs font-normal">min</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 h-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(10, trip.progressPercent))}%` }}
        />
      </div>

      {/* VEHICLE PLATE & DRIVER DETAILS */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-850 border border-slate-700/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={trip.driver.avatar}
              alt={trip.driver.name}
              className="w-13 h-13 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base">{trip.driver.name}</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold">{trip.driver.rating.toFixed(2)}</span>
                <span className="text-slate-500">•</span>
                <span>{trip.driver.vehicle.make} {trip.driver.vehicle.model}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Cor: <span className="text-slate-200">{trip.driver.vehicle.color}</span>
              </div>
            </div>
          </div>

          {/* Authentic Cape Verde Plate */}
          <div className="flex flex-col items-end">
            <div className="text-[9px] uppercase font-bold text-slate-400 mb-1">
              {t.plate_number || 'Matrícula Oficial'}
            </div>
            <div className="flex items-center bg-white border border-slate-950 rounded-lg px-2.5 py-1 shadow-md">
              <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1 py-0.5 rounded mr-1.5">
                CV
              </span>
              <span className="font-mono-plate font-extrabold text-base text-slate-950">
                {trip.driver.vehicle.plate}
              </span>
            </div>
          </div>
        </div>

        {/* Security PIN and Fare details */}
        <div className="mt-3 pt-3 border-t border-slate-750 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{t.safety_pin || 'PIN de Segurança'}:</span>
            <span className="font-mono font-bold text-sm bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded">
              {trip.verificationPin}
            </span>
          </div>

          <div className="font-mono font-bold text-white">
            Tarifa: <span className="text-amber-400">{trip.fareBreakdown.finalFareCVE} CVE</span>
            {trip.fareBreakdown.totalSurgeMultiplier > 1 && (
              <span className="text-[10px] text-amber-300 ml-1">
                (⚡ {trip.fareBreakdown.totalSurgeMultiplier.toFixed(1)}x)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Driver communication and Emergency SOS */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {/* Call Driver */}
        <a
          id="btn-call-driver"
          href={`tel:${trip.driver.phone}`}
          className="col-span-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <Phone className="w-3.5 h-3.5 text-blue-400" />
          <span>Ligar</span>
        </a>

        {/* Advance Simulation Step */}
        <button
          id="btn-advance-trip"
          onClick={trip.status === 'trip_in_progress' ? onCompleteTrip : onSimulateProgress}
          className="col-span-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{trip.status === 'trip_in_progress' ? 'Concluir' : 'Avançar GPS'}</span>
        </button>

        {/* SOS Police / National Emergency */}
        <button
          id="btn-sos-emergency"
          onClick={() => {
            alert('🚨 SOS Emergência Cabo Verde: Polícia Nacional (132) ou Bombeiros (131). Localização GPS transmitida.');
          }}
          className="col-span-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/40 transition"
          title="Polícia Nacional CV (132)"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>SOS 132</span>
        </button>
      </div>

      {/* Cancel Option */}
      <div className="mt-3 text-center">
        <button
          id="btn-cancel-trip"
          onClick={onCancelTrip}
          className="text-[11px] text-slate-400 hover:text-rose-400 transition underline underline-offset-4"
        >
          Cancelar Viagem
        </button>
      </div>
    </div>
  );
};
