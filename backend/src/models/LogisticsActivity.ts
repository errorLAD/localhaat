import { Schema, Document, model } from 'mongoose';

export interface ILogisticsActivity {
  partnerId?: Schema.Types.ObjectId;
  parcelId?: Schema.Types.ObjectId;
  tripId?: Schema.Types.ObjectId;
  actionType: string;
  title: string;
  description: string;
  actorType: 'ADMIN' | 'PARTNER' | 'SYSTEM';
  actorId?: Schema.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

export interface ILogisticsActivityDocument extends ILogisticsActivity, Document {}

const LogisticsActivitySchema = new Schema<ILogisticsActivityDocument>(
  {
    partnerId: { type: Schema.Types.ObjectId, ref: 'LogisticsPartner', index: true },
    parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel', index: true },
    tripId: { type: Schema.Types.ObjectId, ref: 'LogisticsTrip', index: true },
    actionType: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    actorType: { type: String, enum: ['ADMIN', 'PARTNER', 'SYSTEM'], default: 'SYSTEM' },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const LogisticsActivity = model<ILogisticsActivityDocument>('LogisticsActivity', LogisticsActivitySchema);
