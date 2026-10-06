import { Schema, Document, model } from 'mongoose';

export type ParcelEventType =
  | 'CREATED'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'DEPARTED_SELLER'
  | 'RECEIVED_AT_HUB'
  | 'IN_TRANSIT'
  | 'HANDOVER_TO_VILLAGE_AGENT'
  | 'ARRIVED_AT_VILLAGE_HUB'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'EXCEPTION';

export interface IParcelEvent {
  parcelId: Schema.Types.ObjectId;
  parcelTrackingNumber: string;
  eventType: ParcelEventType;
  timestamp: Date;
  locationName: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  description: string;
  actorId?: Schema.Types.ObjectId;
  actorRole: string;
  proofImageUrl?: string;
  signature?: string;
  metadata?: Record<string, any>;
}

export interface IParcelEventDocument extends IParcelEvent, Document {}

const ParcelEventSchema = new Schema<IParcelEventDocument>(
  {
    parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel', required: true, index: true },
    parcelTrackingNumber: { type: String, required: true, index: true },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: { type: Date, default: Date.now },
    locationName: { type: String, required: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    description: { type: String, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorRole: { type: String, required: true },
    proofImageUrl: { type: String },
    signature: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const ParcelEvent = model<IParcelEventDocument>('ParcelEvent', ParcelEventSchema);
