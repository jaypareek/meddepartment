import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.css'
import App from './App.tsx'

// Set up PGlite global configuration
// This ensures PGlite can find its assets and configure persistence properly
window.pgliteConfig = {
  persistenceType: 'indexeddb',
  dbName: 'medport_db',
  shared: true
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)