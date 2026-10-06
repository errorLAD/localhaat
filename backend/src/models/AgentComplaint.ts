import { Schema, Document, model } from 'mongoose';

export type ComplaintCategory =
  | 'DELAY'
  | 'BEHAVIOR'
  | 'DAMAGED_PACKAGE'
  | 'OVERCHARGED'
  | 'MISSED_DELIVERY'
  | 'LOST_PACKAGE'
  | 'OTHER';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ComplaintStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface IAgentComplaint {
  ticketNumber: string;
  agentId: Schema.Types.ObjectId;
  customerId: Schema.Types.ObjectId;
  parcelId?: Schema.Types.ObjectId;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  subject: string;
  description: string;
  status: ComplaintStatus;
  resolutionNotes?: string;
  resolvedBy?: Schema.Types.ObjectId;
  resolvedAt?: Date;
}

export interface IAgentComplaintDocument extends IAgentComplaint, Document {
  createdAt: Date;
  updatedAt: Date;
}

const AgentComplaintSchema = new Schema<IAgentComplaintDocument>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    agentId: { type: Schema.Types.ObjectId, ref: 'VillageAgent', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel' },
    category: {
      type: String,
      enum: ['DELAY', 'BEHAVIOR', 'DAMAGED_PACKAGE', 'OVERCHARGED', 'MISSED_DELIVERY', 'LOST_PACKAGE', 'OTHER'],
      default: 'DELAY',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'],
      default: 'OPEN',
      index: true,
    },
    resolutionNotes: { type: String },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const AgentComplaint = model<IAgentComplaintDocument>('AgentComplaint', AgentComplaintSchema);
