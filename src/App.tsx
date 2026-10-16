import { PageHero } from './components/layout/PageHero';
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from './pages/LandingPage';
const ToolPage = lazy(() => import('./pages/ToolPage'));
const BroadbandPage = lazy(() => import('./pages/BroadbandPage'));
const MobilePage = lazy(() => import('./pages/MobilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const CouncilTaxPage = lazy(() => import('./pages/CouncilTaxPage'));
const SampleReportPage = lazy(() => import('./pages/SampleReportPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const BuyerGuidePage = lazy(() => import('./pages/BuyerGuidePage'));
const SellerGuidePage = lazy(() => import('./pages/SellerGuidePage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { HomePackJobProvider } from './contexts/HomePackJobContext';
import { HomePackChecklistModal } from './components/homepack/homepack-checklist-modal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Seo } from './components/Seo';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Seo />
          <HomePackJobProvider>
            <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center" role="status">Loading page…</div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/tool" element={<ToolPage />} />
              <Route path="/council-tax" element={<CouncilTaxPage />} />
              <Route path="/broadband" element={<BroadbandPage />} />
              <Route path="/mobile" element={<MobilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/sample" element={<SampleReportPage />} />
              <Route path="/sample-report" element={<Navigate to="/sample" replace />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/buyer-guide" element={<BuyerGuidePage />} />
              <Route path="/seller-guide" element={<SellerGuidePage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="*" element={<div className="min-h-screen flex flex-col"><Header /><main className="site-main container mx-auto px-4 py-24 flex-grow text-center"><PageHero eyebrow="Let’s get you back on track" illustration="simple"><h1 className="site-page-heading">Page not found</h1><p>This page may have moved or the link may be incorrect.</p><Button asChild className="mt-5"><Link to="/">Return to UKHomePack.com</Link></Button></PageHero></main><Footer /></div>} />
            </Routes>
            </Suspense>
            <HomePackChecklistModal />
            <Toaster position="top-right" offset={80} visibleToasts={3} closeButton />
          </HomePackJobProvider>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
