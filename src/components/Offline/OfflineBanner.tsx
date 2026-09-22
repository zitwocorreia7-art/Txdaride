import React, { useState } from 'react';
import { Copy, MessageSquare, PhoneCall, RefreshCw, Send, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
import { IslandId, LocationPoint } from '../../types';

interface OfflineBannerProps {
  isOffline: boolean;
  currentIsland: IslandId;
  pickupLocation: LocationPoint;
  dropoffLocation: LocationPoint;
  estimatedFareCVE: number;
  t: Record<string, string>;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  currentIsland,
  pickupLocation,
  dropoffLocation,
  estimatedFareCVE,
  t,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOffline) return null;

  // Format dispatch SMS for Cape Verde Telcos (Unitel T+ / CVMóvel)
  const smsBody = `TXADA ${currentIsland.toUpperCase()} DE: ${pickupLocation.name.split('(')[0].trim()} PARA: ${dropoffLocation.name.split('(')[0].trim()} TAR: ${estimatedFareCVE}CVE`;
  const dispatchHotline = '+238 800 7433';

  const handleCopySMS = () => {
    navigator.clipboard.writeText(smsBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="offline-manager-banner" className="bg-amber-500/15 border border-amber-500/40 rounded-3xl p-4 text-slate-100 shadow-xl my-3 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <WifiOff className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-amber-300">
                {t.offline_mode || 'Modo Offline Ativo (Rede Móvel Limitada)'}
              </h4>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                Cache Local Ativa
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {t.offline_notice || 'Zona sem cobertura de dados na ilha. Solicite despacho por SMS ou Chamada direta!'}
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          {/* Native SMS Trigger */}
          <a
            id="btn-sms-dispatch"
            href={`sms:${dispatchHotline}?body=${encodeURIComponent(smsBody)}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Enviar SMS de Despacho</span>
          </a>

          {/* Direct Phone Call */}
          <a
            id="btn-call-hotline"
            href={`tel:${dispatchHotline.replace(/\s/g, '')}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>{dispatchHotline}</span>
          </a>
        </div>
      </div>

      {/* Generated Offline SMS Payload preview */}
      <div className="mt-3 pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Código de Despacho Offline:</span>
          <code className="bg-slate-950 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-[11px]">
            {smsBody}
          </code>
        </div>

        <button
          onClick={handleCopySMS}
          className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition"
        >
          <Copy className="w-3 h-3" />
          <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
        </button>
      </div>
    </div>
  );
};
