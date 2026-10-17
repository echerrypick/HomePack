import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Public pages include meaningful, crawlable HTML before JavaScript runs. Keep
// an article's server-rendered copy in place until its public API request has
// succeeded; this prevents a transient or crawler-blocked request from turning
// a valid article into an empty client-rendered error page.
const isArticleDetail = /^\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/.test(window.location.pathname);
if (!isArticleDetail) document.getElementById('seo-static-content')?.remove();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
