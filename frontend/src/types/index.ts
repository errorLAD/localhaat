export type UserRole = 'customer' | 'logistics_partner' | 'village_agent' | 'business' | 'admin';

export interface Location {
  addressLine: string;
  villageOrCity: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  contactPerson?: string;
  contactPhone?: string;
  landmark?: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
  defaultLocation?: Location;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: Category | string;
  businessAccountId: any;
  sellerId: any;
  price: number;
  discountPrice?: number;
  stock: number;
  unit: string;
  weightKg: number;
  images: string[];
  originVillage: string;
  originDistrict: string;
  originState: string;
  status: 'draft' | 'active' | 'out_of_stock';
  isOrganic: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
}

export interface OrderItem {
  _id: string;
  productId: Product | string;
  productTitle: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  weightKg: number;
  status: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: User | string;
  items: OrderItem[];
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus:
    | 'placed'
    | 'confirmed'
    | 'processing'
    | 'dispatched'
    | 'in_transit'
    | 'arrived_at_hub'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  deliveryAddress: Location;
  deliveryPin: string;
  paymentMethod: 'cod' | 'razorpay' | 'upi';
  parcelId?: any;
  placedAt: string;
  deliveredAt?: string;
}

export interface Parcel {
  _id: string;
  parcelId?: string;
  parcelTrackingNumber: string;
  senderUserId?: string;
  senderName?: string;
  senderMobile?: string;
  pickupLocation?: string;
  pickupAddress?: string;

  receiverName?: string;
  receiverMobile?: string;
  deliveryLocation?: string;
  deliveryAddress?: string;

  whatIsInside?: string;
  parcelCategory?: string;
  parcelPhotoUrl?: string;
  weightKg: number;
  dimensions?: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  approximateValue?: number;
  specialInstructions?: string;

  customerOfferPrice?: number;
  preferredDeliveryDate?: string;
  preferredLogisticsType?: string;
  sendDate?: string;
  sendTime?: string;

  orderId?: any;
  orderItems?: any[];
  senderLocation?: Location;
  destinationLocation?: Location;

  status: string;
  pickupCode: string;
  handoverCode: string;
  agentHandoverCode?: string;
  deliveryPin: string;
  deliveryCode?: string;
  agentSelected?: boolean;
  agentId?: any;
  agentCode?: string;
  verificationCodes?: {
    pickup: {
      code?: string;
      status: 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED';
      verifiedAt?: string;
      verifiedBy?: any;
      verificationLocation?: string;
    };
    agentHandover?: {
      code?: string;
      status: 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED';
      verifiedAt?: string;
      verifiedBy?: any;
      verificationLocation?: string;
    };
    agent: {
      code?: string;
      status: 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED';
      verifiedAt?: string;
      verifiedBy?: any;
      verificationLocation?: string;
    };
    delivery: {
      code?: string;
      status: 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED';
      verifiedAt?: string;
      verifiedBy?: any;
      verificationLocation?: string;
    };
  };
  currentLegIndex: number;
  totalLegs: number;
  currentPartnerId?: any;
  currentAgentId?: any;
  currentVehicleId?: any;
  assignedTripId?: any;
  assignedTripCode?: string;
  assignedPartnerName?: string;
  assignedPartnerType?: string;
  assignedPartnerMobile?: string;
  pickupStopId?: string;
  pickupStopName?: string;
  pickupStopOrder?: number;
  destinationStopId?: string;
  destinationStopName?: string;
  destinationStopOrder?: number;
  expectedPickupTime?: string;
  expectedDeliveryTime?: string;
  assignedAt?: string;
  acceptedAt?: string;
  paymentMethod?: 'CASH_TO_PARTNER' | 'ONLINE_RAZORPAY' | 'NOT_SELECTED';
  paymentStatus?: 'UNPAID' | 'CASH_PENDING' | 'PAID' | 'REFUNDED';
  bookingRequestId?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParcelBookingRequest {
  _id: string;
  requestId: string;
  parcelId: any;
  parcelTrackingNumber: string;
  customerId?: any;
  customerName: string;
  customerPhone?: string;
  partnerId: any;
  partnerName: string;
  tripId: any;
  tripCode: string;
  routeTitle: string;
  routeSequence: string[];
  pickupStop: {
    stopId: string;
    name: string;
    order: number;
    expectedDeparture?: string;
  };
  destinationStop: {
    stopId: string;
    name: string;
    order: number;
    expectedArrival?: string;
  };
  parcelCategory: string;
  weightKg: number;
  dimensions?: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  declaredValue?: number;
  whatIsInside: string;
  specialInstructions?: string;
  transportMethod: string;
  methodCategory: string;
  offeredPrice: number;
  partnerEarning: number;
  bookingDate: string;
  status: 'PENDING_PARTNER_RESPONSE' | 'ACCEPTED' | 'REJECTED_BY_PARTNER' | 'EXPIRED' | 'CANCELLED_BY_CUSTOMER';
  rejectionReason?: string;
  rejectionNote?: string;
  paymentMethod?: 'CASH_TO_PARTNER' | 'ONLINE_RAZORPAY' | 'NOT_SELECTED';
  paymentStatus?: 'UNPAID' | 'CASH_PENDING' | 'PAID' | 'REFUNDED';
  expiresAt: string;
  createdAt?: string;
}

export interface ParcelEvent {
  _id: string;
  parcelTrackingNumber: string;
  eventType: string;
  timestamp: string;
  locationName: string;
  description: string;
  actorRole: string;
}

export interface ShipmentLeg {
  _id: string;
  parcelId: string;
  sequence: number;
  legType: 'FIRST_MILE_PICKUP' | 'MID_MILE_HAUL' | 'LAST_MILE_VILLAGE_DELIVERY';
  originLocation: Location;
  destinationLocation: Location;
  assignedType: 'PARTNER' | 'AGENT';
  assignedToUserId: any;
  pickupVerificationCode: string;
  handoverVerificationCode: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  distanceKm: number;
  estimatedEarnings: number;
}

export interface HandoverRecord {
  _id: string;
  parcelId: string;
  fromActorType: string;
  toActorType: string;
  handoverCodeUsed: string;
  verifiedAt: string;
  locationName?: string;
  notes?: string;
}

export interface Vehicle {
  _id: string;
  partnerId: string;
  vehicleType: string;
  registrationNumber: string;
  modelName?: string;
  model?: string;
  maxCapacityKg: number;
  currentStatus: string;
  photoUrl?: string;
  numberPlatePhotoUrl?: string;
  rcDocUrl?: string;
  driverId?: string;
  driverName?: string;
  isActive?: boolean;
}

export interface PartnerLocation {
  _id: string;
  partnerId: string;
  name: string;
  locationType: 'Home' | 'Shop' | 'Warehouse' | 'Office' | 'Hub' | 'Pickup Point' | 'Drop Point' | 'Other';
  isPickup: boolean;
  isDrop: boolean;
  address: string;
  village?: string;
  area?: string;
  block?: string;
  district: string;
  state: string;
  pinCode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactMobile?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartnerShop {
  _id: string;
  partnerId: string;
  name: string;
  photo?: string;
  ownerName: string;
  mobile: string;
  email?: string;
  address: string;
  village: string;
  area?: string;
  block?: string;
  district: string;
  state: string;
  pinCode: string;
  landmark?: string;
  shopType: string;
  openingTime?: string;
  closingTime?: string;
  availableDays?: string[];
  pickupAvailable: boolean;
  dropAvailable: boolean;
  parcelHoldingAvailable: boolean;
  holdingCapacity?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartnerDriver {
  _id: string;
  partnerId: string;
  name: string;
  phone: string;
  aadhaarNumber?: string;
  aadhaarDocUrl?: string;
  licenseNumber?: string;
  licenseDocUrl?: string;
  photoUrl?: string;
  assignedVehicleId?: any;
  assignedVehicleNumber?: string;
  status: 'active' | 'inactive' | 'on_trip';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduledStop {
  stopId: string;
  stopOrder: number;
  name: string;
  villageOrCity?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  expectedArrival: string;
  expectedDeparture?: string;
  status: string;
}

export interface LogisticsTrip {
  _id: string;
  tripId: string;
  partnerId: any;
  partnerName: string;
  partnerMobile?: string;
  partnerType?: 'PROFESSIONAL' | 'TRAVELLING';
  transportType: string;
  vehicleId?: any;
  vehicleNumber?: string;
  routeTitle: string;
  travelDate?: string;
  departureTime?: string;
  expectedArrival?: string;
  startLocation?: {
    name: string;
    villageOrCity?: string;
    address?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    departureTime: string;
    status?: string;
  };
  finalDestination?: {
    name: string;
    villageOrCity?: string;
    address?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    expectedArrival: string;
    status?: string;
  };
  stops?: ScheduledStop[];
  tripStatus: 'SCHEDULED' | 'READY' | 'MOVING' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';
  totalCapacityKg: number;
  availableCapacityKg: number;
  usedCapacityKg?: number;
  activeParcelCount?: number;
  notes?: string;
  createdAt?: string;
}

export interface LogisticsPartner {
  _id: string;
  userId: any;
  partnerCode?: string;
  businessName: string;
  partnerType: string;
  partnerCategory?: 'PROFESSIONAL' | 'TRAVELLING';
  serviceAreas: string[];
  rating: number;
  totalTrips: number;
  totalParcelsDelivered?: number;
  commissionRatePerKm?: number;
  baseDeliveryFee?: number;
  phone?: string;
  email?: string;
  address?: {
    addressLine?: string;
    village?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  primaryTransportType?: string;
  profilePhotoUrl?: string;
  walletBalance?: number;
  pendingPayouts?: number;
  isOnline?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
  };
}

export interface RouteStop {
  stopId: string;
  stopOrder: number;
  name: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  expectedArrival?: string;
  expectedDeparture?: string;
  waitingMinutes?: number;
  isActive?: boolean;
}

export interface PartnerRoute {
  _id: string;
  routeTitle: string;
  sourceLocation: Location;
  destinationLocation: Location;
  waypoints?: Location[];
  stops?: RouteStop[];
  partnerType?: string;
  scheduledFrequency?: string;
  departureTime?: string;
  finalArrivalTime?: string;
  totalDistanceKm: number;
  capacityKg?: number;
  availableCapacityKg?: number;
  pricePerKg?: number;
  status: string;
  travelDate?: string;
  vehicleType?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VillageAgent {
  _id: string;
  userId: any;
  villageName: string;
  hubCode: string;
  servingVillages: string[];
  hubAddress: Location;
  commissionPerDelivery: number;
  activeParcelsCount: number;
  cashInHand: number;
  rating: number;
  isAvailable?: boolean;
  workingHours?: string;
  totalDelivered?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessAccount {
  _id: string;
  userId?: any;
  businessName: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  businessType: string;
  gstin?: string;
  pan?: string;
  registeredAddress: Location;
  pickupLocations?: Location[];
  status?: 'active' | 'inactive' | 'suspended';
  categorySpecialty?: string[];
  rating?: number;
  totalSpend?: number;
  totalShipments?: number;
  activeShipments?: number;
  creditLimit?: number;
  createdAt?: string;
}

export interface Earning {
  _id: string;
  actorType: string;
  referenceType: string;
  referenceId: string;
  netAmount: number;
  status: string;
  remarks?: string;
  createdAt: string;
}

export interface Payout {
  _id: string;
  amount: number;
  paymentMode: string;
  beneficiaryDetails: any;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  transactionRef?: string;
  requestedAt: string;
}

export interface KycDocument {
  _id: string;
  userId: any;
  documentType: string;
  documentNumber: string;
  documentUrl: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
}

export interface MatchedDeliveryOption {
  tripId: string;
  tripMongoId: string;
  partnerId: string;
  partnerCode?: string;
  partnerName: string;
  partnerType: string;
  transportType: string;
  vehicleNumber?: string;
  methodCategory: string;
  methodBadgeColor: string;
  methodIcon: string;
  travelDate: string;
  routeTitle: string;
  routeSequence: string[];
  pickupStop: {
    stopId: string;
    name: string;
    order: number;
    expectedDeparture: string;
  };
  destinationStop: {
    stopId: string;
    name: string;
    order: number;
    expectedArrival: string;
  };
  availableCapacityKg: number;
  totalCapacityKg: number;
  estimatedDelivery: string;
  price: number;
  estimatedFare?: number;
  customerOfferPrice?: number;
  matchScore: number;
  matchExplanation: string;
  rating: number;
  totalTrips: number;
  stopsSpan: number;
}

