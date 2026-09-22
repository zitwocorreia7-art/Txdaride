import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Check,
  ChevronRight,
  Clock,
  Crown,
  Gift,
  History,
  Info,
  Percent,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import {
  getNextTierInfo,
  LOYALTY_REWARDS,
  LOYALTY_TIER_CONFIGS,
} from '../../data/loyaltyRewards';
import { ActiveLoyaltyReward, LoyaltyProfile, LoyaltyReward, LoyaltyTier } from '../../types';

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  loyaltyProfile: LoyaltyProfile;
  activeLoyaltyReward?: ActiveLoyaltyReward | null;
  hasPriorityBooking?: boolean;
  onRedeemReward: (reward: LoyaltyReward) => void;
  onRemoveActiveReward: () => void;
  t: Record<string, string>;
}

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({
  isOpen,
  onClose,
  loyaltyProfile,
  activeLoyaltyReward,
  hasPriorityBooking,
  onRedeemReward,
  onRemoveActiveReward,
  t,
}) => {
  const [activeTab, setActiveTab] = useState<'rewards' | 'tiers' | 'history'>('rewards');

  if (!isOpen) return null;

  const currentTierConfig = LOYALTY_TIER_CONFIGS[loyaltyProfile.tier];
  const { nextTier, pointsNeeded, progressPercent } = getNextTierInfo(loyaltyProfile.lifetimePoints);

  const handleRedeem = (reward: LoyaltyReward) => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899'],
    });
    onRedeemReward(reward);
  };

  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Gift':
        return <Gift className="w-5 h-5 text-emerald-400" />;
      case 'Percent':
        return <Percent className="w-5 h-5 text-blue-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      default:
        return <Tag className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div
      id="loyalty-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="loyalty-modal"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Txada <span className="text-amber-400">Club</span>
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Pontos 🇨🇻
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ganhe pontos em cada viagem e troque por descontos e prioridade VIP
              </p>
            </div>
          </div>
          <button
            id="close-loyalty-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Tier Card & Balance */}
        <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-850 border border-slate-700/80 relative overflow-hidden shadow-lg">
          {/* Subtle background decoration */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border bg-slate-900/60 ${currentTierConfig.textColor} ${currentTierConfig.borderColor}`}>
                  {currentTierConfig.badge}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Multiplicador: <strong className="text-white">{currentTierConfig.multiplier}x Pontos</strong>
                </span>
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                  {loyaltyProfile.points}
                </span>
                <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Pontos Disponíveis
                </span>
              </div>

              <div className="mt-1 text-xs text-slate-400 flex items-center gap-3">
                <span>Total Acumulado: <strong className="text-slate-200">{loyaltyProfile.lifetimePoints} pts</strong></span>
                <span>•</span>
                <span>Viagens Concluídas: <strong className="text-slate-200">{loyaltyProfile.completedRides}</strong></span>
              </div>
            </div>

            {/* Next Tier Progress Widget */}
            <div className="sm:max-w-[220px] w-full bg-slate-900/70 p-3 rounded-xl border border-slate-700/50">
              {nextTier ? (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">Próximo: {nextTier.badge}</span>
                    <span className="font-bold text-amber-400 font-mono">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                    Faltam <strong>{pointsNeeded} pts</strong> para subir de nível
                  </p>
                </div>
              ) : (
                <div className="text-center py-1">
                  <div className="text-xs font-bold text-cyan-300 flex items-center justify-center gap-1">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Nível Máximo Atingido!</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Despacho Prioritário VIP Grátis Permanente
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Applied Reward Banner if any */}
        {(activeLoyaltyReward || hasPriorityBooking) && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Recompensa Ativa para a Próxima Viagem:
                </span>
                <span className="text-[11px] text-amber-300 font-medium">
                  {hasPriorityBooking
                    ? '👑 Despacho Prioritário VIP Ativado'
                    : activeLoyaltyReward?.title}
                </span>
              </div>
            </div>
            <button
              id="btn-remove-active-loyalty"
              type="button"
              onClick={onRemoveActiveReward}
              className="text-[11px] font-bold text-slate-400 hover:text-rose-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 transition"
            >
              Remover
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mt-4 flex border-b border-slate-800 text-xs font-bold">
          <button
            id="tab-loyalty-rewards"
            type="button"
            onClick={() => setActiveTab('rewards')}
            className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'rewards'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Resgatar Recompensas ({LOYALTY_REWARDS.length})</span>
          </button>
          <button
            id="tab-loyalty-tiers"
            type="button"
            onClick={() => setActiveTab('tiers')}
            className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'tiers'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Níveis & Como Ganhar</span>
          </button>
          <button
            id="tab-loyalty-history"
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico ({loyaltyProfile.history.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 max-h-[380px] overflow-y-auto pr-1">
          {/* TAB 1: REWARDS CATALOG */}
          {activeTab === 'rewards' && (
            <div className="space-y-3">
              {LOYALTY_REWARDS.map((reward) => {
                const canAfford = loyaltyProfile.points >= reward.pointsCost;
                const isCurrentlyActive =
                  (reward.type === 'priority_booking' && hasPriorityBooking) ||
                  (activeLoyaltyReward && activeLoyaltyReward.rewardId === reward.id);

                return (
                  <div
                    key={reward.id}
                    id={`reward-card-${reward.id}`}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrentlyActive
                        ? 'bg-amber-500/10 border-amber-400/60 shadow-md'
                        : canAfford
                        ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-amber-400/40'
                        : 'bg-slate-850/60 border-slate-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isCurrentlyActive
                            ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                            : 'bg-slate-750 border-slate-700 text-slate-300'
                        }`}
                      >
                        {getRewardIcon(reward.icon)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-white">{reward.title}</h4>
                          {reward.badge && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                              {reward.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {reward.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50">
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-black font-mono text-amber-400">
                          {reward.pointsCost} <span className="text-xs text-slate-300">pts</span>
                        </div>
                        {!canAfford && (
                          <span className="text-[10px] text-rose-400 font-medium">
                            Faltam {reward.pointsCost - loyaltyProfile.points} pts
                          </span>
                        )}
                      </div>

                      {isCurrentlyActive ? (
                        <button
                          type="button"
                          onClick={onRemoveActiveReward}
                          className="px-3.5 py-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Ativo</span>
                        </button>
                      ) : (
                        <button
                          id={`btn-redeem-${reward.id}`}
                          type="button"
                          disabled={!canAfford}
                          onClick={() => handleRedeem(reward)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            canAfford
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 font-black cursor-pointer'
                              : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Resgatar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: TIERS & HOW TO EARN */}
          {activeTab === 'tiers' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/60 text-xs leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-blue-300 mb-1">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>Regras Simples de Acumulação</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>1 Ponto por cada 20 CVE</strong> em viagens concluídas.</li>
                  <li><strong>+10 Pontos de bónus</strong> sempre que submeter uma avaliação do motorista.</li>
                  <li><strong>Suba de nível</strong> automaticamente com o total de pontos acumulados ao longo do tempo.</li>
                  <li>Os pontos não expiram enquanto mantiver a sua conta ativa!</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(LOYALTY_TIER_CONFIGS).map((tier) => {
                  const isCurrent = tier.id === loyaltyProfile.tier;
                  return (
                    <div
                      key={tier.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        isCurrent
                          ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400/40'
                          : 'bg-slate-800/60 border-slate-700/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-black ${tier.textColor}`}>
                          {tier.badge}
                        </span>
                        {isCurrent ? (
                          <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md uppercase">
                            Seu Nível Atual
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {tier.minPoints}+ pts
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-white font-bold mb-2">
                        Multiplicador: <span className="text-amber-400">{tier.multiplier}x Pontos</span>
                      </div>

                      <ul className="space-y-1">
                        {tier.perks.map((perk, i) => (
                          <li key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div>
              {loyaltyProfile.history.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Ainda não tem histórico de pontos. Complete a sua primeira viagem para começar a ganhar!
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {loyaltyProfile.history.map((tx) => (
                    <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.type === 'earned'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {tx.type === 'earned' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <Gift className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{tx.description}</p>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(tx.timestamp).toLocaleDateString('pt-CV', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-mono font-black text-sm ${
                            tx.type === 'earned' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {tx.type === 'earned' ? `+${tx.points}` : `-${tx.points}`} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info & close */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Programa oficial Txada Club Cabo Verde</span>
          </div>

          <button
            id="btn-close-loyalty"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
