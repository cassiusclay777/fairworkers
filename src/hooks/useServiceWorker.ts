import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isInstalled: boolean;
  isUpdating: boolean;
  error: string | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isInstalled: false,
    isUpdating: false,
    error: null,
  });

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        
        registration.addEventListener('updatefound', () => {
          setState(prev => ({ ...prev, isUpdating: true }));
        });

        // Check if there's a waiting service worker
        if (registration.waiting) {
          setState(prev => ({ ...prev, isUpdating: true }));
        }

        setState(prev => ({ ...prev, isInstalled: true, error: null }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }));
      }
    };

    // Listen for controller change (when new SW takes control)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    registerSW();

    // Cleanup
    return () => {
      // No cleanup needed for event listeners
    };
  }, []);

  const updateServiceWorker = () => {
    if (state.isSupported && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return {
    ...state,
    updateServiceWorker,
  };
}