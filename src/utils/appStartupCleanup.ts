const APP_STORAGE_VERSION_KEY = 'carol_numerology_storage_version';
const APP_STORAGE_VERSION = '2026-06-03-render-auth-cache-fix';

const LEGACY_APP_KEYS_TO_CLEAR = [
  'numerology_backup_config',
  'numerology_last_backup',
  'numerology_backup_history',
];

const unregisterLegacyServiceWorkers = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().catch((error) => {
          console.warn('[startup] Não foi possível remover service worker antigo.', error);
        });
      });
    })
    .catch((error) => {
      console.warn('[startup] Não foi possível verificar service workers antigos.', error);
    });
};

const clearLegacyCaches = () => {
  if (typeof window === 'undefined' || !('caches' in window)) return;

  caches
    .keys()
    .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
    .catch((error) => {
      console.warn('[startup] Não foi possível limpar caches antigos do app.', error);
    });
};

const clearLegacyAppStorage = () => {
  if (typeof window === 'undefined') return false;

  try {
    const savedVersion = localStorage.getItem(APP_STORAGE_VERSION_KEY);
    if (savedVersion === APP_STORAGE_VERSION) return false;

    LEGACY_APP_KEYS_TO_CLEAR.forEach((key) => {
      localStorage.removeItem(key);
    });

    localStorage.setItem(APP_STORAGE_VERSION_KEY, APP_STORAGE_VERSION);
    return true;
  } catch (error) {
    console.warn('[startup] Não foi possível atualizar storage local do app.', error);
    return false;
  }
};

export const prepareAppStartup = () => {
  const didUpdateStorage = clearLegacyAppStorage();
  unregisterLegacyServiceWorkers();
  if (didUpdateStorage) clearLegacyCaches();
};
