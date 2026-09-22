export type Language = 'kriolu' | 'pt' | 'en' | 'fr';

export type IslandId = 'santiago' | 'sao_vicente' | 'sal' | 'boa_vista';

export interface LocationPoint {
  id: string;
  name: string;
  islandId: IslandId;
  zoneId: string;
  x: number; // 0 - 1000 coordinate relative to island map
  y: number; // 0 - 1000 coordinate relative to island map
  lat: number;
  lng: number;
  type: 'airport' | 'port' | 'beach' | 'market' | 'residential' | 'downtown' | 'hotel_zone';
  surgeMultiplier: number;
}

export interface Zone {
  id: string;
  name: string;
  islandId: IslandId;
  baseSurge: number; // e.g. 1.3 for airport
  currentDemand: 'low' | 'moderate' | 'high' | 'surge';
  surgeMultiplier: number;
  activeRiders: number;
  availableDrivers: number;
  description: string;
  center: { x: number; y: number };
  radius: number;
}

export interface Vehicle {
  plate: string; // Authentic Cape Verde plate, e.g. "ST-48-XZ"
  make: string; // Toyota, Hyundai, Renault, etc.
  model: string;
  year: number;
  color: string;
  tier: 'standard' | 'comfort' | 'hiace';
  seats: number;
  photoUrl?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  rating: number;
  totalTrips: number;
  acceptanceRate: number;
  vehicle: Vehicle;
  islandId: IslandId;
  currentLocation: { x: number; y: number };
  isOnline: boolean;
  isBusy: boolean;
  joinedDate: string;
  badges: string[];
  todayEarningsCVE: number;
  todaySurgeBonusCVE: number;
  completedRidesToday: number;
}

export type RideTier = 'standard' | 'comfort' | 'hiace';

export interface PromoCode {
  code: string;
  discountPercent?: number;
  discountAmountCVE?: number;
  description: string;
  minFareCVE?: number;
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface LoyaltyTransaction {
  id: string;
  timestamp: number;
  type: 'earned' | 'redeemed';
  points: number;
  description: string;
  rideId?: string;
}

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: 'discount_fixed' | 'discount_percent' | 'priority_booking';
  discountCVE?: number;
  discountPercent?: number;
  icon: string;
  badge?: string;
  minTier?: LoyaltyTier;
}

export interface LoyaltyProfile {
  points: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  completedRides: number;
  history: LoyaltyTransaction[];
}

export interface ActiveLoyaltyReward {
  rewardId: string;
  title: string;
  type: 'discount_fixed' | 'discount_percent' | 'priority_booking';
  discountCVE?: number;
  discountPercent?: number;
}

export interface FareBreakdown {
  baseFareCVE: number;
  distanceFareCVE: number;
  timeFareCVE: number;
  subtotalCVE: number;
  timeOfDayMultiplier: number;
  timeOfDayLabel: string;
  zoneSurgeMultiplier: number;
  zoneName: string;
  demandSurgeMultiplier: number;
  totalSurgeMultiplier: number;
  totalSurgeAmountCVE: number;
  discountCVE?: number;
  appliedPromoCode?: string;
  promoDescription?: string;
  loyaltyDiscountCVE?: number;
  appliedLoyaltyRewardTitle?: string;
  finalFareCVE: number;
  originalFareCVE?: number;
  driverBaseEarningsCVE: number;
  driverSurgeBonusCVE: number;
  driverTotalPayoutCVE: number;
  distanceKm: number;
  estimatedMinutes: number;
}

export type PaymentMethodType = 'vinti4' | 'cash_cve' | 'visa_mc' | 'mbway_cv';

export interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  description: string;
  icon: string;
}

export interface ScheduledTrip {
  id: string;
  riderName: string;
  riderPhone: string;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  scheduledTime: number; // Unix timestamp
  scheduledDateFormatted: string; // readable e.g. "23 Set, 09:30"
  tier: RideTier;
  fareBreakdown: FareBreakdown;
  paymentMethod: PaymentMethodType;
  verificationPin: string;
  notes?: string;
  status: 'scheduled' | 'dispatched' | 'cancelled';
  createdAt: number;
}

export type TripStatus =
  | 'idle'
  | 'selecting_destination'
  | 'preview_fare'
  | 'pre_confirm_plate'
  | 'dispatching'
  | 'driver_accepted'
  | 'driver_arriving'
  | 'driver_arrived'
  | 'trip_in_progress'
  | 'trip_completed'
  | 'rating_submitted';

export interface ActiveTrip {
  id: string;
  riderName: string;
  riderPhone: string;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  driver: Driver;
  tier: RideTier;
  fareBreakdown: FareBreakdown;
  paymentMethod: PaymentMethodType;
  verificationPin: string;
  status: TripStatus;
  startTime: number;
  etaMinutes: number;
  remainingDistanceKm: number;
  currentVehiclePos: { x: number; y: number };
  progressPercent: number;
  isPreBooked?: boolean;
  scheduledTime?: number;
  hasPriorityBooking?: boolean;
  appliedLoyaltyRewardTitle?: string;
  loyaltyPointsEarned?: number;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'surge' | 'trip_status' | 'driver_arrival' | 'payment' | 'system';
  read: boolean;
}

export interface DriverRegistrationForm {
  fullName: string;
  phone: string;
  islandId: IslandId;
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  tier: RideTier;
  licenseNumber: string;
}
