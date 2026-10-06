import { Schema, Document, model, Types } from 'mongoose';

export type LogisticsComplaintStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED';

export type LogisticsComplaintCategory =
  | 'LATE_PICKUP'
  | 'LATE_DELIVERY'
  | 'PARCEL_DAMAGE'
  | 'PARCEL_MISSING'
  | 'WRONG_HANDOVER'
  | 'PARTNER_BEHAVIOUR'
  | 'ROUTE_ISSUE'
  | 'PAYMENT_ISSUE'
  | 'OTHER';

export interface ILogisticsComplaint {
  complaintId: string;
  parcelId?: Types.ObjectId;
  parcelTrackingNumber?: string;
  partnerId: Types.ObjectId;
  customerId?: Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  category: LogisticsComplaintCategory;
  description: string;
  evidenceUrls?: string[];
  status: LogisticsComplaintStatus;
  adminNotes?: string;
  resolution?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
}

export interface ILogisticsComplaintDocument extends ILogisticsComplaint, Document {}

const LogisticsComplaintSchema = new Schema<ILogisticsComplaintDocument>(
  {
    complaintId: { type: String, required: true, unique: true, index: true },
    parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel' },
    parcelTrackingNumber: { type: String },
    partnerId: { type: Schema.Types.ObjectId, ref: 'LogisticsPartner', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, default: 'Customer' },
    customerPhone: { type: String },
    category: {
      type: String,
      enum: [
        'LATE_PICKUP',
        'LATE_DELIVERY',
        'PARCEL_DAMAGE',
        'PARCEL_MISSING',
        'WRONG_HANDOVER',
        'PARTNER_BEHAVIOUR',
        'ROUTE_ISSUE',
        'PAYMENT_ISSUE',
        'OTHER',
      ],
      default: 'OTHER',
    },
    description: { type: String, required: true },
    evidenceUrls: [{ type: String }],
    status: {
      type: String,
      enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'REJECTED'],
      default: 'OPEN',
      index: true,
    },
    adminNotes: { type: String },
    resolution: { type: String },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const LogisticsComplaint = model<ILogisticsComplaintDocument>('LogisticsComplaint', LogisticsComplaintSchema);
