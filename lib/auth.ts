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

const AUTH_STORAGE_KEY = 'job-portal-auth-user';

function extractRole(value: unknown): 'employee' | 'recruiter' | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'employee' || normalized === 'recruiter') return normalized;
  return undefined;
}

function getCachedUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) as User : null;
  } catch {
    return null;
  }
}

function setCachedUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (!user) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

async function syncRoleSources(accountId: string, role: 'employee' | 'recruiter') {
  try {
    await account.updatePrefs({ role });
  } catch {}

  try {
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      accountId,
      { role }
    );
  } catch {}
}

async function inferRoleFromActivity(accountId: string): Promise<'employee' | 'recruiter' | undefined> {
  try {
    const recruiterJobs = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
      [Query.equal('recruiterId', accountId), Query.limit(1)]
    );
    if (recruiterJobs.total > 0) return 'recruiter';
  } catch {}

  try {
    const employeeApplications = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
      [Query.equal('employeeId', accountId), Query.limit(1)]
    );
    if (employeeApplications.total > 0) return 'employee';
  } catch {}

  return undefined;
}

function normalizeUser(
  userData: any,
  fallbackUser?: User | null,
  accountRole?: 'employee' | 'recruiter'
): User {
  const role = accountRole || extractRole(userData?.role) || fallbackUser?.role || 'employee';
  const skills = Array.isArray(userData?.skills)
    ? userData.skills
    : typeof userData?.skills === 'string'
      ? userData.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : fallbackUser?.skills || [];
  return {
    ...fallbackUser,
    ...userData,
    role,
    skills
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
    [Query.equal('email', accountData.email), Query.limit(10)]
  );

  return (
    userDoc.documents.find((doc: any) => doc.$id === accountData.$id) ||
    userDoc.documents.find((doc: any) => doc.role === 'recruiter' || doc.role === 'employee') ||
    userDoc.documents[0] ||
    null
  );
}

export const useAuth = create<AuthState>((set) => ({
  user: getCachedUser(),
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
      const accountRole = extractRole(accountData?.prefs?.role);
      const fallbackUser = useAuth.getState().user;
      const inferredRole = await inferRoleFromActivity(accountData.$id);
      const normalizedUser = normalizeUser(userData, fallbackUser, accountRole || inferredRole);
      if (!accountRole || accountRole !== normalizedUser.role || extractRole(userData?.role) !== normalizedUser.role) {
        await syncRoleSources(accountData.$id, normalizedUser.role);
      }
      setCachedUser(normalizedUser);
      set({ user: normalizedUser, loading: false });
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
      await syncRoleSources(acc.$id, role);
      const normalizedUser = normalizeUser(userDoc, null, role);
      setCachedUser(normalizedUser);
      set({ user: normalizedUser, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    await account.deleteSession('current');
    setCachedUser(null);
    set({ user: null, loading: false });
  },

  checkAuth: async () => {
    set({ loading: true });
    try {
      const accountData = await account.get();
      const userData: any = await resolveUserDocument(accountData);
      if (!userData) {
        setCachedUser(null);
        set({ user: null, loading: false });
        return;
      }
      const fallbackUser = useAuth.getState().user || getCachedUser();
      const cachedRoleMatchesAccount = fallbackUser?.$id === accountData.$id ? fallbackUser.role : undefined;
      const inferredRole = await inferRoleFromActivity(accountData.$id);
      const accountRole = extractRole(accountData?.prefs?.role) || inferredRole || cachedRoleMatchesAccount;
      const normalizedUser = normalizeUser(userData, fallbackUser, accountRole);
      if (!extractRole(accountData?.prefs?.role) || extractRole(userData?.role) !== normalizedUser.role) {
        await syncRoleSources(accountData.$id, normalizedUser.role);
      }
      setCachedUser(normalizedUser);
      set({ user: normalizedUser, loading: false });
    } catch {
      setCachedUser(null);
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
    const normalizedUser = normalizeUser(updated, currentUser, extractRole(data.role) || currentUser.role);
    await syncRoleSources(currentUser.$id, normalizedUser.role);
    setCachedUser(normalizedUser);
    set({ user: normalizedUser });
  }
}));
