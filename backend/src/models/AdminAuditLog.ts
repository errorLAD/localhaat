import { Schema, Document, model } from 'mongoose';

export type AuditTargetType =
  | 'AGENT'
  | 'PAYOUT'
  | 'KYC'
  | 'REVIEW'
  | 'COMPLAINT'
  | 'SETTING'
  | 'PARCEL'
  | 'LOGISTICS'
  | 'PARTNER'
  | 'USER';

export interface IAdminAuditLog {
  adminId: Schema.Types.ObjectId;
  adminName?: string;
  adminPhone?: string;
  action: string;
  targetType: AuditTargetType;
  targetId: string;
  targetName?: string;
  reason?: string;
  details?: Record<string, any> | string;
  ipAddress?: string;
}

export interface IAdminAuditLogDocument extends IAdminAuditLog, Document {
  createdAt: Date;
  updatedAt: Date;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLogDocument>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    adminName: { type: String },
    adminPhone: { type: String },
    action: { type: String, required: true, index: true },
    targetType: {
      type: String,
      enum: ['AGENT', 'PAYOUT', 'KYC', 'REVIEW', 'COMPLAINT', 'SETTING', 'PARCEL', 'LOGISTICS', 'PARTNER', 'USER'],
      required: true,
      index: true,
    },
    targetId: { type: String, required: true, index: true },
    targetName: { type: String },
    reason: { type: String },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

export const AdminAuditLog = model<IAdminAuditLogDocument>('AdminAuditLog', AdminAuditLogSchema);
