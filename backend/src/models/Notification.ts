import { Schema, Document, model } from 'mongoose';

export type NotificationType = 'IN_APP' | 'SMS' | 'WHATSAPP' | 'PUSH';

export interface INotification {
  userId: Schema.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  channel?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  sentAt: Date;
}

export interface INotificationDocument extends INotification, Document {}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['IN_APP', 'SMS', 'WHATSAPP', 'PUSH'],
      default: 'IN_APP',
      index: true,
    },
    channel: { type: String },
    isRead: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Notification = model<INotificationDocument>('Notification', NotificationSchema);
