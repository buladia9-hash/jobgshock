'use server';
import { createAdminClient } from './appwrite-server';
import { ID } from 'node-appwrite';
import { cookies } from 'next/headers';

export async function registerUser(email: string, password: string, name: string, role: 'employee' | 'recruiter') {
  const { account, databases } = createAdminClient();
  
  const user = await account.create(ID.unique(), email, password, name);
  
  const session = await account.createEmailPasswordSession(email, password);
  
  cookies().set('session', session.secret, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  
  await databases.createDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
    ID.unique(),
    { email, name, role, skills: '', createdAt: new Date().toISOString() }
  );
  
  return { success: true, userId: user.$id };
}

export async function loginUser(email: string, password: string) {
  const { account, databases } = createAdminClient();
  
  const session = await account.createEmailPasswordSession(email, password);
  
  cookies().set('session', session.secret, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  
  return { success: true };
}

export async function logoutUser() {
  cookies().delete('session');
  return { success: true };
}
