import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useMatches,
} from "@remix-run/react";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from 'react-query';

import styles from "./tailwind.css"
import AnkiConnectionProvider from "./components/Provider/AnkiConnectionProvider";
import SettingsProvider from "./components/Provider/SettingsProvider";
import NotificationProvider from "./components/Provider/NotificationProvider";
import ModalProvider from "./components/Provider/ModalProvider";

export function links () {
  return [{ rel: "stylesheet", href: styles }]
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Chie",
  viewport: "width=device-width,initial-scale=1",
});

export default function App () {
  const location = useLocation();
  const matches = useMatches();

  const queryClient = new QueryClient();

  let isMount = true;
  useEffect(() => {
    let mounted = isMount;
    isMount = false;
    if ("serviceWorker" in navigator) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller?.postMessage({
          type: "REMIX_NAVIGATION",
          isMount: mounted,
          location,
          matches,
          manifest: window.__remixManifest,
        });
      } else {
        let listener = async () => {
          await navigator.serviceWorker.ready;
          navigator.serviceWorker.controller?.postMessage({
            type: "REMIX_NAVIGATION",
            isMount: mounted,
            location,
            matches,
            manifest: window.__remixManifest,
          });
        };
        navigator.serviceWorker.addEventListener("controllerchange", listener);
        return () => {
          navigator.serviceWorker.removeEventListener(
            "controllerchange",
            listener
          );
        };
      }
    }
  }, [location]);

  return (
    <html lang="en">
      <head>
        <Meta />
        <link rel="manifest" href="/resources/manifest.json" />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AnkiConnectionProvider>
            <SettingsProvider>
              <NotificationProvider>
                <ModalProvider>
                  <Outlet />
                </ModalProvider>
              </NotificationProvider>
            </SettingsProvider>
          </AnkiConnectionProvider>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
