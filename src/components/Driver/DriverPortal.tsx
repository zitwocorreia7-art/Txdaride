import React, { useState } from 'react';
import { Award, Car, Check, CheckCircle2, ChevronRight, DollarSign, Flame, MapPin, Navigation, PlusCircle, ShieldCheck, Sparkles, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { CAPE_VERDE_ISLANDS, CV_ZONES, formatCapeVerdePlate, isValidCapeVerdePlate } from '../../data/capeVerdeData';
import { Driver, DriverRegistrationForm, IslandId, RideTier } from '../../types';

interface DriverPortalProps {
  currentDriver: Driver;
  onUpdateDriver: (driver: Driver) => void;
  onRegisterNewCar: (form: DriverRegistrationForm) => void;
  currentIsland: IslandId;
  incomingTripRequest: {
    id: string;
    riderName: string;
    pickupName: string;
    dropoffName: string;
    fareCVE: number;
    surgeBonusCVE: number;
    distanceKm: number;
  } | null;
  onAcceptIncomingTrip: () => void;
  onDeclineIncomingTrip: () => void;
  currentSurgeMultiplier: number;
  t: Record<string, string>;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({
  currentDriver,
  onUpdateDriver,
  onRegisterNewCar,
  currentIsland,
  incomingTripRequest,
  onAcceptIncomingTrip,
  onDeclineIncomingTrip,
  currentSurgeMultiplier,
  t,
}) => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regForm, setRegForm] = useState<DriverRegistrationForm>({
    fullName: '',
    phone: '+238 ',
    islandId: currentIsland,
    make: 'Toyota',
    model: 'Yaris',
    year: 2022,
    color: 'Branco (White)',
    plate: '',
    tier: 'standard',
    licenseNumber: 'CV-109283',
  });
  const [plateError, setPlateError] = useState('');

  const islandZones = CV_ZONES.filter((z) => z.islandId === currentIsland);

  const handleToggleOnline = () => {
    onUpdateDriver({
      ...currentDriver,
      isOnline: !currentDriver.isOnline,
    });
  };

  const handlePlateChange = (val: string) => {
    const formatted = formatCapeVerdePlate(val);
    setRegForm({ ...regForm, plate: formatted });
    if (formatted.length >= 8) {
      if (!isValidCapeVerdePlate(formatted)) {
        setPlateError('Formato inválido. Use formato ex: ST-24-BC ou SV-10-AB');
      } else {
        setPlateError('');
      }
    } else {
      setPlateError('');
    }
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidCapeVerdePlate(regForm.plate)) {
      setPlateError('Por favor insira uma matrícula válida de Cabo Verde (Ex: ST-44-AZ)');
      return;
    }
    onRegisterNewCar(regForm);
    setShowRegisterModal(false);
  };

  return (
    <div id="driver-portal" className="space-y-4">
      {/* Top Banner: Online Toggle & Car Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentDriver.avatar}
                alt={currentDriver.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  currentDriver.isOnline ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-white">{currentDriver.name}</h2>
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {currentDriver.rating.toFixed(2)}
                </span>
                <span>•</span>
                <span>{currentDriver.totalTrips} viagens</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">{currentDriver.acceptanceRate}% aceitação</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            {/* Register another car button */}
            <button
              id="btn-register-car"
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>{t.sign_up_car || 'Registar Carro'}</span>
            </button>

            {/* Online / Offline switch */}
            <button
              id="btn-driver-online-toggle"
              onClick={handleToggleOnline}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
                currentDriver.isOnline
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${currentDriver.isOnline ? 'bg-slate-950 animate-pulse' : 'bg-slate-500'}`} />
              <span>{currentDriver.isOnline ? t.driver_online || 'Online (A Receber)' : t.driver_offline || 'Offline'}</span>
            </button>
          </div>
        </div>

        {/* Current Vehicle Badge with Authentic Cape Verde Plate */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">
              Viatura em serviço: <strong className="text-white">{currentDriver.vehicle.make} {currentDriver.vehicle.model}</strong> ({currentDriver.vehicle.year}) • {currentDriver.vehicle.color}
            </span>
          </div>

          {/* Authentic Plate Display */}
          <div className="flex items-center bg-white border border-slate-900 rounded-lg px-2.5 py-0.5 shadow-sm">
            <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1 py-0.5 rounded mr-1">
              CV
            </span>
            <span className="font-mono-plate font-extrabold text-sm text-slate-950">
              {currentDriver.vehicle.plate}
            </span>
          </div>
        </div>
      </div>

      {/* DRIVER SURGE BENEFIT & EARNINGS METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Total Today Earnings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Ganhos Totais Hoje</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1 text-2xl font-black text-white font-mono">
            {currentDriver.todayEarningsCVE} <span className="text-xs text-slate-400">CVE</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {currentDriver.completedRidesToday} viagens concluídas hoje
          </div>
        </div>

        {/* Dynamic Surge Bonuses Earned */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/40 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-amber-300 text-xs font-semibold">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Bónus de Tarifa Dinâmica
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1 text-2xl font-black text-amber-400 font-mono">
            +{currentDriver.todaySurgeBonusCVE} <span className="text-xs text-amber-300">CVE</span>
          </div>
          <div className="text-[10px] text-amber-200/80 mt-1">
            <strong>100%</strong> das sobretaxas de procura revertem para si!
          </div>
        </div>

        {/* Current Area Surge Multiplier */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Multiplicador na Zona</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-1 text-2xl font-black text-blue-400 font-mono">
            {currentSurgeMultiplier.toFixed(2)}x
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {currentSurgeMultiplier > 1.1 ? '⚡ Alta procura ativa nesta zona!' : 'Procura estável'}
          </div>
        </div>
      </div>

      {/* LIVE SURGE HEATMAP ZONES FOR DRIVERS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="font-extrabold text-base text-white">
              {t.surge_heatmap || 'Zonas Quentes com Tarifa Dinâmica Ativa'}
            </h3>
          </div>
          <span className="text-xs text-slate-400">Dirija-se a estas zonas para faturar mais</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {islandZones.map((zone) => {
            const isHighSurge = zone.surgeMultiplier >= 1.35;
            const extraBonusEst = Math.round(350 * (zone.surgeMultiplier - 1));

            return (
              <div
                key={zone.id}
                className={`p-3 rounded-2xl border transition ${
                  isHighSurge
                    ? 'bg-amber-500/10 border-amber-500/40 text-white'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-bold text-xs text-white">{zone.name}</div>
                  <span
                    className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                      isHighSurge ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    ⚡ {zone.surgeMultiplier.toFixed(1)}x
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{zone.description}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800">
                  <span className="text-emerald-400 font-medium">Bónus estimado: +{extraBonusEst} CVE</span>
                  <span className="text-slate-400">{zone.activeRiders} pedidos / {zone.availableDrivers} carros</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INCOMING RIDE REQUEST POPUP (Simulated Dispatch) */}
      {incomingTripRequest && (
        <div id="incoming-trip-card" className="p-4 rounded-3xl bg-gradient-to-r from-blue-900/90 via-slate-900 to-amber-950/60 border-2 border-amber-400 shadow-2xl animate-bounce">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <h4 className="font-extrabold text-base text-amber-300">
                {t.incoming_request || 'Novo Pedido de Viagem!'}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {incomingTripRequest.fareCVE} CVE
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-xs text-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Passageiro:</span>
              <strong className="text-white">{incomingTripRequest.riderName}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Origem:</span>
              <span className="text-emerald-300">{incomingTripRequest.pickupName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Destino:</span>
              <span className="text-rose-300">{incomingTripRequest.dropoffName}</span>
            </div>
          </div>

          {/* Highlight Surge Bonus to Driver */}
          {incomingTripRequest.surgeBonusCVE > 0 && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs text-amber-300 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                Inclui Bónus de Tarifa Dinâmica:
              </span>
              <span className="font-mono font-bold">+{incomingTripRequest.surgeBonusCVE} CVE</span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              id="btn-decline-incoming-trip"
              onClick={onDeclineIncomingTrip}
              className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition"
            >
              {t.decline_ride || 'Recusar'}
            </button>
            <button
              id="btn-accept-incoming-trip"
              onClick={onAcceptIncomingTrip}
              className="w-2/3 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t.accept_ride || 'Aceitar Viagem'}</span>
            </button>
          </div>
        </div>
      )}

      {/* REGISTER CAR MODAL */}
      {showRegisterModal && (
        <div id="register-car-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
            <h3 className="text-xl font-extrabold text-white">
              {t.register_vehicle || 'Registar Viatura em Cabo Verde'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Adicione o seu carro à frota local e comece a faturar com viagens na sua ilha.
            </p>

            <form onSubmit={handleSubmitRegistration} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400">Nome Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Baptista Silva"
                  value={regForm.fullName}
                  onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400">Telemóvel (+238 Unitel / CVMóvel):</label>
                <input
                  type="text"
                  required
                  placeholder="+238 991 22 33"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400">Marca:</label>
                  <input
                    type="text"
                    required
                    placeholder="Toyota, Renault, etc."
                    value={regForm.make}
                    onChange={(e) => setRegForm({ ...regForm, make: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400">Modelo:</label>
                  <input
                    type="text"
                    required
                    placeholder="Yaris, Duster, etc."
                    value={regForm.model}
                    onChange={(e) => setRegForm({ ...regForm, model: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400">Ano:</label>
                  <input
                    type="number"
                    min="2010"
                    max="2026"
                    value={regForm.year}
                    onChange={(e) => setRegForm({ ...regForm, year: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400">Cor:</label>
                  <input
                    type="text"
                    placeholder="Branco, Cinza, etc."
                    value={regForm.color}
                    onChange={(e) => setRegForm({ ...regForm, color: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* CAPE VERDE AUTHENTIC PLATE INPUT & VALIDATION */}
              <div className="p-3 bg-slate-850 rounded-2xl border border-slate-700">
                <label className="text-[11px] font-bold uppercase text-amber-400 flex items-center justify-between">
                  <span>Matrícula de Cabo Verde (Ex: ST-44-AZ):</span>
                  <span className="text-[9px] text-slate-400 font-normal">ST / SV / SL / BV</span>
                </label>
                <div className="mt-2 flex items-center bg-white border border-slate-900 rounded-xl px-3 py-1.5">
                  <span className="bg-amber-400 text-slate-950 font-black text-xs px-2 py-1 rounded mr-2">
                    CV
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="ST-88-XY"
                    value={regForm.plate}
                    onChange={(e) => handlePlateChange(e.target.value)}
                    className="w-full font-mono-plate font-extrabold text-lg text-slate-950 uppercase tracking-widest focus:outline-none bg-transparent"
                  />
                </div>
                {plateError ? (
                  <p className="text-[11px] text-rose-400 mt-1 font-semibold">{plateError}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Formato oficial: Código da ilha (ST/SV/SL/BV), número de 2 dígitos e 2 letras.
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400">Categoria:</label>
                <select
                  value={regForm.tier}
                  onChange={(e) => setRegForm({ ...regForm, tier: e.target.value as RideTier })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="standard">Txada Pop (Económico 4 lugares)</option>
                  <option value="comfort">Txada Confort (Moderno com Ar Condicionado)</option>
                  <option value="hiace">Hiace Coletivo (Van até 12 passageiros)</option>
                </select>
              </div>

              <div className="mt-5 flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg transition"
                >
                  Registar e Ativar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
