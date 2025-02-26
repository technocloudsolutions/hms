'use client';

import React from 'react';
import { X, Check, Bell, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notification } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface NotificationCenterProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onNotificationClick: (notification: Notification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, 
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick
}) => {
  const router = useRouter();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="absolute right-6 top-16 w-80 max-h-[70vh] bg-card shadow-lg rounded-lg border border-border/50 z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs"
              onClick={onMarkAllAsRead}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li 
                key={notification.id}
                className={`p-4 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-primary/5' : ''
                }`}
                onClick={() => onNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}; 