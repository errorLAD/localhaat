import { Schema, Document, model, Types } from 'mongoose';

export type BookingRequestStatus =
  | 'PENDING_PARTNER_RESPONSE'
  | 'ACCEPTED'
  | 'REJECTED_BY_PARTNER'
  | 'EXPIRED'
  | 'CANCELLED_BY_CUSTOMER';

export interface IParcelBookingRequest {
  requestId: string; // e.g. REQ-102938
  parcelId: Types.ObjectId;
  parcelTrackingNumber: string;
  customerId: Types.ObjectId;
  customerName: string;
  customerPhone?: string;

  partnerId: Types.ObjectId;
  partnerUserId?: Types.ObjectId;
  partnerName: string;

  tripId: Types.ObjectId;
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
  dimensions: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  declaredValue: number;
  whatIsInside: string;
  specialInstructions?: string;

  transportMethod: string;
  methodCategory: string;

  offeredPrice: number; // Locked price offered to partner
  partnerEarning: number; // Earning calculated for partner

  bookingDate: string;
  status: BookingRequestStatus;
  rejectionReason?: string;
  rejectionNote?: string;

  expiresAt: Date;
  respondedAt?: Date;

  paymentMethod?: 'CASH_TO_PARTNER' | 'ONLINE_RAZORPAY' | 'NOT_SELECTED';
  paymentStatus?: 'UNPAID' | 'CASH_PENDING' | 'PAID' | 'REFUNDED';
}

export interface IParcelBookingRequestDocument extends IParcelBookingRequest, Document {}

const ParcelBookingRequestSchema = new Schema<IParcelBookingRequestDocument>(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel', required: true, index: true },
    parcelTrackingNumber: { type: String, required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerName: { type: String, required: true, default: 'Customer' },
    customerPhone: { type: String, default: '' },

    partnerId: { type: Schema.Types.ObjectId, ref: 'LogisticsPartner', required: true, index: true },
    partnerUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    partnerName: { type: String, required: true },

    tripId: { type: Schema.Types.ObjectId, ref: 'LogisticsTrip', required: true, index: true },
    tripCode: { type: String, required: true },
    routeTitle: { type: String, required: true },
    routeSequence: [{ type: String }],

    pickupStop: {
      stopId: { type: String, required: true },
      name: { type: String, required: true },
      order: { type: Number, required: true },
      expectedDeparture: { type: String },
    },
    destinationStop: {
      stopId: { type: String, required: true },
      name: { type: String, required: true },
      order: { type: Number, required: true },
      expectedArrival: { type: String },
    },

    parcelCategory: { type: String, default: 'General' },
    weightKg: { type: Number, required: true, default: 1 },
    dimensions: {
      lengthCm: { type: Number, default: 20 },
      widthCm: { type: Number, default: 20 },
      heightCm: { type: Number, default: 20 },
    },
    declaredValue: { type: Number, default: 500 },
    whatIsInside: { type: String, default: 'Goods' },
    specialInstructions: { type: String },

    transportMethod: { type: String, default: 'Bike' },
    methodCategory: { type: String, default: 'PROFESSIONAL LOGISTICS' },

    offeredPrice: { type: Number, required: true },
    partnerEarning: { type: Number, required: true },

    bookingDate: { type: String, required: true, default: 'Today' },
    status: {
      type: String,
      enum: ['PENDING_PARTNER_RESPONSE', 'ACCEPTED', 'REJECTED_BY_PARTNER', 'EXPIRED', 'CANCELLED_BY_CUSTOMER'],
      default: 'PENDING_PARTNER_RESPONSE',
      index: true,
    },
    rejectionReason: { type: String },
    rejectionNote: { type: String },

    expiresAt: { type: Date, required: true, index: true },
    respondedAt: { type: Date },

    paymentMethod: {
      type: String,
      enum: ['CASH_TO_PARTNER', 'ONLINE_RAZORPAY', 'NOT_SELECTED'],
      default: 'NOT_SELECTED',
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'CASH_PENDING', 'PAID', 'REFUNDED'],
      default: 'UNPAID',
    },
  },
  { timestamps: true }
);

export const ParcelBookingRequest = model<IParcelBookingRequestDocument>(
  'ParcelBookingRequest',
  ParcelBookingRequestSchema
);
