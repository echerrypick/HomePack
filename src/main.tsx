import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Public pages include meaningful, crawlable HTML before JavaScript runs. The
// interactive React application replaces that equivalent static presentation.
document.getElementById('seo-static-content')?.remove();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
