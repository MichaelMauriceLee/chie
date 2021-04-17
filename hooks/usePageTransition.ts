import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const usePageTransition = (): boolean => {
  const { events } = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsLoading(true);
    };

    const handleRouteComplete = () => {
      setIsLoading(false);
    };

    events.on('routeChangeStart', handleRouteChange);
    events.on('routeChangeComplete', handleRouteComplete);

    return () => {
      events.off('routeChangeStart', handleRouteChange);
      events.on('routeChangeComplete', handleRouteComplete);
    };
  }, []);

  return isLoading;
};

export default usePageTransition;
