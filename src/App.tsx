import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Building2, Search, Zap, Shield, ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from './contexts/AuthContext';
import ToolPage from './pages/ToolPage';
import BroadbandPage from './pages/BroadbandPage';
import MobilePage from './pages/MobilePage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import CouncilTaxPage from './pages/CouncilTaxPage';
import SampleReportPage from './pages/SampleReportPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import BuyerGuidePage from './pages/BuyerGuidePage';
import SellerGuidePage from './pages/SellerGuidePage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { HomePackJobProvider } from './contexts/HomePackJobContext';
import { HomePackChecklistModal } from './components/homepack/homepack-checklist-modal';
import { HomePackFloatingPill } from './components/homepack/homepack-job-pill';
import { ErrorBoundary } from './components/ErrorBoundary';

function LandingPage() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-24 md:py-40 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] -z-10" />
          
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-5xl mx-auto leading-[1.05] animate-in fade-in slide-in-from-bottom-8 duration-1000">
              The Smarter Way to Create <br className="hidden md:block" />
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Home Information Packs</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
              Generate comprehensive UK property reports in seconds. Powered by real-time data from Land Registry, EPC, and Planning authorities.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
              <Button asChild size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all">
                <Link to="/tool">
                  {user ? "New HomePack" : "Get Started for Free"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg rounded-full border-2 hover:bg-muted transition-all">
                <Link to="/sample">
                  View Sample Report
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-20 pt-10 border-t border-border/50 max-w-4xl mx-auto flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="flex items-center gap-2 font-bold text-xl">HM Land Registry</div>
               <div className="flex items-center gap-2 font-bold text-xl">EPC Register</div>
               <div className="flex items-center gap-2 font-bold text-xl">Ordnance Survey</div>
               <div className="flex items-center gap-2 font-bold text-xl">Environment Agency</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Everything you need in one pack</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                We aggregate data from multiple official sources to give you a complete picture of any property instantly.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <FeatureCard 
                icon={<Search className="h-7 w-7" />}
                title="Land Registry Data"
                description="Instant access to price paid history, tenure details, and official property descriptions directly from HM Land Registry."
              />
              <FeatureCard 
                icon={<Zap className="h-7 w-7" />}
                title="Energy Performance"
                description="Detailed EPC ratings, potential improvements, and estimated energy costs to help you understand efficiency."
              />
              <FeatureCard 
                icon={<Shield className="h-7 w-7" />}
                title="Planning & Risk"
                description="Planning history, flood risk assessments, and local authority information to identify potential red flags."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-primary text-primary-foreground relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
           <div className="container mx-auto px-4 text-center relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Ready to get the full picture?</h2>
              <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto">
                Join thousands of UK property buyers and sellers using HomePack to make informed decisions.
              </p>
              <Button asChild size="lg" variant="secondary" className="h-16 px-12 text-xl rounded-full shadow-2xl hover:scale-105 transition-transform">
                <Link to="/tool">{user ? "New HomePack" : "Create Your First Pack Now"}</Link>
              </Button>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-border bg-card hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group p-4">
      <CardHeader>
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
          {icon}
        </div>
        <CardTitle className="text-2xl font-bold mb-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}


export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <HomePackJobProvider>
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
              <Route path="/sample-report" element={<SampleReportPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/buyer-guide" element={<BuyerGuidePage />} />
              <Route path="/seller-guide" element={<SellerGuidePage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
            <HomePackChecklistModal />
            <HomePackFloatingPill />
            <Toaster position="bottom-right" />
          </HomePackJobProvider>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
