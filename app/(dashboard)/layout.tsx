'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { getNotifications, markNotificationAsRead } from '@/lib/notification-actions';
import type { Notification } from '@/types';
import {
  Briefcase, LayoutDashboard, FileText, User, LogOut,
  PlusCircle, Bell, X, Users, Settings, Menu, MessageSquare
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, checkAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);
  useEffect(() => { if (user) { loadNotifications(); } }, [user]);

  // Poll notifications every 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setShowHeaderMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setShowHeaderMenu(false);
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  const loadNotifications = async () => {
    if (!user) return;
    const notifs = await getNotifications(user.$id);
    setNotifications(notifs);
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.$id);
      await loadNotifications();
    }
    if (notif.link) router.push(notif.link);
    setShowHeaderMenu(false);
  };

  const handleLogout = async () => { await logout(); router.push('/'); };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => markNotificationAsRead(n.$id)));
    await loadNotifications();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
  if (!user) return null;

  const recruiterNav = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/jobs', icon: Briefcase, label: 'My Jobs' },
    { href: '/jobs/create', icon: PlusCircle, label: 'Post a Job' },
    { href: '/applications', icon: Users, label: 'Applications' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/profile', icon: User, label: 'Company Profile' },
  ];

  const employeeNav = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/jobs', icon: Briefcase, label: 'Browse Jobs' },
    { href: '/applications', icon: FileText, label: 'My Applications' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/profile', icon: User, label: 'My Profile' },
    { href: '/profile?tab=settings', icon: Settings, label: 'Settings' },
  ];

  const navItems = user.role === 'recruiter' ? recruiterNav : employeeNav;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {mobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-gray-900/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex h-full w-72 flex-col border-r bg-white transition-all duration-300 lg:w-auto lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${desktopSidebarOpen ? 'lg:w-64' : 'lg:w-20'}`}
      >
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            {desktopSidebarOpen && <span className="hidden text-xl font-bold text-gray-900 lg:inline">JobPortal</span>}
            <span className="text-xl font-bold text-gray-900 lg:hidden">JobPortal</span>
          </Link>
          <button
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
            className="hidden text-gray-400 hover:text-gray-600 lg:inline-flex"
            aria-label={desktopSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600 lg:hidden"
            aria-label="Close mobile sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge */}
        <div className={`px-4 py-3 border-b ${desktopSidebarOpen ? 'lg:block' : 'lg:hidden'}`}>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${user.role === 'recruiter' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
            {user.role === 'recruiter' ? 'Recruiter Account' : 'Job Seeker Account'}
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href.split('?')[0];
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                aria-label={item.label}
                title={!desktopSidebarOpen ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
                <span className={`text-sm ${desktopSidebarOpen ? 'lg:inline' : 'lg:hidden'}`}>{item.label}</span>
                {item.label === 'Post a Job' && (
                  <span className={`ml-auto bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full ${desktopSidebarOpen ? 'lg:inline-flex' : 'lg:hidden'}`}>
                    New
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile at bottom */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={`flex-1 min-w-0 ${desktopSidebarOpen ? 'lg:block' : 'lg:hidden'}`}>
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${desktopSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Navbar */}
        <header className="bg-white border-b px-4 py-3 sm:px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-800 sm:text-lg">
              {user.role === 'recruiter' ? 'Recruiter Dashboard' : 'Job Seeker Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={headerMenuRef}>
              <button
                onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                className="relative inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                aria-expanded={showHeaderMenu}
                aria-label="Toggle header menu"
              >
                {showHeaderMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                <span className="hidden sm:inline">Menu</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showHeaderMenu && (
                <div className="absolute right-0 top-14 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-white shadow-xl">
                  <div className="border-b px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">Quick Menu</h3>
                        <p className="mt-1 text-xs text-gray-500">Open actions only when you need them.</p>
                      </div>
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="border-b p-3">
                    <div className="grid gap-2">
                      {user.role === 'recruiter' && (
                        <Link
                          href="/jobs/create"
                          onClick={() => setShowHeaderMenu(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                          <PlusCircle className="w-4 h-4 text-primary-600" />
                          Post a Job
                        </Link>
                      )}
                      <Link
                        href="/messages"
                        onClick={() => setShowHeaderMenu(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                      >
                        <MessageSquare className="w-4 h-4 text-primary-600" />
                        Messages
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setShowHeaderMenu(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 text-primary-600" />
                        My Profile
                      </Link>
                      <Link
                        href="/profile?tab=settings"
                        onClick={() => setShowHeaderMenu(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4 text-primary-600" />
                        Settings
                      </Link>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary-600" />
                        <h4 className="text-sm font-semibold text-gray-900">Notifications</h4>
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:underline">
                          Mark All Read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {notifications.length > 0 ? notifications.slice(0, 5).map(notif => (
                        <button
                          key={notif.$id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`w-full rounded-xl border p-3 text-left transition hover:bg-gray-50 ${
                            !notif.read ? 'border-primary-100 bg-primary-50/60' : 'border-gray-100'
                          }`}
                        >
                          <h5 className="font-semibold text-sm text-gray-900">{notif.title}</h5>
                          <p className="mt-1 text-sm text-gray-600">{notif.message}</p>
                          <p className="mt-2 text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString()}</p>
                        </button>
                      )) : (
                        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
                          <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t p-3">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-red-50 text-red-600 text-sm w-full transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
