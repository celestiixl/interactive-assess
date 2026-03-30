"use client";

import { useEffect, useState } from "react";

export default function OfflineSupport() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cleanupFlag = "ia.sw.cleanup.v1";

    setOffline(!window.navigator.onLine);

    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations.map((registration) => registration.unregister()),
          ),
        )
        .then(async () => {
          if ("caches" in window) {
            const keys = await window.caches.keys();
            await Promise.all(
              keys
                .filter((key) => key.startsWith("biospark-learning"))
                .map((key) => window.caches.delete(key)),
            );
          }

          if (
            navigator.serviceWorker.controller &&
            window.sessionStorage.getItem(cleanupFlag) !== "1"
          ) {
            window.sessionStorage.setItem(cleanupFlag, "1");
            window.location.reload();
          }
        })
        .catch(() => undefined);
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[rgba(245,166,35,0.25)] bg-[rgba(245,166,35,0.06)] px-4 py-2 text-xs font-semibold text-bs-amber shadow">
      Offline mode: reading pages are cached; progress syncs when connection
      returns.
    </div>
  );
}
