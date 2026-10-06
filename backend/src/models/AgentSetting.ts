import { Schema, Document, model } from 'mongoose';

export interface IAgentSetting {
  commissionReceivedPackage: number; // default: 15 INR
  commissionDeliveredPackage: number; // default: 25 INR
  cashCollectionBonusRate: number; // default: 2 %
  maxActiveParcelsPerAgent: number; // default: 50
  maxCashInHandAllowed: number; // default: 10000 INR
  overdueStorageHours: number; // default: 48 hours
  minPayoutThreshold: number; // default: 500 INR
  autoVerifyThresholdRating: number; // default: 4.8
  smsAlertsEnabled: boolean;
  emailAlertsEnabled: boolean;
  autoAssignEnabled: boolean;
  updatedBy?: Schema.Types.ObjectId;
}

export interface IAgentSettingDocument extends IAgentSetting, Document {
  createdAt: Date;
  updatedAt: Date;
}

const AgentSettingSchema = new Schema<IAgentSettingDocument>(
  {
    commissionReceivedPackage: { type: Number, default: 15 },
    commissionDeliveredPackage: { type: Number, default: 25 },
    cashCollectionBonusRate: { type: Number, default: 2 },
    maxActiveParcelsPerAgent: { type: Number, default: 50 },
    maxCashInHandAllowed: { type: Number, default: 10000 },
    overdueStorageHours: { type: Number, default: 48 },
    minPayoutThreshold: { type: Number, default: 500 },
    autoVerifyThresholdRating: { type: Number, default: 4.8 },
    smsAlertsEnabled: { type: Boolean, default: true },
    emailAlertsEnabled: { type: Boolean, default: true },
    autoAssignEnabled: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const AgentSetting = model<IAgentSettingDocument>('AgentSetting', AgentSettingSchema);
