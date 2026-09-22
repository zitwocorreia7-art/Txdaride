/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DriverPortal } from './components/Driver/DriverPortal';
import { Header } from './components/Header';
import { CapeVerdeMap } from './components/Map/CapeVerdeMap';
import { NotificationDrawer } from './components/Notifications/NotificationDrawer';
import { OfflineBanner } from './components/Offline/OfflineBanner';
import { PreTripConfirmationModal } from './components/Rider/PreTripConfirmationModal';
import { RideBookingCard } from './components/Rider/RideBookingCard';
import { ScheduleRideModal } from './components/Rider/ScheduleRideModal';
import { ScheduledTripsList } from './components/Rider/ScheduledTripsList';
import { SurgeSimulatorBar } from './components/Surge/SurgeSimulatorBar';
import { ActiveTripPanel } from './components/Trip/ActiveTripPanel';
import { LoyaltyModal } from './components/Loyalty/LoyaltyModal';
import { RatingModal } from './components/Trip/RatingModal';
import { CV_LOCATIONS, CV_ZONES, INITIAL_DRIVERS } from './data/capeVerdeData';
import { calculatePointsEarned, getLoyaltyTier, INITIAL_LOYALTY_PROFILE } from './data/loyaltyRewards';
import { TRANSLATIONS } from './i18n/translations';
import { ActiveLoyaltyReward, ActiveTrip, Driver, DriverRegistrationForm, IslandId, Language, LocationPoint, LoyaltyProfile, LoyaltyReward, LoyaltyTransaction, PaymentMethodType, PromoCode, PushNotification, RideTier, ScheduledTrip, TripStatus } from './types';
import { calculateDynamicFare } from './utils/pricingEngine';
import { playNotificationSound } from './utils/soundEffects';

export default function App() {
  // App State
  const [language, setLanguage] = useState<Language>('pt');
  const [currentIsland, setCurrentIsland] = useState<IslandId>('santiago');
  const [isDriverMode, setIsDriverMode] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  // Dynamic Surge Pricing Controls
  const [timeOfDayHours, setTimeOfDayHours] = useState<number>(8.5); // Default to 08:30 AM morning rush
  const [demandLevel, setDemandLevel] = useState<'normal' | 'high' | 'peak' | 'extreme'>('high');
  const [showSurgeHeatmap, setShowSurgeHeatmap] = useState<boolean>(true);

  // Locations for current island
  const islandLocations = useMemo(
    () => CV_LOCATIONS.filter((l) => l.islandId === currentIsland),
    [currentIsland]
  );

  const [pickupLocation, setPickupLocation] = useState<LocationPoint>(
    islandLocations[0] || CV_LOCATIONS[0]
  );
  const [dropoffLocation, setDropoffLocation] = useState<LocationPoint>(
    islandLocations[1] || CV_LOCATIONS[1]
  );

  // Update pickup/dropoff when island changes
  useEffect(() => {
    const locs = CV_LOCATIONS.filter((l) => l.islandId === currentIsland);
    if (locs.length >= 2) {
      setPickupLocation(locs[0]);
      setDropoffLocation(locs[1]);
    } else if (locs.length === 1) {
      setPickupLocation(locs[0]);
      setDropoffLocation(locs[0]);
    }
  }, [currentIsland]);

  // Ride Booking & Vehicle Tier
  const [selectedTier, setSelectedTier] = useState<RideTier>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('vinti4');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  // Drivers List (initialized from Cape Verde data)
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [activeDriverIndex, setActiveDriverIndex] = useState<number>(0);
  const currentDriver = drivers[activeDriverIndex] || drivers[0];

  // Active Trip & Modal States
  const [isPreTripModalOpen, setIsPreTripModalOpen] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [scheduledTrips, setScheduledTrips] = useState<ScheduledTrip[]>([]);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false);
  const [ratedTripDriver, setRatedTripDriver] = useState<Driver | null>(null);

  // Txada Club Loyalty State
  const [loyaltyProfile, setLoyaltyProfile] = useState<LoyaltyProfile>(INITIAL_LOYALTY_PROFILE);
  const [activeLoyaltyReward, setActiveLoyaltyReward] = useState<ActiveLoyaltyReward | null>(null);
  const [hasPriorityBooking, setHasPriorityBooking] = useState<boolean>(false);
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState<boolean>(false);
  const [lastTripPointsEarned, setLastTripPointsEarned] = useState<number>(0);

  // Driver incoming request simulation
  const [incomingTripRequest, setIncomingTripRequest] = useState<{
    id: string;
    riderName: string;
    pickupName: string;
    dropoffName: string;
    fareCVE: number;
    surgeBonusCVE: number;
    distanceKm: number;
  } | null>(null);

  // Push Notifications Queue
  const [notifications, setNotifications] = useState<PushNotification[]>([
    {
      id: 'notif_welcome',
      title: 'Benvindo ao TxadaRide!',
      message: 'Plataforma oficial de mobilidade e partilha de carros em Cabo Verde.',
      timestamp: 'Agora',
      type: 'system',
      read: false,
    },
    {
      id: 'notif_surge_morning',
      title: '⚡ Tarifa Dinâmica Ativa',
      message: 'Forte procura de viagens na zona do Aeroporto Nelson Mandela e Sucupira (+250 CVE bónus para motoristas).',
      timestamp: '08:15',
      type: 'surge',
      read: false,
    },
  ]);

  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'default'>('default');

  // Active translation dictionary
  const t = TRANSLATIONS[language] || TRANSLATIONS.pt;

  // Add push notification helper
  const addNotification = (
    title: string,
    message: string,
    type: 'surge' | 'trip_status' | 'driver_arrival' | 'payment' | 'system'
  ) => {
    const newNotif: PushNotification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);

    // Trigger browser Notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`TxadaRide: ${title}`, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Browser notification error:', err);
      }
    }
  };

  const handleRequestBrowserNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      setBrowserPermission(res);
      if (res === 'granted') {
        addNotification('Notificações Ativadas', 'Irá receber atualizações em tempo real sobre o estado da sua viagem e tarifas.', 'system');
      }
    }
  };

  // Dynamic Fare calculation based on real-time factors
  const fareBreakdown = useMemo(() => {
    return calculateDynamicFare(pickupLocation, dropoffLocation, selectedTier, {
      timeOfDayHours,
      demandLevel,
      appliedPromo,
      appliedLoyaltyReward: activeLoyaltyReward,
    });
  }, [pickupLocation, dropoffLocation, selectedTier, timeOfDayHours, demandLevel, appliedPromo, activeLoyaltyReward]);

  // Find candidate driver for current island & tier
  const matchedCandidateDriver = useMemo(() => {
    const candidates = drivers.filter(
      (d) => d.islandId === currentIsland && d.isOnline && !d.isBusy
    );
    if (candidates.length > 0) {
      // If priority booking active, sort candidate drivers by rating descending (5.0 star VIP matching)
      if (hasPriorityBooking || loyaltyProfile.tier === 'diamond') {
        return [...candidates].sort((a, b) => b.rating - a.rating)[0];
      }
      return candidates[0];
    }
    return drivers[0];
  }, [drivers, currentIsland, hasPriorityBooking, loyaltyProfile.tier]);

  // Schedule Ride Flow
  const handleConfirmScheduleRide = (data: {
    scheduledTime: number;
    scheduledDateFormatted: string;
    notes?: string;
  }) => {
    setIsScheduleModalOpen(false);

    const verificationPin = Math.floor(1000 + Math.random() * 9000).toString();
    const newScheduledTrip: ScheduledTrip = {
      id: `sched_${Date.now()}`,
      riderName: 'Passageiro Txada',
      riderPhone: '+238 998 12 34',
      pickup: pickupLocation,
      dropoff: dropoffLocation,
      scheduledTime: data.scheduledTime,
      scheduledDateFormatted: data.scheduledDateFormatted,
      tier: selectedTier,
      fareBreakdown: { ...fareBreakdown },
      paymentMethod,
      verificationPin,
      notes: data.notes,
      status: 'scheduled',
      createdAt: Date.now(),
    };

    setScheduledTrips((prev) => [newScheduledTrip, ...prev]);

    if (soundEnabled) playNotificationSound('surge_alert');

    addNotification(
      'Viagem Agendada com Sucesso! 📅',
      `Viagem para ${data.scheduledDateFormatted} de ${pickupLocation.name.split('(')[0]} para ${dropoffLocation.name.split('(')[0]} confirmada. Preço fixado em ${fareBreakdown.finalFareCVE} CVE.`,
      'trip_status'
    );
  };

  // Dispatch an already scheduled trip into active execution
  const handleDispatchScheduledTrip = (scheduled: ScheduledTrip) => {
    setIsDispatching(true);

    if (soundEnabled) playNotificationSound('surge_alert');

    addNotification(
      'A Iniciar Viagem Agendada',
      `A atribuir condutor para a viagem pré-agendada para ${scheduled.dropoff.name.split('(')[0]}...`,
      'trip_status'
    );

    // Remove from scheduled list
    setScheduledTrips((prev) => prev.filter((s) => s.id !== scheduled.id));

    setTimeout(() => {
      setIsDispatching(false);
      const selectedDriver = matchedCandidateDriver;

      const newTrip: ActiveTrip = {
        id: `trip_${Date.now()}`,
        riderName: scheduled.riderName,
        riderPhone: scheduled.riderPhone,
        pickup: scheduled.pickup,
        dropoff: scheduled.dropoff,
        driver: selectedDriver,
        tier: scheduled.tier,
        fareBreakdown: scheduled.fareBreakdown,
        paymentMethod: scheduled.paymentMethod,
        verificationPin: scheduled.verificationPin,
        status: 'driver_arriving',
        startTime: Date.now(),
        etaMinutes: 2,
        remainingDistanceKm: scheduled.fareBreakdown.distanceKm,
        currentVehiclePos: { ...selectedDriver.currentLocation },
        progressPercent: 15,
        isPreBooked: true,
        scheduledTime: scheduled.scheduledTime,
      };

      setActiveTrip(newTrip);

      if (soundEnabled) playNotificationSound('driver_matched');

      addNotification(
        'Condutor Pré-Agendado a Caminho!',
        `${selectedDriver.name} foi designado para a sua viagem agendada. Viatura: ${selectedDriver.vehicle.make} ${selectedDriver.vehicle.model} (Matrícula: ${selectedDriver.vehicle.plate}). PIN: ${scheduled.verificationPin}`,
        'trip_status'
      );
    }, 2000);
  };

  const handleCancelScheduledTrip = (tripId: string) => {
    setScheduledTrips((prev) => prev.filter((s) => s.id !== tripId));
    addNotification('Agendamento Cancelado', 'A sua viagem pré-agendada foi cancelada sem quaisquer encargos.', 'system');
  };

  // Txada Club Loyalty Reward Handlers
  const handleRedeemReward = (reward: LoyaltyReward) => {
    if (loyaltyProfile.points < reward.pointsCost) return;

    const newTx: LoyaltyTransaction = {
      id: `tx_${Date.now()}`,
      type: 'redeemed',
      points: reward.pointsCost,
      description: `Resgate: ${reward.title}`,
      timestamp: Date.now(),
    };

    setLoyaltyProfile((prev) => ({
      ...prev,
      points: prev.points - reward.pointsCost,
      history: [newTx, ...prev.history],
    }));

    if (reward.type === 'priority_booking') {
      setHasPriorityBooking(true);
      addNotification(
        '👑 Prioridade VIP Ativada!',
        'Despacho Prioritário VIP ativo para a sua próxima viagem. Terá prioridade máxima na fila com condutores 5★.',
        'system'
      );
    } else {
      setActiveLoyaltyReward({
        rewardId: reward.id,
        title: reward.title,
        type: reward.type,
        discountCVE: reward.discountCVE,
        discountPercent: reward.discountPercent,
      });
      addNotification(
        '🎁 Recompensa Resgatada!',
        `${reward.title} ativo! O benefício foi aplicado automaticamente ao cálculo da tarifa.`,
        'system'
      );
    }
  };

  const handleRemoveLoyaltyReward = () => {
    setActiveLoyaltyReward(null);
    setHasPriorityBooking(false);
    addNotification('Recompensa Removida', 'A recompensa de fidelidade ativa foi removida da viagem.', 'system');
  };

  // Helper to award points when a trip is finished
  const awardPointsForTrip = (completedTrip: ActiveTrip) => {
    const pts = calculatePointsEarned(completedTrip.fareBreakdown.finalFareCVE, loyaltyProfile.tier);
    setLastTripPointsEarned(pts);

    const newTx: LoyaltyTransaction = {
      id: `tx_${Date.now()}`,
      type: 'earned',
      points: pts,
      description: `Viagem concluída (${completedTrip.dropoff.name.split('(')[0].trim()})`,
      timestamp: Date.now(),
    };

    setLoyaltyProfile((prev) => {
      const updatedLifetime = prev.lifetimePoints + pts;
      return {
        ...prev,
        points: prev.points + pts,
        lifetimePoints: updatedLifetime,
        tier: getLoyaltyTier(updatedLifetime),
        completedRides: prev.completedRides + 1,
        history: [newTx, ...prev.history],
      };
    });

    // Reset single-use rewards
    setActiveLoyaltyReward(null);
    setHasPriorityBooking(false);

    addNotification(
      '⭐ Ganhou Pontos Txada Club!',
      `Parabéns! Ganhou +${pts} pontos nesta viagem. Nível atual: ${loyaltyProfile.tier.toUpperCase()}.`,
      'system'
    );
  };

  // Automated Dispatch Algorithm: matches rider with best driver
  const handleConfirmAndDispatch = () => {
    setIsPreTripModalOpen(false);
    setIsDispatching(true);

    if (soundEnabled) playNotificationSound('surge_alert');

    addNotification(
      hasPriorityBooking ? '👑 A Despachar com Prioridade VIP' : 'A Despachar Motorista',
      hasPriorityBooking
        ? 'Passageiro VIP: a alocar instantaneamente o melhor condutor disponível 5★...'
        : `A localizar o veículo mais próximo em ${pickupLocation.name.split('(')[0]}...`,
      'trip_status'
    );

    // Fast dispatch if VIP priority booking (1.2s vs 2.4s)
    const dispatchDelay = hasPriorityBooking ? 1200 : 2400;

    setTimeout(() => {
      setIsDispatching(false);
      const selectedDriver = matchedCandidateDriver;
      const verificationPin = Math.floor(1000 + Math.random() * 9000).toString();

      const newTrip: ActiveTrip = {
        id: `trip_${Date.now()}`,
        riderName: 'Passageiro Txada',
        riderPhone: '+238 998 12 34',
        pickup: pickupLocation,
        dropoff: dropoffLocation,
        driver: selectedDriver,
        tier: selectedTier,
        fareBreakdown,
        paymentMethod,
        verificationPin,
        status: 'driver_arriving',
        startTime: Date.now(),
        etaMinutes: hasPriorityBooking ? 2 : 3,
        remainingDistanceKm: fareBreakdown.distanceKm,
        currentVehiclePos: { ...selectedDriver.currentLocation },
        progressPercent: 15,
        hasPriorityBooking,
        appliedLoyaltyRewardTitle: activeLoyaltyReward?.title,
      };

      setActiveTrip(newTrip);

      if (soundEnabled) playNotificationSound('driver_matched');

      addNotification(
        hasPriorityBooking ? '👑 Motorista VIP Confirmado!' : 'Motorista Confirmado!',
        `${selectedDriver.name} aceitou a sua viagem. Viatura: ${selectedDriver.vehicle.make} ${selectedDriver.vehicle.model} (Matrícula: ${selectedDriver.vehicle.plate}). PIN: ${verificationPin}`,
        'trip_status'
      );
    }, dispatchDelay);
  };

  // Simulate GPS vehicle movement along the route during active trip
  useEffect(() => {
    if (!activeTrip || activeTrip.status === 'trip_completed') return;

    const interval = setInterval(() => {
      setActiveTrip((prev) => {
        if (!prev) return null;

        // Progress vehicle position towards destination
        const target = prev.status === 'driver_arriving' ? prev.pickup : prev.dropoff;
        const currentPos = prev.currentVehiclePos;

        const dx = target.x - currentPos.x;
        const dy = target.y - currentPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15) {
          // Reached checkpoint
          if (prev.status === 'driver_arriving') {
            if (soundEnabled) playNotificationSound('driver_arrived');
            addNotification(
              'Motorista Chegou!',
              `${prev.driver.name} chegou ao ponto de partida! Confira a matrícula ${prev.driver.vehicle.plate} e informe o PIN ${prev.verificationPin}.`,
              'driver_arrival'
            );
            return {
              ...prev,
              status: 'driver_arrived',
              currentVehiclePos: { x: target.x, y: target.y },
              etaMinutes: 0,
              progressPercent: 40,
            };
          } else if (prev.status === 'trip_in_progress') {
            // Finished trip
            if (soundEnabled) playNotificationSound('trip_complete');
            addNotification(
              'Viagem Concluída!',
              `Chegou ao destino! Pagamento de ${prev.fareBreakdown.finalFareCVE} CVE processado via ${prev.paymentMethod.toUpperCase()}.`,
              'payment'
            );
            awardPointsForTrip(prev);
            setRatedTripDriver(prev.driver);
            setIsRatingModalOpen(true);
            return {
              ...prev,
              status: 'trip_completed',
              currentVehiclePos: { x: target.x, y: target.y },
              progressPercent: 100,
              etaMinutes: 0,
              remainingDistanceKm: 0,
            };
          }
        }

        // Move 8 units closer
        const step = 8;
        const newX = currentPos.x + (dx / dist) * step;
        const newY = currentPos.y + (dy / dist) * step;

        const newRemainingKm = Math.max(0.2, Math.round((prev.remainingDistanceKm - 0.2) * 10) / 10);
        const newEta = Math.max(1, Math.round(prev.etaMinutes - 0.15));

        return {
          ...prev,
          currentVehiclePos: { x: newX, y: newY },
          remainingDistanceKm: newRemainingKm,
          etaMinutes: newEta,
          progressPercent: Math.min(95, prev.progressPercent + 2),
        };
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [activeTrip?.status, soundEnabled]);

  // Step advancement helper for demo control
  const handleSimulateTripProgress = () => {
    if (!activeTrip) return;
    if (activeTrip.status === 'driver_arriving') {
      setActiveTrip({
        ...activeTrip,
        status: 'driver_arrived',
        currentVehiclePos: { ...activeTrip.pickup },
        progressPercent: 50,
      });
      if (soundEnabled) playNotificationSound('driver_arrived');
    } else if (activeTrip.status === 'driver_arrived') {
      setActiveTrip({
        ...activeTrip,
        status: 'trip_in_progress',
        progressPercent: 60,
        etaMinutes: activeTrip.fareBreakdown.estimatedMinutes,
      });
      addNotification('Viagem em Curso', 'A dirigir em direção ao destino com acompanhamento GPS em direto.', 'trip_status');
    }
  };

  const handleCompleteActiveTrip = () => {
    if (!activeTrip) return;
    if (soundEnabled) playNotificationSound('trip_complete');
    awardPointsForTrip(activeTrip);
    setRatedTripDriver(activeTrip.driver);
    setIsRatingModalOpen(true);
    setActiveTrip({
      ...activeTrip,
      status: 'trip_completed',
      progressPercent: 100,
    });
  };

  const handleCancelActiveTrip = () => {
    setActiveTrip(null);
    setIsDispatching(false);
    addNotification('Viagem Cancelada', 'A sua viagem foi cancelada sem taxas de cancelamento.', 'trip_status');
  };

  // Submit Driver Rating & award review bonus points
  const handleSubmitRating = (rating: number, review: string, tipCVE: number) => {
    setIsRatingModalOpen(false);

    // Award +10 bonus points for completing a review
    const bonusPts = 10;
    const bonusTx: LoyaltyTransaction = {
      id: `tx_review_${Date.now()}`,
      type: 'earned',
      points: bonusPts,
      description: `Bónus de Avaliação do Motorista (${ratedTripDriver?.name.split(' ')[0] || 'Condutor'})`,
      timestamp: Date.now(),
    };

    setLoyaltyProfile((prev) => {
      const updatedLifetime = prev.lifetimePoints + bonusPts;
      return {
        ...prev,
        points: prev.points + bonusPts,
        lifetimePoints: updatedLifetime,
        tier: getLoyaltyTier(updatedLifetime),
        history: [bonusTx, ...prev.history],
      };
    });

    addNotification(
      'Obrigado pela sua Avaliação! ⭐',
      `Avaliou ${ratedTripDriver?.name} com ${rating} estrelas (+${bonusPts} Pontos de bónus creditados). ${tipCVE > 0 ? `Gorjeta de ${tipCVE} CVE enviada com sucesso!` : ''}`,
      'system'
    );
    setActiveTrip(null);
  };

  // Driver Car Registration
  const handleRegisterNewCar = (form: DriverRegistrationForm) => {
    const newDriver: Driver = {
      id: `drv_${Date.now()}`,
      name: form.fullName || 'Novo Motorista Registado',
      phone: form.phone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      totalTrips: 1,
      acceptanceRate: 100,
      vehicle: {
        plate: form.plate,
        make: form.make,
        model: form.model,
        year: form.year,
        color: form.color,
        tier: form.tier,
        seats: form.tier === 'hiace' ? 12 : 4,
      },
      islandId: form.islandId,
      currentLocation: { x: 500, y: 500 },
      isOnline: true,
      isBusy: false,
      joinedDate: 'Hoje',
      badges: ['Novo Motorista Registado', 'Verificado CV'],
      todayEarningsCVE: 0,
      todaySurgeBonusCVE: 0,
      completedRidesToday: 0,
    };

    setDrivers([newDriver, ...drivers]);
    setActiveDriverIndex(0);

    addNotification(
      'Viatura Registada com Sucesso!',
      `O seu ${form.make} ${form.model} (Matrícula: ${form.plate}) está ativo para receber pedidos em ${form.islandId.toUpperCase()}.`,
      'system'
    );
  };

  // Update existing driver
  const handleUpdateDriver = (updated: Driver) => {
    setDrivers((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  // Driver incoming trip simulation
  const handleAcceptIncomingTrip = () => {
    if (!incomingTripRequest) return;
    if (soundEnabled) playNotificationSound('driver_matched');

    // Update driver today earnings & surge bonus
    const updated = {
      ...currentDriver,
      todayEarningsCVE: currentDriver.todayEarningsCVE + incomingTripRequest.fareCVE,
      todaySurgeBonusCVE: currentDriver.todaySurgeBonusCVE + incomingTripRequest.surgeBonusCVE,
      completedRidesToday: currentDriver.completedRidesToday + 1,
    };
    handleUpdateDriver(updated);

    addNotification(
      'Viagem Aceite!',
      `Aceitou a viagem de ${incomingTripRequest.riderName}. Dirija-se a ${incomingTripRequest.pickupName}. Ganhos: +${incomingTripRequest.fareCVE} CVE!`,
      'trip_status'
    );

    setIncomingTripRequest(null);
  };

  const handleDeclineIncomingTrip = () => {
    setIncomingTripRequest(null);
  };

  // Simulate an incoming driver trip every 45s when driver is online
  useEffect(() => {
    if (!isDriverMode || !currentDriver.isOnline) return;

    const timer = setTimeout(() => {
      const locs = CV_LOCATIONS.filter((l) => l.islandId === currentIsland);
      if (locs.length >= 2 && !incomingTripRequest) {
        const p = locs[0];
        const d = locs[1];
        const fare = calculateDynamicFare(p, d, 'standard', {
          timeOfDayHours,
          demandLevel,
        });

        setIncomingTripRequest({
          id: `req_${Date.now()}`,
          riderName: 'Maria Antónia Tavares',
          pickupName: p.name.split('(')[0],
          dropoffName: d.name.split('(')[0],
          fareCVE: fare.driverTotalPayoutCVE,
          surgeBonusCVE: fare.driverSurgeBonusCVE,
          distanceKm: fare.distanceKm,
        });

        if (soundEnabled) playNotificationSound('surge_alert');
      }
    }, 12000);

    return () => clearTimeout(timer);
  }, [isDriverMode, currentDriver.isOnline, currentIsland, timeOfDayHours, demandLevel]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* App Header */}
      <Header
        currentIsland={currentIsland}
        onSelectIsland={setCurrentIsland}
        language={language}
        onSelectLanguage={setLanguage}
        isDriverMode={isDriverMode}
        onToggleDriverMode={() => setIsDriverMode(!isDriverMode)}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setNotificationsOpen(true)}
        loyaltyPoints={loyaltyProfile.points}
        loyaltyTier={loyaltyProfile.tier}
        onOpenLoyaltyModal={() => setIsLoyaltyModalOpen(true)}
        t={t}
      />

      {/* Dynamic Surge Pricing Simulator & Demand Controls */}
      <SurgeSimulatorBar
        timeOfDayHours={timeOfDayHours}
        onTimeChange={setTimeOfDayHours}
        demandLevel={demandLevel}
        onDemandChange={setDemandLevel}
        currentSurgeMultiplier={fareBreakdown.totalSurgeMultiplier}
        isDriverMode={isDriverMode}
        activeSurgeZonesCount={CV_ZONES.filter((z) => z.islandId === currentIsland && z.surgeMultiplier > 1.2).length}
        t={t}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map & Live Tracking */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Offline Fallback Banner */}
          <OfflineBanner
            isOffline={isOffline}
            currentIsland={currentIsland}
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
            estimatedFareCVE={fareBreakdown.finalFareCVE}
            t={t}
          />

          {/* Interactive Cape Verde Vector Map */}
          <CapeVerdeMap
            islandId={currentIsland}
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
            activeTrip={activeTrip}
            nearbyDrivers={drivers}
            isDispatching={isDispatching}
            showSurgeHeatmap={showSurgeHeatmap}
            onToggleSurgeHeatmap={() => setShowSurgeHeatmap(!showSurgeHeatmap)}
            onSelectMapLocation={(loc) => {
              if (!pickupLocation || pickupLocation.id === loc.id) {
                setDropoffLocation(loc);
              } else {
                setPickupLocation(loc);
              }
            }}
            availableLocations={islandLocations}
            currentSurgeMultiplier={fareBreakdown.totalSurgeMultiplier}
          />

          {/* Active Trip Telemetry and Dispatch Panel if trip exists */}
          {activeTrip && (
            <ActiveTripPanel
              trip={activeTrip}
              onCancelTrip={handleCancelActiveTrip}
              onSimulateProgress={handleSimulateTripProgress}
              onCompleteTrip={handleCompleteActiveTrip}
              t={t}
            />
          )}

          {/* Scheduled Trips List */}
          {scheduledTrips.length > 0 && !activeTrip && (
            <ScheduledTripsList
              scheduledTrips={scheduledTrips}
              onDispatchScheduledTrip={handleDispatchScheduledTrip}
              onCancelScheduledTrip={handleCancelScheduledTrip}
              t={t}
            />
          )}
        </div>

        {/* Right Column: Rider Booking Sheet OR Driver Portal */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {isDriverMode ? (
            <DriverPortal
              currentDriver={currentDriver}
              onUpdateDriver={handleUpdateDriver}
              onRegisterNewCar={handleRegisterNewCar}
              currentIsland={currentIsland}
              incomingTripRequest={incomingTripRequest}
              onAcceptIncomingTrip={handleAcceptIncomingTrip}
              onDeclineIncomingTrip={handleDeclineIncomingTrip}
              currentSurgeMultiplier={fareBreakdown.totalSurgeMultiplier}
              t={t}
            />
          ) : (
            <RideBookingCard
              availableLocations={islandLocations}
              pickupLocation={pickupLocation}
              dropoffLocation={dropoffLocation}
              onSelectPickup={setPickupLocation}
              onSelectDropoff={setDropoffLocation}
              selectedTier={selectedTier}
              onSelectTier={setSelectedTier}
              fareBreakdown={fareBreakdown}
              paymentMethod={paymentMethod}
              onSelectPaymentMethod={setPaymentMethod}
              appliedPromo={appliedPromo}
              onApplyPromo={(promo) => {
                setAppliedPromo(promo);
                if (promo) {
                  addNotification(
                    'Código Promocional Ativo! 🎉',
                    `Código ${promo.code} aplicado com sucesso! Desconto de ${
                      promo.discountPercent ? `${promo.discountPercent}%` : `${promo.discountAmountCVE} CVE`
                    } no valor da sua viagem.`,
                    'system'
                  );
                }
              }}
              onOpenPreTripModal={() => setIsPreTripModalOpen(true)}
              onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
              scheduledTripsCount={scheduledTrips.length}
              loyaltyProfile={loyaltyProfile}
              activeLoyaltyReward={activeLoyaltyReward}
              hasPriorityBooking={hasPriorityBooking}
              onOpenLoyaltyModal={() => setIsLoyaltyModalOpen(true)}
              onRemoveLoyaltyReward={handleRemoveLoyaltyReward}
              onQuickRedeemReward={handleRedeemReward}
              t={t}
            />
          )}
        </div>
      </main>

      {/* Pre-Trip Vehicle Plate & Driver Confirmation Modal */}
      <PreTripConfirmationModal
        isOpen={isPreTripModalOpen}
        onClose={() => setIsPreTripModalOpen(false)}
        onConfirm={handleConfirmAndDispatch}
        driver={matchedCandidateDriver}
        pickup={pickupLocation}
        dropoff={dropoffLocation}
        tier={selectedTier}
        fareBreakdown={fareBreakdown}
        paymentMethod={paymentMethod}
        verificationPin="8492"
        t={t}
      />

      {/* Schedule Ride for Later Modal */}
      <ScheduleRideModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onConfirmSchedule={handleConfirmScheduleRide}
        pickup={pickupLocation}
        dropoff={dropoffLocation}
        tier={selectedTier}
        fareBreakdown={fareBreakdown}
        paymentMethod={paymentMethod}
        appliedPromo={appliedPromo}
        t={t}
      />

      {/* Driver Rating & Review Modal upon trip completion */}
      {ratedTripDriver && (
        <RatingModal
          isOpen={isRatingModalOpen}
          driver={ratedTripDriver}
          finalFareCVE={fareBreakdown.finalFareCVE}
          pointsEarned={lastTripPointsEarned}
          onClose={() => setIsRatingModalOpen(false)}
          onSubmitRating={handleSubmitRating}
          t={t}
        />
      )}

      {/* Txada Club Loyalty Points & Rewards Modal */}
      <LoyaltyModal
        isOpen={isLoyaltyModalOpen}
        onClose={() => setIsLoyaltyModalOpen(false)}
        loyaltyProfile={loyaltyProfile}
        activeLoyaltyReward={activeLoyaltyReward}
        hasPriorityBooking={hasPriorityBooking}
        onRedeemReward={handleRedeemReward}
        onRemoveActiveReward={handleRemoveLoyaltyReward}
        t={t}
      />

      {/* Push Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onClearAll={() => setNotifications([])}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onRequestBrowserPermission={handleRequestBrowserNotification}
        browserPermission={browserPermission}
      />
    </div>
  );
}
