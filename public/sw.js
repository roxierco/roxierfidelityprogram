self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? "Roxier Fidelity";
  const options = {
    body: data.body ?? "",
    icon: data.icon ?? "/icon-192.png",
    badge: "/icon-72.png",
    data: { url: data.url ?? "/" },
    vibrate: [100, 50, 100],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(clients.openWindow(url));
});
