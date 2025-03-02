import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Building2,
  CalendarDays,
  ChefHat,
  Home,
  LogOut,
  Settings,
  Users2,
  Menu,
  Bell,
  UtensilsCrossed,
  Image as ImageIcon,
  Compass,
  FileText,
  BarChart,
  UserCog,
  Receipt,
} from 'lucide-react';
import { logOut, getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/firebase';
import { Notification } from '@/lib/types';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  
  // Add a ref to track if the component is mounted
  const isMounted = useRef(true);

  // Function to handle notification updates
  const handleNotificationUpdate = async () => {
    if (!isMounted.current) return;
    
    try {
      // In a real app, you would get the current user ID
      const userId = 'currentUserId';
      const notifs = await getNotifications(userId);
      
      if (isMounted.current) {
        setNotifications(notifs as Notification[]);
        setUnreadCount(notifs.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    handleNotificationUpdate();
    
    // Set up interval for periodic updates
    const interval = setInterval(handleNotificationUpdate, 30000);
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []); // Empty dependency array to run only on mount

  const handleLogout = async () => {
    const { error } = await logOut();
    if (!error) {
      router.push('/login');
    }
  };
  
  // Handle marking a notification as read
  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    // Update local state
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    const userId = 'currentUserId';
    await markAllNotificationsAsRead(userId);
    
    // Update local state
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({
        ...notification,
        isRead: true
      }))
    );
    
    // Reset unread count
    setUnreadCount(0);
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    if (notification.relatedTo) {
      const { type, id } = notification.relatedTo;
      switch (type) {
        case 'booking':
          router.push(`/dashboard/bookings?id=${id}`);
          break;
        case 'guest':
          router.push(`/dashboard/guests?id=${id}`);
          break;
        case 'room':
          router.push(`/dashboard/rooms?id=${id}`);
          break;
        case 'service':
          router.push(`/dashboard/services?id=${id}`);
          break;
        default:
          break;
      }
    }

    setNotificationOpen(false);
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Building2, label: 'Rooms', href: '/dashboard/rooms' },
    { icon: Users2, label: 'Guests', href: '/dashboard/guests' },
    { icon: CalendarDays, label: 'Bookings', href: '/dashboard/bookings' },
    { icon: Receipt, label: 'Invoices', href: '/dashboard/invoices' },
    { icon: ChefHat, label: 'Services', href: '/dashboard/services' },
    { icon: UtensilsCrossed, label: 'Restaurant Menu', href: '/dashboard/restaurant/menu' },
    { icon: Compass, label: 'Activities', href: '/dashboard/activities' },
    { icon: ImageIcon, label: 'Gallery', href: '/dashboard/gallery' },
    { icon: FileText, label: 'Blog', href: '/dashboard/blog' },
    { icon: BarChart, label: 'Reports', href: '/dashboard/reports' },
    { icon: UserCog, label: 'Users', href: '/dashboard/users' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-border/50 bg-card/50 backdrop-blur-xl w-64`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-border/50">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              HMS
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-primary/10 transition-colors group"
              >
                <item.icon className="h-5 w-5 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout button */}
          <div className="border-t border-border/50 p-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`${isSidebarOpen ? 'ml-64' : ''} flex flex-col min-h-screen`}>
        {/* Header */}
        <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-xl flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setNotificationOpen(!isNotificationOpen)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">JD</span>
            </div>
          </div>
        </header>

        {/* Notification Center */}
        {isNotificationOpen && (
          <NotificationCenter 
            notifications={notifications} 
            onClose={() => setNotificationOpen(false)}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onNotificationClick={handleNotificationClick}
          />
        )}

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout; 