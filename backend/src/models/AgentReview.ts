import { Schema, Document, model } from 'mongoose';

export type AgentReviewStatus = 'APPROVED' | 'HIDDEN' | 'PENDING';

export interface IAgentReview {
  agentId: Schema.Types.ObjectId;
  customerId: Schema.Types.ObjectId;
  parcelId?: Schema.Types.ObjectId;
  rating: number; // 1 to 5
  comment: string;
  status: AgentReviewStatus;
  hiddenReason?: string;
  moderatedBy?: Schema.Types.ObjectId;
  moderatedAt?: Date;
}

export interface IAgentReviewDocument extends IAgentReview, Document {
  createdAt: Date;
  updatedAt: Date;
}

const AgentReviewSchema = new Schema<IAgentReviewDocument>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: 'VillageAgent', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: {
      type: String,
      enum: ['APPROVED', 'HIDDEN', 'PENDING'],
      default: 'APPROVED',
      index: true,
    },
    hiddenReason: { type: String },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date },
  },
  { timestamps: true }
);

export const AgentReview = model<IAgentReviewDocument>('AgentReview', AgentReviewSchema);
