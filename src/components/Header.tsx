import React from 'react';
import { Bell, Car, Compass, Crown, Globe, MapPin, Star, UserCheck, Wifi, WifiOff } from 'lucide-react';
import { CAPE_VERDE_ISLANDS } from '../data/capeVerdeData';
import { IslandId, Language, LoyaltyTier } from '../types';

interface HeaderProps {
  currentIsland: IslandId;
  onSelectIsland: (island: IslandId) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  isDriverMode: boolean;
  onToggleDriverMode: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  loyaltyPoints?: number;
  loyaltyTier?: LoyaltyTier;
  onOpenLoyaltyModal?: () => void;
  t: Record<string, string>;
}

export const Header: React.FC<HeaderProps> = ({
  currentIsland,
  onSelectIsland,
  language,
  onSelectLanguage,
  isDriverMode,
  onToggleDriverMode,
  isOffline,
  onToggleOffline,
  unreadNotificationsCount,
  onOpenNotifications,
  loyaltyPoints = 0,
  loyaltyTier = 'bronze',
  onOpenLoyaltyModal,
  t,
}) => {
  const activeIslandMeta = CAPE_VERDE_ISLANDS.find((i) => i.id === currentIsland) || CAPE_VERDE_ISLANDS[0];

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Island info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-400 flex items-center justify-center shadow-lg shadow-blue-900/30 text-white font-bold text-lg">
              <Car className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base md:text-lg text-white tracking-tight">
                  Txada<span className="text-amber-400">Ride</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded">
                  CV 🇨🇻
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Island selector dropdown */}
          <div className="relative">
            <select
              id="island-selector"
              value={currentIsland}
              onChange={(e) => onSelectIsland(e.target.value as IslandId)}
              className="appearance-none bg-slate-800/90 hover:bg-slate-750 text-slate-200 text-xs font-medium pl-7 pr-7 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 transition cursor-pointer"
            >
              {CAPE_VERDE_ISLANDS.map((island) => (
                <option key={island.id} value={island.id} className="bg-slate-900 text-white">
                  {island.name} ({island.capital})
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-amber-400 absolute left-2 top-2.5 pointer-events-none" />
            <Compass className="w-3 h-3 text-slate-400 absolute right-2 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Offline simulator toggle button */}
          <button
            id="offline-toggle-btn"
            onClick={onToggleOffline}
            title={isOffline ? 'Online restore' : 'Test offline mode (low signal)'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden md:inline font-mono">Offline / Serra</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Online 4G</span>
              </>
            )}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <select
              id="language-selector"
              value={language}
              onChange={(e) => onSelectLanguage(e.target.value as Language)}
              className="appearance-none bg-slate-800 text-slate-200 text-xs font-medium pl-6 pr-6 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 transition cursor-pointer"
            >
              <option value="kriolu">🇨🇻 Kriolu</option>
              <option value="pt">🇵🇹 Português</option>
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
            </select>
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-1.5 top-2.5 pointer-events-none" />
          </div>

          {/* Txada Club Loyalty Points Chip */}
          <button
            id="header-loyalty-btn"
            onClick={onOpenLoyaltyModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 transition shadow-sm group cursor-pointer"
            title="Txada Club • Ver Pontos & Recompensas"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-mono font-bold text-xs">{loyaltyPoints}</span>
            <span className="text-[10px] uppercase font-bold text-amber-200/80 hidden md:inline">pts</span>
          </button>

          {/* Notifications Button */}
          <button
            id="notifications-btn"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition"
            aria-label="Push Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Mode Switcher: Rider vs Driver */}
          <button
            id="mode-switch-btn"
            onClick={onToggleDriverMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              isDriverMode
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {isDriverMode ? (
              <>
                <Car className="w-4 h-4" />
                <span>{t.switch_to_rider}</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>{t.switch_to_driver}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
