import { Schema, Document, model, Types } from 'mongoose';

export type AssignmentStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PICKUP_PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export interface IParcelAssignment {
  assignmentId: string;
  parcelId: Types.ObjectId;
  parcelTrackingNumber: string;
  tripId: Types.ObjectId;
  tripCode: string;
  partnerId: Types.ObjectId;
  partnerName: string;
  partnerType: string; // 'PROFESSIONAL' | 'TRAVELLING' | 'transporter' | etc.
  transportType: string; // 'Bus' | 'Bike' | 'Car' | 'Auto' | etc.
  pickupStopId: string;
  pickupStopName: string;
  pickupStopOrder: number;
  destinationStopId: string;
  destinationStopName: string;
  destinationStopOrder: number;
  expectedPickupTime: string;
  expectedDeliveryTime: string;
  weightKg: number;
  agreedPrice: number;
  assignedAt: Date;
  acceptedAt?: Date;
  status: AssignmentStatus;
  assignedByRole: 'CUSTOMER' | 'ADMIN' | 'SYSTEM';
  assignedByUserId?: Types.ObjectId;
  notes?: string;
}

export interface IParcelAssignmentDocument extends IParcelAssignment, Document {}

const ParcelAssignmentSchema = new Schema<IParcelAssignmentDocument>(
  {
    assignmentId: { type: String, required: true, unique: true, index: true },
    parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel', required: true, index: true },
    parcelTrackingNumber: { type: String, required: true, index: true },
    tripId: { type: Schema.Types.ObjectId, ref: 'LogisticsTrip', required: true, index: true },
    tripCode: { type: String, required: true, index: true },
    partnerId: { type: Schema.Types.ObjectId, ref: 'LogisticsPartner', required: true, index: true },
    partnerName: { type: String, required: true },
    partnerType: { type: String, default: 'PROFESSIONAL' },
    transportType: { type: String, default: 'Bike' },
    pickupStopId: { type: String, required: true },
    pickupStopName: { type: String, required: true },
    pickupStopOrder: { type: Number, required: true },
    destinationStopId: { type: String, required: true },
    destinationStopName: { type: String, required: true },
    destinationStopOrder: { type: Number, required: true },
    expectedPickupTime: { type: String, default: 'Flexible' },
    expectedDeliveryTime: { type: String, default: 'Flexible' },
    weightKg: { type: Number, required: true, default: 1 },
    agreedPrice: { type: Number, required: true, default: 150 },
    assignedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    status: {
      type: String,
      enum: ['ASSIGNED', 'ACCEPTED', 'REJECTED', 'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
      default: 'ASSIGNED',
      index: true,
    },
    assignedByRole: {
      type: String,
      enum: ['CUSTOMER', 'ADMIN', 'SYSTEM'],
      default: 'CUSTOMER',
    },
    assignedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
);

export const ParcelAssignment = model<IParcelAssignmentDocument>(
  'ParcelAssignment',
  ParcelAssignmentSchema
);
