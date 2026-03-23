import '../styles/globals.css';
import { useState, useEffect, useCallback } from 'react';
import { TicketProvider } from '../context/TicketContext';
import { AuthProvider } from '../context/AuthContext';
import { InstallProvider } from '../context/InstallContext';
import SplashScreen from '../components/SplashScreen';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[SW] Registered', reg.scope))
        .catch((err) => console.error('[SW] Registration failed', err));
    }

    if (!sessionStorage.getItem('sneakout-splash-shown')) {
      setShowSplash(true);
    }
  }, []);

  const handleSplashDone = useCallback(() => {
    setShowSplash(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('sneakout-splash-shown', '1');
    }
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no"
        />
        <meta name="description" content="Discover and get tickets for the best events near you." />
      </Head>

      <InstallProvider>
        <AuthProvider>
          <TicketProvider>
            {showSplash && <SplashScreen onDone={handleSplashDone} />}
            <Component {...pageProps} />
          </TicketProvider>
        </AuthProvider>
      </InstallProvider>
    </>
  );
}
