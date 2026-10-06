import { Schema, Document, model } from 'mongoose';

export type AgentActivityType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOCATION_UPDATE'
  | 'STATUS_CHANGE'
  | 'PACKAGE_RECEIVED'
  | 'PACKAGE_DISPATCHED'
  | 'DELIVERY_COMPLETED'
  | 'DELIVERY_FAILED'
  | 'CASH_COLLECTED'
  | 'PAYOUT_REQUEST'
  | 'DOCUMENT_UPLOADED';

export interface IAgentActivity {
  agentId: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  activityType: AgentActivityType;
  title: string;
  description?: string;
  parcelId?: Schema.Types.ObjectId;
  metadata?: Record<string, any>;
  ipAddress?: string;
  device?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface IAgentActivityDocument extends IAgentActivity, Document {
  createdAt: Date;
  updatedAt: Date;
}

const AgentActivitySchema = new Schema<IAgentActivityDocument>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: 'VillageAgent', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    activityType: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'LOCATION_UPDATE',
        'STATUS_CHANGE',
        'PACKAGE_RECEIVED',
        'PACKAGE_DISPATCHED',
        'DELIVERY_COMPLETED',
        'DELIVERY_FAILED',
        'CASH_COLLECTED',
        'PAYOUT_REQUEST',
        'DOCUMENT_UPLOADED',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel' },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    device: { type: String },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  { timestamps: true }
);

export const AgentActivity = model<IAgentActivityDocument>('AgentActivity', AgentActivitySchema);
