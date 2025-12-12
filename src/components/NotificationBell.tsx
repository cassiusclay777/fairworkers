import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationBellProps {
  notificationCount?: number;
  onNotificationClick?: () => void;
}

export function NotificationBell({ 
  notificationCount = 0, 
  onNotificationClick 
}: NotificationBellProps) {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Check for PWA push notification permissions
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === 'granted');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onNotificationClick || requestPermission}
      className="relative"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
      </svg>
      
      {notificationCount > 0 && (
        <Badge className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-accent text-white text-xs">
          {notificationCount > 99 ? '99+' : notificationCount}
        </Badge>
      )}
      
      {!hasPermission && notificationCount === 0 && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
      )}
    </Button>
  );
}

export default NotificationBell;