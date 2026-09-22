import React from 'react';
import { Clock, Flame, Info, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { getTimeOfDayProfile } from '../../utils/pricingEngine';

interface SurgeSimulatorBarProps {
  timeOfDayHours: number;
  onTimeChange: (hours: number) => void;
  demandLevel: 'normal' | 'high' | 'peak' | 'extreme';
  onDemandChange: (level: 'normal' | 'high' | 'peak' | 'extreme') => void;
  currentSurgeMultiplier: number;
  isDriverMode: boolean;
  activeSurgeZonesCount: number;
  t: Record<string, string>;
}

export const SurgeSimulatorBar: React.FC<SurgeSimulatorBarProps> = ({
  timeOfDayHours,
  onTimeChange,
  demandLevel,
  onDemandChange,
  currentSurgeMultiplier,
  isDriverMode,
  activeSurgeZonesCount,
  t,
}) => {
  const timeProfile = getTimeOfDayProfile(timeOfDayHours);

  // Format hour into HH:MM
  const formatHourString = (val: number): string => {
    const h = Math.floor(val);
    const m = Math.floor((val - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div id="surge-control-panel" className="bg-slate-900 border-b border-slate-800 text-slate-200 px-4 py-2.5 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Dynamic Pricing Status & Badge */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold ${
            currentSurgeMultiplier > 1.2
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
          }`}>
            {currentSurgeMultiplier > 1.2 ? (
              <>
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{currentSurgeMultiplier.toFixed(2)}x {t.surge_pricing_active || 'Tarifa Dinâmica'}</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>1.00x Tarifa Normal</span>
              </>
            )}
          </div>

          {/* Zones count indicator */}
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            <span className="text-amber-400 font-semibold">{activeSurgeZonesCount}</span> zonas ativas com procura elevada
          </span>
        </div>

        {/* Live Controls: Time of Day & Real-Time Demand Simulator */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Time of Day Presets */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-mono font-bold">{formatHourString(timeOfDayHours)}</span>
            <div className="flex items-center gap-1 ml-1">
              <button
                id="btn-time-morning"
                onClick={() => onTimeChange(8.25)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                  timeProfile.period === 'morning_rush'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Hora de ponta de manhã (08:15)"
              >
                Manhã 8h
              </button>
              <button
                id="btn-time-day"
                onClick={() => onTimeChange(13.5)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                  timeProfile.period === 'day_standard'
                    ? 'bg-blue-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tarifa Normal do dia (13:30)"
              >
                Dia 13h
              </button>
              <button
                id="btn-time-evening"
                onClick={() => onTimeChange(18.0)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                  timeProfile.period === 'evening_rush'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Hora de ponta regresso (18:00)"
              >
                Ponta 18h
              </button>
              <button
                id="btn-time-night"
                onClick={() => onTimeChange(1.5)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                  timeProfile.period === 'late_night'
                    ? 'bg-purple-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Noite / Madrugada (01:30)"
              >
                Noite 01h
              </button>
            </div>
          </div>

          {/* Demand Level Selector */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Procura:</span>
            {(['normal', 'high', 'peak', 'extreme'] as const).map((lvl) => (
              <button
                key={lvl}
                id={`btn-demand-${lvl}`}
                onClick={() => onDemandChange(lvl)}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider transition ${
                  demandLevel === lvl
                    ? lvl === 'extreme'
                      ? 'bg-rose-500 text-white'
                      : lvl === 'peak'
                      ? 'bg-amber-400 text-slate-950'
                      : lvl === 'high'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl === 'normal' ? 'Normal' : lvl === 'high' ? 'Alta' : lvl === 'peak' ? 'Pico' : 'Extrema'}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Pricing Driver / Rider benefit notice banner */}
        <div className="w-full pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          {isDriverMode ? (
            <div className="flex items-center gap-1.5 text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>Vantagem do Motorista:</strong> 100% do bónus de tarifa dinâmica ({currentSurgeMultiplier > 1 ? `+${Math.round((currentSurgeMultiplier - 1) * 100)}%` : '0%'}) vai diretamente para a sua conta!
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>
                <strong>Transparência de Tarifa:</strong> Os preços ajustam-se para garantir que haja sempre motoristas disponíveis quando mais precisa.
              </span>
            </div>
          )}

          <div className="font-mono text-slate-400 hidden md:block">
            Base × Fator Horário ({timeProfile.multiplier.toFixed(2)}x) × Zonas = <strong className="text-white">{currentSurgeMultiplier.toFixed(2)}x</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
