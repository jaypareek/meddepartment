/// <reference types="vite/client" />

interface Window {
  pgliteConfig?: {
    persistenceType?: string;
    dbName?: string;
    shared?: boolean;
  };
}