'use server';
import { createAdminClient } from './appwrite-server';
import { ID, Query } from 'node-appwrite';

export async function getNotifications(userId: string) {
  try {
    const { databases } = createAdminClient();
    const result = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
      [Query.equal('userId', userId), Query.orderDesc('createdAt'), Query.limit(20)]
    );
    return result.documents;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

export async function createNotification(userId: string, type: string, title: string, message: string, link?: string) {
  try {
    const { databases } = createAdminClient();
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        type,
        title,
        message,
        link: link || '',
        read: false,
        createdAt: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { databases } = createAdminClient();
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
      notificationId,
      { read: true }
    );
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}
