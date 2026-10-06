import { Schema, Document, model } from 'mongoose';

export interface ITrackingEvent {
  trackingCode: string;
  parcelId?: Schema.Types.ObjectId;
  status: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  note: string;
  updatedBy?: Schema.Types.ObjectId;
  timestamp: Date;
}

export interface ITrackingEventDocument extends ITrackingEvent, Document {}

const TrackingEventSchema = new Schema<ITrackingEventDocument>(
  {
    trackingCode: { type: String, required: true, index: true },
    parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel' },
    status: { type: String, required: true },
    locationName: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    note: { type: String, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const TrackingEvent = model<ITrackingEventDocument>('TrackingEvent', TrackingEventSchema);
