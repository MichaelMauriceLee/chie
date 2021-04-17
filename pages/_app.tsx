/* eslint-disable react/jsx-props-no-spreading */
import '../styles/globals.css';
import React from 'react';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import NotificationProvider from '../components/Provider/NotificationProvider';
import Layout from '../components/Layout';
import ModalProvider from '../components/Provider/ModalProvider';
import SettingsProvider from '../components/Provider/SettingsProvider';
import AnkiConnectionProvider from '../components/Provider/AnkiConnectionProvider';

const queryClient = new QueryClient();

const App: React.FC<AppProps> = ({ Component, pageProps }) => (
  <QueryClientProvider client={queryClient}>
    <AnkiConnectionProvider>
      <SettingsProvider>
        <NotificationProvider>
          <ModalProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ModalProvider>
        </NotificationProvider>
      </SettingsProvider>
    </AnkiConnectionProvider>
  </QueryClientProvider>
);

export default App;
