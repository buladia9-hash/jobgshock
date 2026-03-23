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

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    try {
      await account.deleteSession('current');
    } catch {}
    await account.createEmailPasswordSession(email, password);
    const accountData = await account.get();
    const userDoc = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      [Query.equal('email', email)]
    );
    const userData: any = userDoc.documents[0];
    if (!userData) throw new Error('User account not found');
    set({ user: {
      ...userData,
      role: userData.role || 'employee',
      skills: userData.skills ? userData.skills.split(',').map((s: string) => s.trim()) : []
    } as User });
  },

  register: async (email, password, name, role) => {
    try {
      await account.deleteSession('current');
    } catch {}
    const acc = await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    const userDoc = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      ID.unique(),
      { email, name, role, skills: '', createdAt: new Date().toISOString() }
    );
    const userData: any = userDoc;
    set({ user: {
      ...userData,
      skills: []
    } as User });
  },

  logout: async () => {
    await account.deleteSession('current');
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const accountData = await account.get();
      const userDoc = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        [Query.equal('email', accountData.email)]
      );
      const userData: any = userDoc.documents[0];
      if (!userData) { set({ user: null, loading: false }); return; }
      set({ user: {
        ...userData,
        role: userData.role || 'employee',
        skills: userData.skills ? userData.skills.split(',').map((s: string) => s.trim()) : []
      } as User, loading: false });
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
    const userData: any = updated;
    set({ user: {
      ...userData,
      skills: userData.skills ? userData.skills.split(',').map((s: string) => s.trim()) : []
    } as User });
  }
}));
