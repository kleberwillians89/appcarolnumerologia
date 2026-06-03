
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { prepareAppStartup } from './utils/appStartupCleanup'

prepareAppStartup();

createRoot(document.getElementById("root")!).render(
  <App />
);
