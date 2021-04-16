/* eslint-disable react/jsx-props-no-spreading */
import '../styles/globals.css';
import React from 'react';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import NotificationProvider from '../components/Notifications/NotificationProvider';

const queryClient = new QueryClient();

const App: React.FC<AppProps> = ({ Component, pageProps }) => (
  <QueryClientProvider client={queryClient}>
    <NotificationProvider>
      <Component {...pageProps} />
    </NotificationProvider>
  </QueryClientProvider>
);

export default App;
