import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './index.css';
import App from './App.tsx';
import { AppProviders } from './app/providers/AppProviders.tsx';


// === DEBUG: verificar variables de entorno ===
console.log("🔍 Variables de entorno:");
console.log("  VITE_API_URL =>", import.meta.env.VITE_API_URL);
console.log("  VITE_GOOGLE_CLIENT_ID =>", import.meta.env.VITE_GOOGLE_CLIENT_ID);
// ==========================================

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
