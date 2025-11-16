
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// React import remains single

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Small helper to capture the beforeinstallprompt and use it in the UI
let deferredPrompt: any = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // dispatch event so the app can show an install button if desired
  window.dispatchEvent(new CustomEvent('appcaninstall'));
});
window.addEventListener('app-install-request', async () => {
  if (!deferredPrompt) return;
  // show the browser install prompt
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  window.dispatchEvent(new CustomEvent('app-install-result', { detail: choice }));
});
