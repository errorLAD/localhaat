import { Schema, Document, model, Types } from 'mongoose';
import { ILocation, LocationSchema } from './Location.js';

export type ParcelStatus =
  | 'CREATED'
  | 'SEARCHING_FOR_PARTNER'
  | 'PARTNER_ASSIGNED'
  | 'PARTNER_ACCEPTED'
  | 'PICKUP_PENDING'
  | 'PARTNER_AT_PICKUP'
  | 'PICKUP_CODE_VERIFIED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVING_AT_STOP'
  | 'ARRIVED_AT_STOP'
  | 'DROPPED_AT_DESTINATION_STOP'
  | 'HANDOVER_PENDING'
  | 'RECEIVED_BY_AGENT'
  | 'AT_AGENT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED_DELIVERY'
  | 'RETURNED'
  | 'CANCELLED'
  | 'created'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'in_transit'
  | 'arrived_at_village_hub'
  | 'out_for_delivery'
  | 'delivered'
  | 'returned';

export type VerificationCodeStatus = 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED';

export interface IVerificationCodeItem {
  code: string; // 4-digit numeric code
  codeHash?: string;
  status: VerificationCodeStatus;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId | string;
  verifiedByRole?: string;
  verificationLocation?: string;
}

export interface IParcelVerificationCodes {
  pickup: IVerificationCodeItem;
  agentHandover?: IVerificationCodeItem;
  agent?: IVerificationCodeItem;
  delivery: IVerificationCodeItem;
}

export interface IParcel {
  parcelId: string; // e.g. LH-PKG-102938
  parcelTrackingNumber: string; // e.g. LH-TRK-904128
  senderUserId?: Types.ObjectId;
  senderName: string;
  senderMobile: string;
  pickupLocation: string; // City / Village name
  pickupAddress: string;

  receiverName: string;
  receiverMobile: string;
  deliveryLocation: string; // City / Village name
  deliveryAddress: string;

  whatIsInside: string;
  parcelCategory: string;
  parcelPhotoUrl?: string;
  weightKg: number;
  dimensions: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  approximateValue?: number;
  specialInstructions?: string;

  customerOfferPrice: number;
  preferredDeliveryDate?: string;
  preferredLogisticsType: string;
  sendDate?: string;
  sendTime?: string;

  orderId?: Types.ObjectId;
  orderItems?: Types.ObjectId[];
  senderLocation?: ILocation;
  destinationLocation?: ILocation;

  status: ParcelStatus;
  pickupCode: string; // 4-digit code for sender -> partner handover
  handoverCode: string; // 4-digit code for partner -> village agent handover
  deliveryPin: string; // 4-digit PIN for receiver final delivery
  agentSelected?: boolean;
  agentId?: Types.ObjectId;
  agentCode?: string;
  verificationCodes?: IParcelVerificationCodes;
  currentLegIndex: number;
  totalLegs: number;
  currentPartnerId?: Types.ObjectId;
  currentAgentId?: Types.ObjectId;
  currentVehicleId?: Types.ObjectId;
  shipmentId?: Types.ObjectId;
  businessAccountId?: Types.ObjectId;
  assignedTripId?: Types.ObjectId;
  assignedTripCode?: string;
  pickupStopId?: string;
  pickupStopName?: string;
  pickupStopOrder?: number;
  destinationStopId?: string;
  destinationStopName?: string;
  destinationStopOrder?: number;
  expectedPickupTime?: string;
  expectedDeliveryTime?: string;
  assignedAt?: Date;
  acceptedAt?: Date;
  paymentMethod?: 'CASH_TO_PARTNER' | 'ONLINE_RAZORPAY' | 'NOT_SELECTED';
  paymentStatus?: 'UNPAID' | 'CASH_PENDING' | 'PAID' | 'REFUNDED';
  bookingRequestId?: Types.ObjectId;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IParcelDocument extends IParcel, Document {}

const ParcelSchema = new Schema<IParcelDocument>(
  {
    parcelId: { type: String, required: true, unique: true, index: true },
    parcelTrackingNumber: { type: String, required: true, unique: true, index: true },
    senderUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    senderName: { type: String, required: true, default: 'Sender' },
    senderMobile: { type: String, required: true, default: '9999900000' },
    pickupLocation: { type: String, required: true, default: 'Origin' },
    pickupAddress: { type: String, required: true, default: 'Origin Address' },

    receiverName: { type: String, required: true, default: 'Receiver' },
    receiverMobile: { type: String, required: true, default: '9999900000' },
    deliveryLocation: { type: String, required: true, default: 'Destination' },
    deliveryAddress: { type: String, required: true, default: 'Destination Address' },

    whatIsInside: { type: String, required: true, default: 'General Goods' },
    parcelCategory: { type: String, default: 'General' },
    parcelPhotoUrl: { type: String },
    weightKg: { type: Number, required: true, default: 1.0 },
    dimensions: {
      lengthCm: { type: Number, default: 20 },
      widthCm: { type: Number, default: 20 },
      heightCm: { type: Number, default: 20 },
    },
    approximateValue: { type: Number, default: 500 },
    specialInstructions: { type: String },

    customerOfferPrice: { type: Number, required: true, default: 150 },
    preferredDeliveryDate: { type: String },
    preferredLogisticsType: { type: String, default: 'Bike' },
    sendDate: { type: String, default: 'Today' },
    sendTime: { type: String, default: 'Flexible' },

    orderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
    orderItems: [{ type: Schema.Types.ObjectId, ref: 'OrderItem' }],
    senderLocation: { type: LocationSchema },
    destinationLocation: { type: LocationSchema },
    status: {
      type: String,
      default: 'SEARCHING_FOR_PARTNER',
      index: true,
    },
    pickupCode: { type: String, required: true },
    handoverCode: { type: String, required: true },
    deliveryPin: { type: String, required: true },
    agentSelected: { type: Boolean, default: false },
    agentId: { type: Schema.Types.ObjectId, ref: 'VillageAgent' },
    agentCode: { type: String },
    verificationCodes: {
      pickup: {
        code: { type: String },
        codeHash: { type: String },
        status: { type: String, enum: ['NOT_REQUIRED', 'PENDING', 'VERIFIED'], default: 'PENDING' },
        verifiedAt: { type: Date },
        verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        verifiedByRole: { type: String },
        verificationLocation: { type: String },
      },
      agentHandover: {
        code: { type: String },
        codeHash: { type: String },
        status: { type: String, enum: ['NOT_REQUIRED', 'PENDING', 'VERIFIED'], default: 'NOT_REQUIRED' },
        verifiedAt: { type: Date },
        verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        verifiedByRole: { type: String },
        verificationLocation: { type: String },
      },
      agent: {
        code: { type: String },
        codeHash: { type: String },
        status: { type: String, enum: ['NOT_REQUIRED', 'PENDING', 'VERIFIED'], default: 'NOT_REQUIRED' },
        verifiedAt: { type: Date },
        verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        verifiedByRole: { type: String },
        verificationLocation: { type: String },
      },
      delivery: {
        code: { type: String },
        codeHash: { type: String },
        status: { type: String, enum: ['NOT_REQUIRED', 'PENDING', 'VERIFIED'], default: 'PENDING' },
        verifiedAt: { type: Date },
        verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        verifiedByRole: { type: String },
        verificationLocation: { type: String },
      },
    },
    currentLegIndex: { type: Number, default: 0 },
    totalLegs: { type: Number, default: 3 },
    currentPartnerId: { type: Schema.Types.ObjectId, ref: 'LogisticsPartner' },
    currentAgentId: { type: Schema.Types.ObjectId, ref: 'VillageAgent' },
    currentVehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment' },
    businessAccountId: { type: Schema.Types.ObjectId, ref: 'BusinessAccount', index: true },
    assignedTripId: { type: Schema.Types.ObjectId, ref: 'LogisticsTrip', index: true },
    assignedTripCode: { type: String, index: true },
    pickupStopId: { type: String },
    pickupStopName: { type: String },
    pickupStopOrder: { type: Number },
    destinationStopId: { type: String },
    destinationStopName: { type: String },
    destinationStopOrder: { type: Number },
    expectedPickupTime: { type: String },
    expectedDeliveryTime: { type: String },
    assignedAt: { type: Date },
    acceptedAt: { type: Date },
    paymentMethod: {
      type: String,
      enum: ['CASH_TO_PARTNER', 'ONLINE_RAZORPAY', 'NOT_SELECTED'],
      default: 'NOT_SELECTED',
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'CASH_PENDING', 'PAID', 'REFUNDED'],
      default: 'UNPAID',
      index: true,
    },
    bookingRequestId: { type: Schema.Types.ObjectId, ref: 'ParcelBookingRequest', index: true },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const Parcel = model<IParcelDocument>('Parcel', ParcelSchema);
