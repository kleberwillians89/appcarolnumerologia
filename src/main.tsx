
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { prepareAppStartup } from './utils/appStartupCleanup'

const bridgeSupabaseRecoveryUrl = () => {
  const rawHash = window.location.hash.replace(/^#/, '');
  if (!rawHash.includes('type=recovery')) return;

  const recoveryFragment = rawHash.includes('#access_token=')
    ? rawHash.slice(rawHash.indexOf('#') + 1)
    : rawHash.startsWith('/reset-password?')
      ? rawHash.slice(rawHash.indexOf('?') + 1)
      : rawHash;

  const params = new URLSearchParams(recoveryFragment);
  if (!params.get('access_token') && !params.get('refresh_token')) return;

  sessionStorage.setItem('carol_password_recovery_params', recoveryFragment);
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/reset-password`);
};

bridgeSupabaseRecoveryUrl();
prepareAppStartup();

createRoot(document.getElementById("root")!).render(
  <App />
);
