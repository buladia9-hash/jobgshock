import { create } from 'zustand';
import { account, databases } from './appwrite';
import { User } from '@/types';
import { ID, Query } from 'appwrite';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'employee' | 'recruiter') => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

function normalizeUser(userData: any): User {
  const role = userData.role === 'recruiter' ? 'recruiter' : 'employee';
  return {
    ...userData,
    role,
    skills: userData.skills ? userData.skills.split(',').map((s: string) => s.trim()) : []
  } as User;
}

async function resolveUserDocument(accountData: any) {
  try {
    return await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      accountData.$id
    );
  } catch {}

  const userDoc = await databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
    [Query.equal('email', accountData.email), Query.limit(1)]
  );

  return userDoc.documents[0] || null;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    set({ loading: true });
    try {
      await account.deleteSession('current');
    } catch {}
    try {
      await account.createEmailPasswordSession(email, password);
      const accountData = await account.get();
      const userData: any = await resolveUserDocument(accountData);
      if (!userData) throw new Error('User account not found');
      set({ user: normalizeUser(userData), loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (email, password, name, role) => {
    set({ loading: true });
    try {
      await account.deleteSession('current');
    } catch {}
    try {
      const acc = await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      const userDoc = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        acc.$id,
        { email, name, role, skills: '', createdAt: new Date().toISOString() }
      );
      set({ user: normalizeUser(userDoc), loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    await account.deleteSession('current');
    set({ user: null, loading: false });
  },

  checkAuth: async () => {
    set({ loading: true });
    try {
      const accountData = await account.get();
      const userData: any = await resolveUserDocument(accountData);
      if (!userData) { set({ user: null, loading: false }); return; }
      set({ user: normalizeUser(userData), loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  updateProfile: async (data) => {
    const currentUser = useAuth.getState().user;
    if (!currentUser) return;
    const updateData: any = { ...data };
    if (data.skills) updateData.skills = data.skills.join(',');
    const updated = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      currentUser.$id,
      updateData
    );
    set({ user: normalizeUser(updated) });
  }
}));
