/* eslint-disable react/jsx-props-no-spreading */
import '../styles/globals.css';
import React from 'react';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import NotificationProvider from '../components/Notifications/NotificationProvider';
import Layout from '../components/Layout';
import ModalProvider from '../components/Modal/ModalProvider';
import SettingsProvider from '../components/SettingsProvider';

const queryClient = new QueryClient();

const App: React.FC<AppProps> = ({ Component, pageProps }) => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <NotificationProvider>
        <ModalProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ModalProvider>
      </NotificationProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
