import React from 'react';
import { Award, CheckCircle, ChevronRight, CreditCard, Flame, Info, Lock, Phone, ShieldCheck, Star, Tag, X } from 'lucide-react';
import { Driver, FareBreakdown, LocationPoint, PaymentMethodType, RideTier } from '../../types';

interface PreTripConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  driver: Driver;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  tier: RideTier;
  fareBreakdown: FareBreakdown;
  paymentMethod: PaymentMethodType;
  verificationPin: string;
  t: Record<string, string>;
}

export const PreTripConfirmationModal: React.FC<PreTripConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  driver,
  pickup,
  dropoff,
  tier,
  fareBreakdown,
  paymentMethod,
  verificationPin,
  t,
}) => {
  if (!isOpen) return null;

  const isSurge = fareBreakdown.totalSurgeMultiplier > 1.05;

  return (
    <div id="pre-trip-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        id="pre-trip-modal"
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t.plate_verification || 'Verificação de Segurança'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              {t.driver_details || 'Detalhes do Motorista & Viatura'}
            </h2>
          </div>
          <button
            id="close-pre-trip-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROMINENT CAPE VERDE VEHICLE PLATE DISPLAY */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-b from-slate-850 to-slate-950 border border-slate-700/80 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
            Matrícula Oficial de Cabo Verde (Confirme antes de entrar):
          </span>

          {/* Authentic Cape Verde Plate Design */}
          <div className="flex items-center bg-white border-2 border-slate-950 rounded-lg px-4 py-2 shadow-xl shadow-black/50 select-none">
            {/* Left yellow bar with CV initials */}
            <div className="bg-amber-400 text-slate-950 font-black text-xs px-2 py-1 rounded mr-3 flex flex-col items-center leading-none">
              <span>CV</span>
              <span className="text-[8px] font-bold">🇨🇻</span>
            </div>

            {/* License plate characters */}
            <div className="font-mono-plate font-extrabold text-2xl md:text-3xl text-slate-950 tracking-widest">
              {driver.vehicle.plate}
            </div>
          </div>

          <p className="text-[11px] text-amber-300/90 mt-2 font-medium">
            {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.year}) • {driver.vehicle.color}
          </p>
        </div>

        {/* Driver Profile Summary */}
        <div className="mt-4 flex items-center justify-between p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/70">
          <div className="flex items-center gap-3">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-13 h-13 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base">{driver.name}</span>
                <CheckCircle className="w-4 h-4 text-blue-400 fill-blue-400/20" />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {driver.rating.toFixed(2)}
                </span>
                <span className="text-slate-500">•</span>
                <span>{driver.totalTrips} viagens</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-semibold">{driver.acceptanceRate}% aceitação</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{driver.phone}</span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="text-right">
            <span className="inline-block bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-1 rounded-lg">
              {driver.badges[0] || 'Top Rated'}
            </span>
          </div>
        </div>

        {/* Safety 4-Digit Verification PIN */}
        <div className="mt-3.5 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-300">
                {t.safety_pin || 'PIN de Segurança'}: <strong className="font-mono text-white text-sm tracking-wider">{verificationPin}</strong>
              </div>
              <div className="text-[10px] text-slate-300">
                {t.safety_pin_hint || 'Diga este PIN ao motorista para iniciar a viagem'}
              </div>
            </div>
          </div>
        </div>

        {/* Route Details */}
        <div className="mt-4 p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Partida:</span>
              <p className="text-slate-200 font-medium">{pickup.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-1 shrink-0" />
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Destino:</span>
              <p className="text-slate-200 font-medium">{dropoff.name}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Surge Pricing Transparency Card */}
        <div className="mt-4 p-3.5 bg-slate-850 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-200">
                Pagamento: {paymentMethod === 'vinti4' ? 'Rede Vinti4 CV' : paymentMethod === 'cash_cve' ? 'Dinheiro (CVE)' : 'Cartão Débito/Crédito'}
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">{fareBreakdown.distanceKm} km (~{fareBreakdown.estimatedMinutes} min)</span>
          </div>

          {/* Surge Breakdown if active */}
          {isSurge ? (
            <div className="mt-2.5 p-2 rounded-lg bg-amber-500/15 border border-amber-500/30">
              <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Tarifa Dinâmica Ativa ({fareBreakdown.totalSurgeMultiplier.toFixed(2)}x)
                </span>
                <span>+{fareBreakdown.totalSurgeAmountCVE} CVE</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-1">
                A tarifa foi ajustada devido a alta procura na zona ({fareBreakdown.zoneName}). <strong>100% deste bónus ({fareBreakdown.totalSurgeAmountCVE} CVE) é repassado ao motorista {driver.name.split(' ')[0]}!</strong>
              </p>
            </div>
          ) : null}

          {/* Promo Code Discount if active */}
          {fareBreakdown.discountCVE && fareBreakdown.discountCVE > 0 ? (
            <div className="mt-2.5 p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  {t.promo_discount || 'Desconto Promocional'} ({fareBreakdown.appliedPromoCode})
                </span>
                <span className="font-mono">-{fareBreakdown.discountCVE} CVE</span>
              </div>
              {fareBreakdown.promoDescription && (
                <p className="text-[10px] text-emerald-300/80 mt-1 font-medium">{fareBreakdown.promoDescription}</p>
              )}
            </div>
          ) : null}

          {/* Final Fare & Driver Benefit */}
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                {t.total_fare || 'Preço Garantido'}
              </div>
              <div className="text-[10px] text-emerald-400">
                Sem custos ocultos • Preço fixado
              </div>
            </div>
            <div className="text-right">
              {fareBreakdown.originalFareCVE && (
                <div className="text-xs text-slate-400 line-through font-mono">
                  {fareBreakdown.originalFareCVE} CVE
                </div>
              )}
              <span className="text-2xl font-black text-amber-400 font-mono">
                {fareBreakdown.finalFareCVE} <span className="text-sm font-bold text-white">CVE</span>
              </span>
              <div className="text-[10px] text-slate-400">
                (~{(fareBreakdown.finalFareCVE / 110.265).toFixed(2)} € EUR)
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: Confirm and Dispatch */}
        <div className="mt-5 flex items-center gap-3">
          <button
            id="btn-back-modal"
            onClick={onClose}
            className="w-1/3 py-3 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-sm font-semibold transition text-center"
          >
            Voltar
          </button>
          <button
            id="btn-confirm-dispatch"
            onClick={onConfirm}
            className="w-2/3 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-sm font-extrabold shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            <span>{t.confirm_trip || 'Confirmar Viagem'}</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
