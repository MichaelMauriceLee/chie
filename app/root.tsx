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
import { useEffect, useState } from "react";
import NavBar from "./components/NavBar";
import SearchBar from "./components/SearchBar";
import { QueryClient, QueryClientProvider } from 'react-query';

import styles from "./tailwind.css"
import AnkiConnectionProvider from "./components/Provider/AnkiConnectionProvider";
import SettingsProvider from "./components/Provider/SettingsProvider";
import NotificationProvider from "./components/Provider/NotificationProvider";
import ImageArea from "./components/ImageArea/ImageArea";
import VoiceArea from "./components/VoiceArea/VoiceArea";
import Modal from "./components/Modal/Modal";

export function links () {
  return [{ rel: "stylesheet", href: styles }]
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Chie",
  viewport: "width=device-width,initial-scale=1",
});

export default function App () {
  let location = useLocation();
  let matches = useMatches();

  const queryClient = new QueryClient();

  const [showImageArea, setShowImageArea] = useState(false);
  const [showVoiceArea, setShowVoiceArea] = useState(false);

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
        <main className="md:px-72 px-2">
          <QueryClientProvider client={queryClient}>
            <AnkiConnectionProvider>
              <SettingsProvider>
                <NotificationProvider>
                    <Modal />
                    <NavBar />
                    <SearchBar setShowImageArea={setShowImageArea} setShowVoiceArea={setShowVoiceArea} />
                    {showImageArea && <ImageArea />}
                    {showVoiceArea && <VoiceArea />}
                    <Outlet />
                </NotificationProvider>
              </SettingsProvider>
            </AnkiConnectionProvider>
          </QueryClientProvider>
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
