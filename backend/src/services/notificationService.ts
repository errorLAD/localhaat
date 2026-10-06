import { Notification, NotificationType } from '../models/Notification.js';
import { emitToUser } from './socketService.js';
import mongoose from 'mongoose';

export class NotificationService {
  /**
   * Dispatches an alert across in-app and simulated SMS/WhatsApp channels
   */
  static async sendNotification({
    userId,
    title,
    message,
    type = 'IN_APP',
    metadata = {},
  }: {
    userId: string | mongoose.Types.ObjectId;
    title: string;
    message: string;
    type?: NotificationType;
    metadata?: Record<string, any>;
  }) {
    try {
      const doc = await Notification.create({
        userId,
        title,
        message,
        type,
        metadata,
        sentAt: new Date(),
      });

      // Emit real-time notification to user's personal room
      emitToUser(userId.toString(), 'notification:new', {
        id: doc._id,
        title,
        message,
        type,
        sentAt: doc.sentAt,
        metadata,
      });

      console.log(`[Notification Service] [${type}] To User ${userId}: ${title} - ${message}`);
      return doc;
    } catch (err) {
      console.error('[Notification Service] Error sending notification:', err);
      return null;
    }
  }
}
