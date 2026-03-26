'use server';
import { createAdminClient } from './appwrite-server';
import { ID, Query } from 'node-appwrite';
import type { Notification } from '@/types';

export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const { databases } = createAdminClient();
    const result = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
      [Query.equal('userId', userId), Query.orderDesc('createdAt'), Query.limit(20)]
    );
    return result.documents as unknown as Notification[];
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  link?: string
) {
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

export async function notifyJobSeekersNewJob(jobId: string, jobTitle: string, company: string, location: string) {
  try {
    const { databases } = createAdminClient();
    // Fetch all job seekers
    const result = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      [Query.equal('role', 'employee'), Query.limit(500)]
    );
    // Send notification to each job seeker in parallel
    await Promise.all(
      result.documents.map((seeker: any) =>
        databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
          ID.unique(),
          {
            userId: seeker.$id,
            type: 'job',
            title: `New Job: ${jobTitle}`,
            message: `${company} is hiring in ${location}. Check it out!`,
            link: `/jobs/${jobId}`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ).catch(() => {}) // skip if one fails
      )
    );
  } catch (error) {
    console.error('Failed to notify job seekers:', error);
  }
}
