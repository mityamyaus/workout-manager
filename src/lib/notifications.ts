export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

export async function notify(title: string, options?: NotificationOptions) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;

  const opts: NotificationOptions = {
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    ...options,
  };

  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, opts);
      return;
    } catch {
      // падаем ниже на обычный Notification
    }
  }

  try {
    new Notification(title, opts);
  } catch {
    // Notification может быть недоступен в некоторых контекстах (например, iOS Safari вне PWA)
  }
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}
