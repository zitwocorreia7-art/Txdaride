import React, { useState } from 'react';
import { ArrowRight, Calendar, Check, ChevronDown, Clock, CreditCard, Crown, DollarSign, Flame, Gift, Info, MapPin, Navigation, Shield, Sparkles, Tag, Users, X, Zap } from 'lucide-react';
import { ActiveLoyaltyReward, FareBreakdown, LocationPoint, LoyaltyProfile, LoyaltyReward, PaymentMethodType, PromoCode, RideTier } from '../../types';
import { LOYALTY_TIER_CONFIGS } from '../../data/loyaltyRewards';
import { VALID_PROMO_CODES } from '../../data/capeVerdeData';

interface RideBookingCardProps {
  availableLocations: LocationPoint[];
  pickupLocation: LocationPoint;
  dropoffLocation: LocationPoint;
  onSelectPickup: (loc: LocationPoint) => void;
  onSelectDropoff: (loc: LocationPoint) => void;
  selectedTier: RideTier;
  onSelectTier: (tier: RideTier) => void;
  fareBreakdown: FareBreakdown;
  paymentMethod: PaymentMethodType;
  onSelectPaymentMethod: (method: PaymentMethodType) => void;
  appliedPromo?: PromoCode | null;
  onApplyPromo?: (promo: PromoCode | null) => void;
  loyaltyProfile: LoyaltyProfile;
  activeLoyaltyReward?: ActiveLoyaltyReward | null;
  hasPriorityBooking?: boolean;
  onOpenLoyaltyModal: () => void;
  onRemoveLoyaltyReward: () => void;
  onQuickRedeemReward?: (reward: LoyaltyReward) => void;
  onOpenPreTripModal: () => void;
  onOpenScheduleModal: () => void;
  scheduledTripsCount?: number;
  t: Record<string, string>;
}

export const RideBookingCard: React.FC<RideBookingCardProps> = ({
  availableLocations,
  pickupLocation,
  dropoffLocation,
  onSelectPickup,
  onSelectDropoff,
  selectedTier,
  onSelectTier,
  fareBreakdown,
  paymentMethod,
  onSelectPaymentMethod,
  appliedPromo,
  onApplyPromo,
  loyaltyProfile,
  activeLoyaltyReward,
  hasPriorityBooking,
  onOpenLoyaltyModal,
  onRemoveLoyaltyReward,
  onQuickRedeemReward,
  onOpenPreTripModal,
  onOpenScheduleModal,
  scheduledTripsCount = 0,
  t,
}) => {
  const [showFareDetails, setShowFareDetails] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [internalPromo, setInternalPromo] = useState<PromoCode | null>(null);

  const currentPromo = appliedPromo !== undefined ? appliedPromo : internalPromo;

  const handleApplyPromo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = promoInput.trim().toUpperCase();
    if (!cleanCode) {
      setPromoError('Por favor insira um código');
      return;
    }

    const matched = VALID_PROMO_CODES.find((p) => p.code.toUpperCase() === cleanCode);
    if (matched) {
      setPromoError('');
      if (onApplyPromo) {
        onApplyPromo(matched);
      } else {
        setInternalPromo(matched);
      }
      setPromoInput('');
    } else {
      setPromoError(t.invalid_promo || 'Código inválido. Tente MORABEZA20 ou TXADA100');
    }
  };

  const handleQuickApply = (code: string) => {
    const matched = VALID_PROMO_CODES.find((p) => p.code === code);
    if (matched) {
      setPromoError('');
      if (onApplyPromo) {
        onApplyPromo(matched);
      } else {
        setInternalPromo(matched);
      }
      setPromoInput('');
    }
  };

  const handleRemovePromo = () => {
    if (onApplyPromo) {
      onApplyPromo(null);
    } else {
      setInternalPromo(null);
    }
    setPromoError('');
  };

  const isSurge = fareBreakdown.totalSurgeMultiplier > 1.05;

  const tiers: { id: RideTier; name: string; desc: string; seats: number; icon: string; multiplierText: string }[] = [
    {
      id: 'standard',
      name: t.standard_ride || 'Txada Pop',
      desc: t.standard_desc || 'Boleia económica para o dia a dia',
      seats: 4,
      icon: '🚗',
      multiplierText: '1.0x Base',
    },
    {
      id: 'comfort',
      name: t.comfort_ride || 'Txada Confort',
      desc: t.comfort_desc || 'Carros modernos, AC e espaço extra',
      seats: 4,
      icon: '✨',
      multiplierText: '1.4x Conforto',
    },
    {
      id: 'hiace',
      name: t.hiace_ride || 'Hiace Coletivo',
      desc: t.hiace_desc || 'Van para grupos e muitas malas',
      seats: 12,
      icon: '🚐',
      multiplierText: 'Van de Grupo',
    },
  ];

  return (
    <div id="ride-booking-card" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-slate-100">
      {/* Pickup & Destination Selectors */}
      <div className="space-y-2.5">
        {/* Pickup */}
        <div className="relative flex items-center">
          <div className="absolute left-3 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
          <select
            id="pickup-select"
            value={pickupLocation.id}
            onChange={(e) => {
              const loc = availableLocations.find((l) => l.id === e.target.value);
              if (loc) onSelectPickup(loc);
            }}
            className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-100 text-xs font-semibold pl-9 pr-4 py-2.5 rounded-2xl border border-slate-700 focus:outline-none focus:border-amber-400 transition cursor-pointer"
          >
            {availableLocations.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                {t.pickup_point || 'Partida'}: {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div className="relative flex items-center">
          <div className="absolute left-3 w-3 h-3 rounded-full bg-rose-400 ring-4 ring-rose-500/20" />
          <select
            id="destination-select"
            value={dropoffLocation.id}
            onChange={(e) => {
              const loc = availableLocations.find((l) => l.id === e.target.value);
              if (loc) onSelectDropoff(loc);
            }}
            className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-100 text-xs font-semibold pl-9 pr-4 py-2.5 rounded-2xl border border-slate-700 focus:outline-none focus:border-amber-400 transition cursor-pointer"
          >
            {availableLocations.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                {t.destination_point || 'Destino'}: {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ride Tier Cards */}
      <div className="mt-4">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
          {t.select_tier || 'Escolha a Categoria'}:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.id;
            // Estimated price per tier for quick preview
            let estPrice = fareBreakdown.finalFareCVE;
            if (tier.id === 'comfort' && selectedTier !== 'comfort') {
              estPrice = Math.round(estPrice * 1.35);
            } else if (tier.id === 'hiace' && selectedTier !== 'hiace') {
              estPrice = Math.round(estPrice * 1.5);
            }

            return (
              <button
                key={tier.id}
                id={`tier-card-${tier.id}`}
                onClick={() => onSelectTier(tier.id)}
                className={`flex flex-col items-center justify-between p-2.5 rounded-2xl border transition text-center relative ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-400 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                    : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="text-xl mb-1">{tier.icon}</div>
                <div className="font-bold text-xs">{tier.name}</div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                  <Users className="w-3 h-3" />
                  <span>{tier.seats}</span>
                </div>
                <div className="font-mono font-bold text-xs text-amber-400 mt-1.5">
                  {isSelected ? fareBreakdown.finalFareCVE : estPrice} <span className="text-[9px]">CVE</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC SURGE PRICING CLEAR BANNER */}
      {isSurge ? (
        <div className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/15 to-transparent border border-amber-500/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>{t.surge_pricing_active || 'Tarifa Dinâmica Ativa'}</span>
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                    {fareBreakdown.totalSurgeMultiplier.toFixed(2)}x
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {t.high_demand_notice || 'Forte procura nesta zona'} ({fareBreakdown.zoneName})
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-amber-300">
                +{fareBreakdown.totalSurgeAmountCVE} CVE
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3.5 p-2 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs text-emerald-400">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Tarifa Padrão (Sem sobretaxa de procura no momento)</span>
          </div>
          <span className="font-mono text-slate-300 text-[11px]">1.00x</span>
        </div>
      )}

      {/* Collapsible Transparent Fare Breakdown */}
      <div className="mt-3 border-t border-slate-800 pt-2.5">
        <button
          id="btn-toggle-fare-breakdown"
          onClick={() => setShowFareDetails(!showFareDetails)}
          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white transition py-1"
        >
          <span className="flex items-center gap-1 font-medium">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            Transparência da Tarifa Dinâmica
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFareDetails ? 'rotate-180' : ''}`} />
        </button>

        {showFareDetails && (
          <div className="mt-2 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Tarifa Base:</span>
              <span className="font-mono">{fareBreakdown.baseFareCVE} CVE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Distância ({fareBreakdown.distanceKm} km):</span>
              <span className="font-mono">{fareBreakdown.distanceFareCVE} CVE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tempo estimado (~{fareBreakdown.estimatedMinutes} min):</span>
              <span className="font-mono">{fareBreakdown.timeFareCVE} CVE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fator Horário ({fareBreakdown.timeOfDayLabel}):</span>
              <span className="font-mono">{fareBreakdown.timeOfDayMultiplier.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Zona ({fareBreakdown.zoneName}):</span>
              <span className="font-mono">{fareBreakdown.zoneSurgeMultiplier.toFixed(2)}x</span>
            </div>
            {fareBreakdown.totalSurgeMultiplier > 1 && (
              <div className="flex justify-between text-amber-300 font-semibold pt-1 border-t border-slate-700">
                <span>Multiplicador Final de Procura:</span>
                <span className="font-mono">{fareBreakdown.totalSurgeMultiplier.toFixed(2)}x</span>
              </div>
            )}
            {fareBreakdown.discountCVE && fareBreakdown.discountCVE > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-700">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{t.promo_discount || 'Desconto Promocional'} ({fareBreakdown.appliedPromoCode}):</span>
                </span>
                <span className="font-mono">-{fareBreakdown.discountCVE} CVE</span>
              </div>
            )}
            {fareBreakdown.loyaltyDiscountCVE && fareBreakdown.loyaltyDiscountCVE > 0 && (
              <div className="flex justify-between text-amber-300 font-bold pt-1 border-t border-slate-700">
                <span className="flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Desconto Txada Club ({fareBreakdown.appliedLoyaltyRewardTitle || 'Pontos'}):</span>
                </span>
                <span className="font-mono">-{fareBreakdown.loyaltyDiscountCVE} CVE</span>
              </div>
            )}
            <div className="flex justify-between text-emerald-400 text-[11px] pt-1 border-t border-slate-700 font-medium">
              <span>Bónus Direto ao Motorista:</span>
              <span className="font-mono">+{fareBreakdown.driverSurgeBonusCVE} CVE</span>
            </div>
          </div>
        )}
      </div>

      {/* Txada Club Loyalty Points & Rewards Section */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Txada Club: <strong className="text-amber-400 font-mono text-xs">{loyaltyProfile.points} pts</strong>
            </span>
            <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {LOYALTY_TIER_CONFIGS[loyaltyProfile.tier].name}
            </span>
          </div>

          <button
            id="btn-open-loyalty-modal"
            type="button"
            onClick={onOpenLoyaltyModal}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
          >
            <span>Ver Recompensas</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Active Loyalty Reward or Priority Booking Banner */}
        {hasPriorityBooking || activeLoyaltyReward ? (
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                {hasPriorityBooking ? <Zap className="w-4 h-4 text-amber-400" /> : <Gift className="w-4 h-4 text-amber-400" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">
                    {hasPriorityBooking ? 'Despacho Prioritário VIP' : activeLoyaltyReward?.title}
                  </span>
                  <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-md uppercase">
                    Ativo
                  </span>
                </div>
                <p className="text-[10px] text-amber-300/90">
                  {hasPriorityBooking
                    ? 'Fila prioritária com motoristas 5★ alocados instantaneamente'
                    : fareBreakdown.loyaltyDiscountCVE
                    ? `Poupança de -${fareBreakdown.loyaltyDiscountCVE} CVE aplicada na tarifa`
                    : 'Recompensa de fidelidade ativa'}
                </p>
              </div>
            </div>
            <button
              id="btn-remove-loyalty-reward"
              type="button"
              onClick={onRemoveLoyaltyReward}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Remover Recompensa de Fidelidade"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="bg-slate-800/50 p-2.5 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-300 leading-tight">
              Troque os seus pontos por descontos imediatos ou prioridade VIP.
            </div>
            {loyaltyProfile.points >= 50 && (
              <button
                id="btn-quick-redeem-100"
                type="button"
                onClick={onOpenLoyaltyModal}
                className="shrink-0 px-2.5 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 border border-amber-400/40 text-[10px] font-black transition flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Resgatar</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Integrated Secure Payment Gateway Selector */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
          {t.payment_method || 'Pagamento Seguro'}:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {/* Vinti4 */}
          <button
            id="pay-vinti4-btn"
            onClick={() => onSelectPaymentMethod('vinti4')}
            className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
              paymentMethod === 'vinti4'
                ? 'bg-blue-600/20 border-blue-400 text-white'
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1 font-bold text-xs text-blue-400">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Vinti4</span>
            </div>
            <span className="text-[9px] text-slate-400">Débito CV</span>
          </button>

          {/* Cash CVE */}
          <button
            id="pay-cash-btn"
            onClick={() => onSelectPaymentMethod('cash_cve')}
            className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
              paymentMethod === 'cash_cve'
                ? 'bg-emerald-600/20 border-emerald-400 text-white'
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1 font-bold text-xs text-emerald-400">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Dinheiro</span>
            </div>
            <span className="text-[9px] text-slate-400">Em mão (CVE)</span>
          </button>

          {/* Visa / MC */}
          <button
            id="pay-card-btn"
            onClick={() => onSelectPaymentMethod('visa_mc')}
            className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
              paymentMethod === 'visa_mc'
                ? 'bg-purple-600/20 border-purple-400 text-white'
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1 font-bold text-xs text-purple-300">
              <Shield className="w-3.5 h-3.5" />
              <span>Cartão</span>
            </div>
            <span className="text-[9px] text-slate-400">Visa / MC</span>
          </button>
        </div>
      </div>

      {/* Promo Code Input & Discount Section */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="promo-code-input" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.promo_code || 'Código Promocional'}</span>
          </label>
          {currentPromo && (
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              {t.promo_discount || 'Desconto Ativo'}
            </span>
          )}
        </div>

        {currentPromo ? (
          <div id="applied-promo-badge" className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-xs text-white uppercase tracking-wider">
                    {currentPromo.code}
                  </span>
                  <span className="bg-emerald-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-md">
                    {currentPromo.discountPercent ? `-${currentPromo.discountPercent}%` : `-${currentPromo.discountAmountCVE} CVE`}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300/90">{currentPromo.description}</p>
              </div>
            </div>
            <button
              id="btn-remove-promo"
              type="button"
              onClick={handleRemovePromo}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title={t.remove_promo || 'Remover Código'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="promo-code-input"
                  type="text"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    if (promoError) setPromoError('');
                  }}
                  placeholder={t.promo_placeholder || 'Inserir código (ex: MORABEZA20)'}
                  className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-100 placeholder-slate-500 text-xs font-mono font-semibold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 uppercase tracking-wider transition"
                />
              </div>
              <button
                id="btn-apply-promo"
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-amber-400 text-xs font-bold transition shadow-sm"
              >
                {t.apply_promo || 'Aplicar'}
              </button>
            </form>

            {promoError && (
              <p id="promo-error-msg" className="text-[11px] text-rose-400 mt-1.5 font-medium animate-in fade-in duration-150">
                {promoError}
              </p>
            )}

            {/* Popular Suggested Promo Chips */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400">{t.try_codes || 'Experimente:'}</span>
              {VALID_PROMO_CODES.slice(0, 3).map((p) => (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => handleQuickApply(p.code)}
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-slate-700 transition"
                >
                  {p.code} ({p.discountPercent ? `-${p.discountPercent}%` : `-${p.discountAmountCVE} CVE`})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main CTA: View Plate & Driver Details Before Confirming OR Schedule for Later */}
      <div className="mt-5 space-y-2.5">
        {hasPriorityBooking && (
          <div className="p-2 rounded-xl bg-amber-400/20 border border-amber-400 text-amber-300 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Prioridade VIP Ativa: Despacho Imediato 5★</span>
            </span>
            <span className="text-[10px] uppercase font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
              VIP
            </span>
          </div>
        )}

        <button
          id="btn-inspect-plate-driver"
          onClick={onOpenPreTripModal}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-amber-400 text-[11px] font-mono-plate font-bold px-2 py-0.5 rounded">
              CV ST-••-••
            </span>
            <span className="text-slate-950">{t.plate_verification || 'Ver Matrícula & Motorista'}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              {fareBreakdown.originalFareCVE && (
                <div className="text-[10px] text-slate-800 font-mono line-through font-bold leading-tight">
                  {fareBreakdown.originalFareCVE} CVE
                </div>
              )}
              <div className="font-mono font-black text-base text-slate-950">
                {fareBreakdown.finalFareCVE} CVE
              </div>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Schedule Ride for Later button */}
        <button
          id="btn-schedule-ride"
          type="button"
          onClick={onOpenScheduleModal}
          className="w-full py-2.5 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-amber-400 border border-slate-700/80 hover:border-amber-400/40 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>{t.schedule_ride || 'Agendar Viagem para Mais Tarde'}</span>
          {scheduledTripsCount > 0 && (
            <span className="ml-1 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {scheduledTripsCount}
            </span>
          )}
        </button>

        <p className="text-center text-[10px] text-slate-400 mt-1">
          {t.plate_verification_hint || 'Veja a matrícula, modelo e avaliação do motorista antes do pedido.'}
        </p>
      </div>
    </div>
  );
};
