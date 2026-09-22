import React from 'react';
import { Bell, CheckCheck, Flame, Info, Sparkles, Trash2, Volume2, VolumeX, X } from 'lucide-react';
import { PushNotification } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onClearAll: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRequestBrowserPermission: () => void;
  browserPermission: NotificationPermission | 'default';
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  soundEnabled,
  onToggleSound,
  onRequestBrowserPermission,
  browserPermission,
}) => {
  if (!isOpen) return null;

  return (
    <div id="notification-drawer-overlay" className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div
        id="notification-drawer"
        className="w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full p-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-white text-base">Notificações em Tempo Real</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Push Permission & Sound settings */}
        <div className="mt-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Som de Alerta (Sintetizador):</span>
            <button
              id="btn-toggle-sound"
              onClick={onToggleSound}
              className={`p-1.5 rounded-lg border transition ${
                soundEnabled
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {browserPermission !== 'granted' && (
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Notificações do Navegador:</span>
              <button
                id="btn-request-browser-notif"
                onClick={onRequestBrowserPermission}
                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 transition"
              >
                Ativar Push
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Bell className="w-8 h-8 mx-auto opacity-30 mb-2" />
              Nenhuma notificação recente
            </div>
          ) : (
            notifications.map((notif) => {
              const isSurge = notif.type === 'surge';
              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-2xl border text-xs transition ${
                    isSurge
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                      : 'bg-slate-800/40 border-slate-700/70 text-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      {isSurge ? (
                        <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      <span>{notif.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">{notif.message}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {notifications.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Notificações</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
