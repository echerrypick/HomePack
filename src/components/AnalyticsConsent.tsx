import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const CONSENT_KEY = 'ukhomepack_analytics_consent';
const OPEN_SETTINGS_EVENT = 'ukhomepack:open-cookie-settings';

declare global {
  interface Window {
    ukHomePackEnableAnalytics?: () => void;
    ukHomePackDisableAnalytics?: () => void;
    __ukHomePackAnalyticsLoaded?: boolean;
    gtag?: (...args: unknown[]) => void;
  }
}

function savedConsent() {
  try { return window.localStorage.getItem(CONSENT_KEY); }
  catch { return null; }
}

function saveConsent(value: 'accepted' | 'rejected') {
  try { window.localStorage.setItem(CONSENT_KEY, value); }
  catch { /* The preference will be requested again if storage is unavailable. */ }
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

export function AnalyticsConsent() {
  const location = useLocation();
  const [consent, setConsent] = useState(() => savedConsent());
  const [open, setOpen] = useState(() => consent === null);

  useEffect(() => {
    const showSettings = () => setOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, showSettings);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, showSettings);
  }, []);

  useEffect(() => {
    if (consent !== 'accepted') return;
    window.ukHomePackEnableAnalytics?.();
    window.gtag?.('event', 'page_view', {
      page_location: window.location.href,
      page_path: `${location.pathname}${location.search}`,
      page_title: document.title,
    });
  }, [consent, location.pathname, location.search]);

  const choose = (choice: 'accepted' | 'rejected') => {
    saveConsent(choice);
    setConsent(choice);
    if (choice === 'accepted') window.ukHomePackEnableAnalytics?.();
    else window.ukHomePackDisableAnalytics?.();
    setOpen(false);
  };

  if (!open) return null;

  return <aside className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-2xl md:flex md:items-center md:gap-6" role="dialog" aria-label="Analytics cookie choices" aria-live="polite">
    <div className="flex-1">
      <h2 className="text-base font-bold text-foreground">Your analytics cookie choice</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">We use optional Google Analytics cookies to understand how the website is used. Necessary account, security and payment functions work without them. Read our <Link className="font-semibold text-primary underline" to="/privacy">Privacy Policy</Link>.</p>
    </div>
    <div className="mt-4 flex flex-col gap-2 sm:flex-row md:mt-0 md:shrink-0">
      <button className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted" type="button" onClick={() => choose('rejected')}>Use necessary only</button>
      <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90" type="button" onClick={() => choose('accepted')}>Allow analytics</button>
    </div>
  </aside>;
}
