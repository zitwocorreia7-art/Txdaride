import { LoyaltyProfile, LoyaltyReward, LoyaltyTier } from '../types';

export interface TierConfig {
  id: LoyaltyTier;
  name: string;
  minPoints: number;
  multiplier: number;
  badge: string;
  gradient: string;
  textColor: string;
  borderColor: string;
  perks: string[];
}

export const LOYALTY_TIER_CONFIGS: Record<LoyaltyTier, TierConfig> = {
  bronze: {
    id: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    multiplier: 1.0,
    badge: '🥉 Bronze',
    gradient: 'from-amber-700 via-amber-800 to-amber-950',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-700/60',
    perks: [
      '1 Ponto por cada 20 CVE gastos',
      'Acesso ao catálogo de recompensas Txada',
      'Bónus de +10 pts ao avaliar motoristas',
    ],
  },
  silver: {
    id: 'silver',
    name: 'Prata',
    minPoints: 200,
    multiplier: 1.25,
    badge: '🥈 Prata',
    gradient: 'from-slate-400 via-slate-500 to-slate-800',
    textColor: 'text-slate-300',
    borderColor: 'border-slate-400/60',
    perks: [
      '+25% de pontos bónus em todas as viagens',
      'Acesso antecipado a campanhas de época',
      'Descontos especiais de fidelidade',
    ],
  },
  gold: {
    id: 'gold',
    name: 'Ouro',
    minPoints: 500,
    multiplier: 1.5,
    badge: '🥇 Ouro',
    gradient: 'from-amber-400 via-amber-500 to-amber-700',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-400/70',
    perks: [
      '+50% de pontos bónus por viagem',
      'Despacho com prioridade acelerada',
      'Linha de apoio dedicada via WhatsApp',
    ],
  },
  diamond: {
    id: 'diamond',
    name: 'Diamante VIP',
    minPoints: 1000,
    multiplier: 2.0,
    badge: '💎 Diamante VIP',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-700',
    textColor: 'text-cyan-300',
    borderColor: 'border-cyan-400/80',
    perks: [
      'Dobro de pontos (2x) em cada viagem',
      'Despacho Prioritário VIP incluído (gratuito)',
      'Garantia de motoristas com classificação 4.9★+',
      'Sem taxa de cancelamento',
    ],
  },
};

export const LOYALTY_REWARDS: LoyaltyReward[] = [
  {
    id: 'rew_disc_100',
    title: 'Desconto 100 CVE',
    description: 'Abate imediato de 100 CVE na tarifa final da sua viagem.',
    pointsCost: 50,
    type: 'discount_fixed',
    discountCVE: 100,
    icon: 'Tag',
    badge: 'Popular',
  },
  {
    id: 'rew_priority_vip',
    title: 'Despacho Prioritário VIP',
    description: 'Fila prioritária inteligente com alocação instantânea dos motoristas com melhor avaliação (4.9★+).',
    pointsCost: 75,
    type: 'priority_booking',
    icon: 'Zap',
    badge: 'Fila Rápida',
  },
  {
    id: 'rew_disc_250',
    title: 'Desconto 250 CVE',
    description: 'Desconto substancial de 250 CVE válido para qualquer trajeto.',
    pointsCost: 100,
    type: 'discount_fixed',
    discountCVE: 250,
    icon: 'Gift',
    badge: 'Recomendado',
  },
  {
    id: 'rew_disc_20pct',
    title: '20% de Desconto na Viagem',
    description: 'Desconto percentual de 20% no valor total do percurso.',
    pointsCost: 120,
    type: 'discount_percent',
    discountPercent: 20,
    icon: 'Percent',
    badge: 'Maior Poupança',
  },
  {
    id: 'rew_disc_500',
    title: 'Desconto 500 CVE',
    description: 'Super desconto de 500 CVE para viagens longas, aeroporto ou interurbanas.',
    pointsCost: 180,
    type: 'discount_fixed',
    discountCVE: 500,
    icon: 'Sparkles',
    badge: 'Super Prémio',
  },
];

export function getLoyaltyTier(lifetimePoints: number): LoyaltyTier {
  if (lifetimePoints >= 1000) return 'diamond';
  if (lifetimePoints >= 500) return 'gold';
  if (lifetimePoints >= 200) return 'silver';
  return 'bronze';
}

export function getNextTierInfo(lifetimePoints: number): {
  nextTier: TierConfig | null;
  pointsNeeded: number;
  progressPercent: number;
} {
  const currentTier = getLoyaltyTier(lifetimePoints);
  if (currentTier === 'diamond') {
    return {
      nextTier: null,
      pointsNeeded: 0,
      progressPercent: 100,
    };
  }

  const nextTierId: LoyaltyTier = currentTier === 'bronze' ? 'silver' : currentTier === 'silver' ? 'gold' : 'diamond';
  const nextTierConfig = LOYALTY_TIER_CONFIGS[nextTierId];
  const currentTierMin = LOYALTY_TIER_CONFIGS[currentTier].minPoints;
  const target = nextTierConfig.minPoints;

  const pointsInCurrentLevel = Math.max(0, lifetimePoints - currentTierMin);
  const totalLevelRange = target - currentTierMin;
  const progressPercent = Math.min(100, Math.round((pointsInCurrentLevel / totalLevelRange) * 100));
  const pointsNeeded = Math.max(0, target - lifetimePoints);

  return {
    nextTier: nextTierConfig,
    pointsNeeded,
    progressPercent,
  };
}

export function calculatePointsEarned(fareCVE: number, tier: LoyaltyTier): number {
  const config = LOYALTY_TIER_CONFIGS[tier];
  // 1 point per 20 CVE, with minimum 10 points per ride
  const basePoints = Math.max(10, Math.round(fareCVE / 20));
  return Math.round(basePoints * config.multiplier);
}

export const INITIAL_LOYALTY_PROFILE: LoyaltyProfile = {
  points: 130, // Welcome points
  lifetimePoints: 130,
  tier: 'bronze',
  completedRides: 3,
  history: [
    {
      id: 'tx_init_1',
      timestamp: Date.now() - 86400000 * 2,
      type: 'earned',
      points: 50,
      description: 'Bónus de Boas-vindas Txada Club 🇨🇻',
    },
    {
      id: 'tx_init_2',
      timestamp: Date.now() - 86400000,
      type: 'earned',
      points: 40,
      description: 'Viagem concluída: Plateau ➔ Aeroporto Nelson Mandela',
    },
    {
      id: 'tx_init_3',
      timestamp: Date.now() - 3600000 * 5,
      type: 'earned',
      points: 40,
      description: 'Viagem concluída: Palmarejo ➔ Quebra Canela',
    },
  ],
};
