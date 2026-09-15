self.addEventListener("push", (event) => {
  let data = { title: "Kaskinha", body: "Você tem uma nova notificação." };
  try {
    data = event.data.json();
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      if (clientList.length > 0) return clientList[0].focus();
      return self.clients.openWindow("/");
    })
  );
});
