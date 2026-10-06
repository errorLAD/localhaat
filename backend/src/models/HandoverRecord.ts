import { Schema, Document, model } from 'mongoose';

export type ActorRoleType = 'SELLER' | 'PARTNER' | 'HUB' | 'AGENT' | 'CUSTOMER';
export type HandoverCodeType = 'PICKUP_CODE' | 'AGENT_CODE' | 'AGENT_HANDOVER' | 'DELIVERY_CODE' | 'MANUAL_CONFIRMATION' | 'MANUAL_AGENT_HANDOVER';

export interface IHandoverRecord {
  parcelId: Schema.Types.ObjectId;
  shipmentLegId?: Schema.Types.ObjectId;
  fromActorType: ActorRoleType;
  fromActorId: Schema.Types.ObjectId;
  toActorType: ActorRoleType;
  toActorId: Schema.Types.ObjectId;
  handoverCodeUsed: string;
  codeType?: HandoverCodeType;
  status?: 'PENDING' | 'VERIFIED';
  verifiedAt: Date;
  signatureOrPhotoUrl?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  notes?: string;
}

export interface IHandoverRecordDocument extends IHandoverRecord, Document {}

const HandoverRecordSchema = new Schema<IHandoverRecordDocument>(
  {
    parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel', required: true, index: true },
    shipmentLegId: { type: Schema.Types.ObjectId, ref: 'ShipmentLeg' },
    fromActorType: {
      type: String,
      enum: ['SELLER', 'PARTNER', 'HUB', 'AGENT', 'CUSTOMER'],
      required: true,
    },
    fromActorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toActorType: {
      type: String,
      enum: ['SELLER', 'PARTNER', 'HUB', 'AGENT', 'CUSTOMER'],
      required: true,
    },
    toActorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    handoverCodeUsed: { type: String, required: true },
    codeType: {
      type: String,
      enum: ['PICKUP_CODE', 'AGENT_CODE', 'AGENT_HANDOVER', 'DELIVERY_CODE', 'MANUAL_CONFIRMATION', 'MANUAL_AGENT_HANDOVER'],
      default: 'AGENT_CODE',
    },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED'],
      default: 'VERIFIED',
    },
    verifiedAt: { type: Date, default: Date.now },
    signatureOrPhotoUrl: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    locationName: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const HandoverRecord = model<IHandoverRecordDocument>('HandoverRecord', HandoverRecordSchema);
