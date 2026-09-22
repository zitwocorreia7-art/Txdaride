import { CV_ZONES } from '../data/capeVerdeData';
import { ActiveLoyaltyReward, FareBreakdown, LocationPoint, PromoCode, RideTier } from '../types';

export interface DynamicPricingConfig {
  timeOfDayHours: number; // 0 - 23.99
  demandLevel: 'normal' | 'high' | 'peak' | 'extreme'; // Simulation or real
  zoneSurgeOverride?: number;
  appliedPromo?: PromoCode | null;
  appliedLoyaltyReward?: ActiveLoyaltyReward | null;
}

export interface TimeOfDayProfile {
  label: {
    kriolu: string;
    pt: string;
    en: string;
    fr: string;
  };
  multiplier: number;
  period: 'morning_rush' | 'day_standard' | 'evening_rush' | 'late_night' | 'early_dawn';
}

export function getTimeOfDayProfile(hours: number): TimeOfDayProfile {
  // Morning commute (07:00 - 09:30)
  if (hours >= 7 && hours < 9.5) {
    return {
      label: {
        kriolu: 'Hora di ponta di manhan',
        pt: 'Hora de ponta matinal',
        en: 'Morning rush hour',
        fr: 'Heure de pointe du matin',
      },
      multiplier: 1.25,
      period: 'morning_rush',
    };
  }

  // Evening commute (16:30 - 19:30)
  if (hours >= 16.5 && hours < 19.5) {
    return {
      label: {
        kriolu: 'Hora di ponta di tardi',
        pt: 'Hora de ponta de regresso',
        en: 'Evening rush hour',
        fr: 'Heure de pointe du soir',
      },
      multiplier: 1.3,
      period: 'evening_rush',
    };
  }

  // Late night (23:00 - 04:30)
  if (hours >= 23 || hours < 4.5) {
    return {
      label: {
        kriolu: 'Tarifa noturnu (madrugada)',
        pt: 'Tarifa noturna / Madrugada',
        en: 'Late night hours',
        fr: 'Tarif de nuit / Minuit',
      },
      multiplier: 1.35,
      period: 'late_night',
    };
  }

  // Early dawn (04:30 - 07:00)
  if (hours >= 4.5 && hours < 7) {
    return {
      label: {
        kriolu: 'Madrugada sertu',
        pt: 'Amanhecer antecipado',
        en: 'Early morning dawn',
        fr: 'Aube matinale',
      },
      multiplier: 1.1,
      period: 'early_dawn',
    };
  }

  // Standard Daytime
  return {
    label: {
      kriolu: 'Tarifa normal di dia',
      pt: 'Tarifa padrão de dia',
      en: 'Standard daytime rate',
      fr: 'Tarif standard journée',
    },
    multiplier: 1.0,
    period: 'day_standard',
  };
}

export function calculateDistanceKm(from: LocationPoint, to: LocationPoint): number {
  // Calculate relative map euclidean distance scaled to realistic Cape Verde distances
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  const rawDist = Math.sqrt(dx * dx + dy * dy);

  // Scaled: 100 map units ~ 2.5 km (so city trips are 3-8 km, intercity like Assomada are 25-35 km)
  let km = (rawDist / 100) * 2.4;
  if (km < 1.2) km = 1.2;
  return Math.round(km * 10) / 10;
}

export function calculateDynamicFare(
  from: LocationPoint,
  to: LocationPoint,
  tier: RideTier,
  config: DynamicPricingConfig
): FareBreakdown {
  const distanceKm = calculateDistanceKm(from, to);
  // Estimate time: ~30 km/h average city speed in CV
  const estimatedMinutes = Math.max(4, Math.round((distanceKm / 28) * 60));

  // 1. Tier Base Rates (in Cape Verdean Escudo CVE)
  let baseFareCVE = 200; // Standard e.g. 200 CVE (~$1.90 USD / €1.80 EUR)
  let ratePerKm = 65;
  let ratePerMin = 10;

  if (tier === 'comfort') {
    baseFareCVE = 320;
    ratePerKm = 95;
    ratePerMin = 15;
  } else if (tier === 'hiace') {
    baseFareCVE = 380;
    ratePerKm = 80;
    ratePerMin = 12;
  }

  const distanceFareCVE = Math.round(distanceKm * ratePerKm);
  const timeFareCVE = Math.round(estimatedMinutes * ratePerMin);
  const subtotalCVE = baseFareCVE + distanceFareCVE + timeFareCVE;

  // 2. Time of Day Adjustment
  const timeProfile = getTimeOfDayProfile(config.timeOfDayHours);
  const timeOfDayMultiplier = timeProfile.multiplier;

  // 3. Geographic Zone Surge
  const pickupZone = CV_ZONES.find((z) => z.id === from.zoneId);
  const dropoffZone = CV_ZONES.find((z) => z.id === to.zoneId);

  // Take the highest zone surge factor between origin and destination
  const originZoneSurge = pickupZone ? pickupZone.surgeMultiplier : 1.0;
  const destZoneSurge = dropoffZone ? dropoffZone.surgeMultiplier : 1.0;
  const rawZoneSurge = Math.max(originZoneSurge, destZoneSurge * 0.85);

  const zoneSurgeMultiplier = config.zoneSurgeOverride ?? rawZoneSurge;
  const zoneName = pickupZone?.name || 'Zona Padrão';

  // 4. Real-time Demand Surge
  let demandMultiplier = 1.0;
  if (config.demandLevel === 'high') demandMultiplier = 1.25;
  if (config.demandLevel === 'peak') demandMultiplier = 1.5;
  if (config.demandLevel === 'extreme') demandMultiplier = 1.85;

  // Combined Surge Multiplier (Clamped for rider protection between 1.0x and 2.5x)
  const combinedSurge = Number(
    Math.min(2.5, Math.max(1.0, 1.0 + (timeOfDayMultiplier - 1.0) + (zoneSurgeMultiplier - 1.0) + (demandMultiplier - 1.0))).toFixed(2)
  );

  const preDiscountFare = Math.round(subtotalCVE * combinedSurge);
  const totalSurgeAmountCVE = preDiscountFare - subtotalCVE;

  // 5. Discount Calculations (Promo Code & Loyalty Points Voucher)
  let promoDiscountCVE = 0;
  if (config.appliedPromo) {
    if (config.appliedPromo.discountPercent) {
      promoDiscountCVE = Math.round(preDiscountFare * (config.appliedPromo.discountPercent / 100));
    } else if (config.appliedPromo.discountAmountCVE) {
      promoDiscountCVE = config.appliedPromo.discountAmountCVE;
    }
  }

  let loyaltyDiscountCVE = 0;
  if (config.appliedLoyaltyReward) {
    if (config.appliedLoyaltyReward.type === 'discount_fixed' && config.appliedLoyaltyReward.discountCVE) {
      loyaltyDiscountCVE = config.appliedLoyaltyReward.discountCVE;
    } else if (config.appliedLoyaltyReward.type === 'discount_percent' && config.appliedLoyaltyReward.discountPercent) {
      loyaltyDiscountCVE = Math.round(preDiscountFare * (config.appliedLoyaltyReward.discountPercent / 100));
    }
  }

  const totalDiscountCVE = promoDiscountCVE + loyaltyDiscountCVE;
  // Safeguard: Ensure final fare never drops below 100 CVE
  const maxAllowableDiscount = Math.max(0, preDiscountFare - 100);
  const actualDiscountApplied = Math.min(totalDiscountCVE, maxAllowableDiscount);

  // Split proportional if clamped
  const scale = totalDiscountCVE > 0 ? actualDiscountApplied / totalDiscountCVE : 1;
  const finalPromoDiscount = Math.round(promoDiscountCVE * scale);
  const finalLoyaltyDiscount = actualDiscountApplied - finalPromoDiscount;

  const finalFareCVE = Math.max(100, preDiscountFare - actualDiscountApplied);

  // Driver Payout Economics:
  // Base split: Driver gets 85% of standard fare
  // SURGE BONUS: Driver gets 100% of the surge premium!
  // Note: Platform subsidizes rider promotional discounts and loyalty vouchers, driver earnings remain intact!
  const driverBaseEarningsCVE = Math.round(subtotalCVE * 0.85);
  const driverSurgeBonusCVE = totalSurgeAmountCVE; // 100% surge goes to driver
  const driverTotalPayoutCVE = driverBaseEarningsCVE + driverSurgeBonusCVE;

  return {
    baseFareCVE,
    distanceFareCVE,
    timeFareCVE,
    subtotalCVE,
    timeOfDayMultiplier,
    timeOfDayLabel: timeProfile.label.pt,
    zoneSurgeMultiplier,
    zoneName,
    demandSurgeMultiplier: demandMultiplier,
    totalSurgeMultiplier: combinedSurge,
    totalSurgeAmountCVE,
    discountCVE: finalPromoDiscount > 0 ? finalPromoDiscount : undefined,
    appliedPromoCode: config.appliedPromo ? config.appliedPromo.code : undefined,
    promoDescription: config.appliedPromo ? config.appliedPromo.description : undefined,
    loyaltyDiscountCVE: finalLoyaltyDiscount > 0 ? finalLoyaltyDiscount : undefined,
    appliedLoyaltyRewardTitle: config.appliedLoyaltyReward?.title,
    originalFareCVE: actualDiscountApplied > 0 ? preDiscountFare : undefined,
    finalFareCVE,
    driverBaseEarningsCVE,
    driverSurgeBonusCVE,
    driverTotalPayoutCVE,
    distanceKm,
    estimatedMinutes,
  };
}
