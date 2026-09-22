import React, { useState } from 'react';
import { Car, Compass, Flame, Layers, Locate, MapPin, Maximize2, Minimize2, Navigation, ShieldCheck } from 'lucide-react';
import { CV_ZONES } from '../../data/capeVerdeData';
import { ActiveTrip, Driver, IslandId, LocationPoint, Zone } from '../../types';

interface CapeVerdeMapProps {
  islandId: IslandId;
  pickupLocation: LocationPoint | null;
  dropoffLocation: LocationPoint | null;
  activeTrip: ActiveTrip | null;
  nearbyDrivers: Driver[];
  isDispatching: boolean;
  showSurgeHeatmap: boolean;
  onToggleSurgeHeatmap: () => void;
  onSelectMapLocation?: (location: LocationPoint) => void;
  availableLocations: LocationPoint[];
  currentSurgeMultiplier: number;
}

export const CapeVerdeMap: React.FC<CapeVerdeMapProps> = ({
  islandId,
  pickupLocation,
  dropoffLocation,
  activeTrip,
  nearbyDrivers,
  isDispatching,
  showSurgeHeatmap,
  onToggleSurgeHeatmap,
  onSelectMapLocation,
  availableLocations,
  currentSurgeMultiplier,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [is3DView, setIs3DView] = useState<boolean>(false);
  const [userGpsActive, setUserGpsActive] = useState<boolean>(false);

  // Filter zones for currently selected island
  const islandZones = CV_ZONES.filter((z) => z.islandId === islandId);
  const islandLocations = availableLocations.filter((l) => l.islandId === islandId);

  // Handle GPS location request using real browser geolocation API
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      setUserGpsActive(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // If within Cape Verde (Lat 14-17, Lng -25 to -22) or simulated
          console.log('GPS located:', pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation fallback to city center:', err.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  // Calculate route path points between pickup and dropoff
  const renderRoutePath = () => {
    if (!pickupLocation || !dropoffLocation) return null;

    // Generate smooth bezier curve representing road navigation
    const p1 = pickupLocation;
    const p2 = dropoffLocation;
    const midX = (p1.x + p2.x) / 2 + (p2.y - p1.y) * 0.15;
    const midY = (p1.y + p2.y) / 2 - (p2.x - p1.x) * 0.15;

    const pathData = `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`;

    return (
      <g id="route-layer">
        {/* Glow backdrop */}
        <path
          d={pathData}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="8"
          strokeLinecap="round"
          strokeOpacity="0.25"
        />
        {/* Road line */}
        <path
          d={pathData}
          fill="none"
          stroke="#0284c7"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Animated moving dash */}
        <path
          d={pathData}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="3"
          strokeDasharray="8 8"
          className="animate-[dash_1.5s_linear_infinite]"
        />
      </g>
    );
  };

  return (
    <div
      id="cape-verde-map-container"
      className="relative w-full h-[360px] md:h-[480px] bg-slate-950 overflow-hidden rounded-2xl border border-slate-800 shadow-2xl select-none"
      style={{
        perspective: is3DView ? '1000px' : 'none',
      }}
    >
      {/* SVG Map Canvas */}
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full object-cover transition-transform duration-500 ease-out"
        style={{
          transform: `${is3DView ? 'rotateX(25deg) scale(1.05)' : ''} scale(${zoomLevel})`,
          transformOrigin: '50% 50%',
        }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#08182b" />
            <stop offset="100%" stopColor="#040c17" />
          </linearGradient>

          <linearGradient id="islandLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#172233" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Surge Heatmap Gradients */}
          <radialGradient id="surgeExtremeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.65" />
            <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="surgeHighGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="radarScanGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#0284c7" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ocean Background */}
        <rect width="1000" height="1000" fill="url(#oceanGrad)" />

        {/* Stylized Island Landmass Shape based on Island */}
        {islandId === 'santiago' && (
          <g id="santiago-island-shape">
            {/* Santiago Island silhouette */}
            <path
              d="M 220 80 Q 320 60 480 140 T 780 280 Q 860 380 790 560 T 640 760 Q 520 820 400 800 T 260 720 Q 140 600 160 380 T 220 80 Z"
              fill="url(#islandLandGrad)"
              stroke="#334155"
              strokeWidth="2.5"
            />
            {/* Coastal roads & main highways (Praia - Assomada - Tarrafal) */}
            <path
              d="M 740 320 Q 640 400 520 480 L 440 520 L 340 640 Q 400 730 460 720"
              fill="none"
              stroke="#334155"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 520 480 Q 420 380 260 220 Q 220 160 210 110"
              fill="none"
              stroke="#334155"
              strokeWidth="3.5"
              strokeDasharray="6 4"
            />
            {/* Mountain Ridge (Serra Malagueta) texture */}
            <path
              d="M 280 240 Q 320 280 300 340 Q 270 380 310 420"
              fill="none"
              stroke="#1e293b"
              strokeWidth="12"
              strokeOpacity="0.4"
            />
          </g>
        )}

        {islandId === 'sao_vicente' && (
          <g id="sao-vicente-island-shape">
            <path
              d="M 320 260 Q 540 220 700 320 T 780 540 Q 720 720 540 740 T 280 660 Q 220 500 240 380 T 320 260 Z"
              fill="url(#islandLandGrad)"
              stroke="#334155"
              strokeWidth="2.5"
            />
            <path
              d="M 420 440 L 500 510 L 380 360"
              fill="none"
              stroke="#334155"
              strokeWidth="4"
            />
          </g>
        )}

        {islandId === 'sal' && (
          <g id="sal-island-shape">
            <path
              d="M 440 180 Q 560 190 540 340 T 560 620 Q 580 780 500 810 T 420 700 Q 430 440 410 320 T 440 180 Z"
              fill="url(#islandLandGrad)"
              stroke="#334155"
              strokeWidth="2.5"
            />
            <path
              d="M 480 310 Q 500 500 530 720"
              fill="none"
              stroke="#334155"
              strokeWidth="4"
            />
          </g>
        )}

        {islandId === 'boa_vista' && (
          <g id="boa-vista-island-shape">
            <path
              d="M 360 280 Q 640 240 720 400 T 680 680 Q 500 780 340 680 T 260 480 T 360 280 Z"
              fill="url(#islandLandGrad)"
              stroke="#334155"
              strokeWidth="2.5"
            />
          </g>
        )}

        {/* Dynamic Surge Heatmap Zones Layer */}
        {showSurgeHeatmap && (
          <g id="surge-heatmap-layer">
            {islandZones.map((zone: Zone) => {
              const isExtreme = zone.surgeMultiplier >= 1.5;
              const gradId = isExtreme ? 'url(#surgeExtremeGrad)' : 'url(#surgeHighGrad)';
              const radius = zone.radius * (1 + (currentSurgeMultiplier - 1) * 0.4);

              return (
                <g key={zone.id} className="transition-all duration-700">
                  {/* Heat circle */}
                  <circle
                    cx={zone.center.x}
                    cy={zone.center.y}
                    r={radius}
                    fill={gradId}
                    className="animate-pulse"
                  />
                  {/* Surge Multiplier Tag on Map */}
                  <g transform={`translate(${zone.center.x}, ${zone.center.y - 12})`}>
                    <rect
                      x="-32"
                      y="-14"
                      width="64"
                      height="22"
                      rx="11"
                      fill="#0f172a"
                      stroke={isExtreme ? '#f43f5e' : '#f59e0b'}
                      strokeWidth="1.5"
                      className="drop-shadow-md"
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill={isExtreme ? '#fda4af' : '#fef08a'}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      ⚡ {zone.surgeMultiplier.toFixed(1)}x
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        )}

        {/* Route Line if Selected */}
        {renderRoutePath()}

        {/* Automated Dispatch Scanning Radar */}
        {isDispatching && pickupLocation && (
          <g id="dispatch-radar" transform={`translate(${pickupLocation.x}, ${pickupLocation.y})`}>
            <circle cx="0" cy="0" r="180" fill="url(#radarScanGrad)" className="animate-radar-pulse" />
            <circle cx="0" cy="0" r="120" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 6" className="animate-spin" />
            <circle cx="0" cy="0" r="60" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
          </g>
        )}

        {/* Landmark Location Pins */}
        <g id="map-locations">
          {islandLocations.map((loc) => {
            const isPickup = pickupLocation?.id === loc.id;
            const isDropoff = dropoffLocation?.id === loc.id;

            return (
              <g
                key={loc.id}
                transform={`translate(${loc.x}, ${loc.y})`}
                onClick={() => onSelectMapLocation && onSelectMapLocation(loc)}
                className="cursor-pointer group"
              >
                {/* Pin circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={isPickup || isDropoff ? '10' : '6'}
                  fill={isPickup ? '#10b981' : isDropoff ? '#ef4444' : '#64748b'}
                  stroke="#ffffff"
                  strokeWidth={isPickup || isDropoff ? '3' : '1.5'}
                  className="transition-transform group-hover:scale-125"
                />

                {/* Location text label */}
                <text
                  x="0"
                  y={isPickup || isDropoff ? '24' : '16'}
                  textAnchor="middle"
                  fill={isPickup ? '#34d399' : isDropoff ? '#f87171' : '#cbd5e1'}
                  fontSize={isPickup || isDropoff ? '12' : '9'}
                  fontWeight={isPickup || isDropoff ? 'bold' : 'normal'}
                  className="pointer-events-none drop-shadow-md"
                >
                  {loc.name.split('(')[0]}
                </text>
              </g>
            );
          })}
        </g>

        {/* Nearby Drivers on Map */}
        <g id="nearby-drivers">
          {nearbyDrivers
            .filter((d) => d.islandId === islandId && d.isOnline)
            .map((driver) => {
              const isActiveDriver = activeTrip && activeTrip.driver.id === driver.id;
              // If active trip in progress, position follows the trip position
              const posX = isActiveDriver ? activeTrip.currentVehiclePos.x : driver.currentLocation.x;
              const posY = isActiveDriver ? activeTrip.currentVehiclePos.y : driver.currentLocation.y;

              return (
                <g key={driver.id} transform={`translate(${posX}, ${posY})`} className="transition-all duration-1000">
                  {/* Car Halo */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isActiveDriver ? '22' : '14'}
                    fill={isActiveDriver ? '#fbbf24' : '#38bdf8'}
                    fillOpacity="0.25"
                    className="animate-pulse"
                  />

                  {/* Car Body marker */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isActiveDriver ? '14' : '10'}
                    fill={isActiveDriver ? '#f59e0b' : '#0284c7'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="drop-shadow-lg"
                  />

                  {/* Car Direction indicator icon */}
                  <path
                    d="M -4 -3 L 4 -3 L 5 4 L -5 4 Z"
                    fill="#ffffff"
                  />

                  {/* Cape Verde Vehicle Plate tag floating above active car */}
                  {isActiveDriver && (
                    <g transform="translate(0, -32)">
                      <rect
                        x="-38"
                        y="-12"
                        width="76"
                        height="20"
                        rx="4"
                        fill="#ffffff"
                        stroke="#000000"
                        strokeWidth="1.5"
                      />
                      {/* Yellow left band */}
                      <rect x="-38" y="-12" width="10" height="20" rx="3" fill="#facc15" />
                      <text
                        x="4"
                        y="2"
                        textAnchor="middle"
                        fill="#000000"
                        fontSize="9"
                        fontWeight="bold"
                        className="font-mono-plate"
                      >
                        {driver.vehicle.plate}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
        </g>
      </svg>

      {/* Floating Map Controls Top-Right */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
        {/* Toggle Surge Heatmap */}
        <button
          id="btn-toggle-heatmap"
          onClick={onToggleSurgeHeatmap}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg transition border ${
            showSurgeHeatmap
              ? 'bg-amber-500 text-slate-950 border-amber-400'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
          }`}
          title="Ver zonas quentes de tarifa dinâmica"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Surge Map</span>
        </button>

        {/* 2D / 3D Tilt perspective toggle */}
        <button
          id="btn-toggle-3d"
          onClick={() => setIs3DView(!is3DView)}
          className={`p-2 rounded-xl text-xs font-medium shadow-lg transition border ${
            is3DView
              ? 'bg-blue-600 text-white border-blue-400'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
          }`}
          title="Perspetiva 3D"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* GPS Locate Me Button */}
        <button
          id="btn-locate-me"
          onClick={handleLocateMe}
          className="p-2 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700 shadow-lg transition"
          title="Minha Localização GPS"
        >
          <Locate className={`w-4 h-4 ${userGpsActive ? 'text-emerald-400' : ''}`} />
        </button>

        {/* Zoom controls */}
        <div className="flex flex-col bg-slate-900/90 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <button
            id="btn-zoom-in"
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.25))}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition text-sm font-bold"
          >
            +
          </button>
          <div className="h-px bg-slate-800" />
          <button
            id="btn-zoom-out"
            onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.25))}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition text-sm font-bold"
          >
            −
          </button>
        </div>
      </div>

      {/* Floating Active Trip Speed & ETA Overlay */}
      {activeTrip && (activeTrip.status === 'driver_arriving' || activeTrip.status === 'trip_in_progress') && (
        <div className="absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-3 z-10 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Navigation className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {activeTrip.status === 'driver_arriving' ? 'Motorista a Chegar' : 'Em Viagem'}
              </div>
              <div className="font-extrabold text-sm text-white">
                {activeTrip.etaMinutes} min restantes ({activeTrip.remainingDistanceKm} km)
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* Authentic Plate Quick Reminder */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400">Matrícula:</span>
            <span className="font-mono-plate font-bold text-amber-400 text-xs">
              {activeTrip.driver.vehicle.plate}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
