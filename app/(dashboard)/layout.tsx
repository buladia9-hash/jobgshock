'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { getNotifications, markNotificationAsRead } from '@/lib/notification-actions';
import {
  Briefcase, LayoutDashboard, FileText, User, LogOut,
  PlusCircle, Bell, X, Users, Settings, ChevronDown, Menu, MessageSquare
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, checkAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);
  useEffect(() => { if (user) loadNotifications(); }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    const notifs = await getNotifications(user.$id);
    setNotifications(notifs);
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.read) { await markNotificationAsRead(notif.$id); loadNotifications(); }
    if (notif.link) router.push(notif.link);
    setShowNotifications(false);
  };

  const handleLogout = async () => { await logout(); router.push('/'); };

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
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r flex flex-col transition-all duration-300 fixed h-full z-30`}>
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && <span className="text-xl font-bold text-gray-900">JobPortal</span>}
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${user.role === 'recruiter' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
              {user.role === 'recruiter' ? '🏢 Recruiter Account' : '👤 Job Seeker Account'}
            </span>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href.split('?')[0];
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
                {item.label === 'Post a Job' && sidebarOpen && (
                  <span className="ml-auto bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">New</span>
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
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Navbar */}
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-800">
              {user.role === 'recruiter' ? 'Recruiter Dashboard' : 'Job Seeker Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {user.role === 'recruiter' && (
              <Link href="/jobs/create" className="btn btn-primary flex items-center gap-2 text-sm">
                <PlusCircle className="w-4 h-4" />
                Post a Job
              </Link>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border z-50">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)}>
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(notif => (
                      <div
                        key={notif.$id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}
                      >
                        <h4 className="font-semibold text-sm">{notif.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border z-50">
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-sm">
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link href="/profile?tab=settings" className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-sm">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <div className="border-t">
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 hover:bg-red-50 text-red-600 text-sm w-full">
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
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
