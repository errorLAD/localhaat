import { Schema, Document, model } from 'mongoose';

export type KycDocType =
  | 'AADHAAR'
  | 'PAN'
  | 'DRIVING_LICENSE'
  | 'VEHICLE_RC'
  | 'VEHICLE_PHOTO'
  | 'NUMBER_PLATE'
  | 'DRIVER_AADHAAR'
  | 'DRIVER_DRIVING_LICENSE'
  | 'GSTIN'
  | 'TRADE_LICENSE';
export type KycDocStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface IKycDocument {
  userId: Schema.Types.ObjectId;
  documentType: KycDocType;
  documentNumber: string;
  documentUrl: string;
  verificationStatus: KycDocStatus;
  rejectionReason?: string;
  verifiedBy?: Schema.Types.ObjectId;
  verifiedAt?: Date;
}

export interface IKycDocumentDocument extends IKycDocument, Document {}

const KycDocumentSchema = new Schema<IKycDocumentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    documentType: {
      type: String,
      enum: [
        'AADHAAR',
        'PAN',
        'DRIVING_LICENSE',
        'VEHICLE_RC',
        'VEHICLE_PHOTO',
        'NUMBER_PLATE',
        'DRIVER_AADHAAR',
        'DRIVER_DRIVING_LICENSE',
        'GSTIN',
        'TRADE_LICENSE',
      ],
      required: true,
    },
    documentNumber: { type: String, required: true },
    documentUrl: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export const KycDocument = model<IKycDocumentDocument>('KycDocument', KycDocumentSchema);
