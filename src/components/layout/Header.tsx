import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Shield, 
  History, 
  ChevronDown, 
  Zap, 
  Wifi, 
  Smartphone, 
  Coins, 
  BookOpen, 
  FileText,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/firebase';
import { LoginDialog } from '@/components/auth/LoginDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer upon route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isServicesActive = [
    '/council-tax',
    '/broadband',
    '/mobile',
    '/buyer-guide',
    '/seller-guide'
  ].includes(location.pathname);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200 border-b",
        isScrolled 
          ? "bg-background/85 backdrop-blur-md border-border shadow-sm py-2" 
          : "bg-background border-border/40 py-3.5"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0 mr-4">
            <div className="p-2 bg-primary rounded-xl group-hover:scale-105 transition-transform shadow-sm">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/75 leading-none">
                HomePack
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                UK Property Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {/* If Logged In: New HomePack button styled like homepage */}
            {user ? (
              <Button 
                asChild 
                size="sm" 
                className="rounded-full px-4 h-9 text-xs font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all gap-1.5 mr-2"
              >
                <Link to="/tool">
                  <span>New HomePack</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : (
              <>
                <Link 
                  to="/features"
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname === '/features' 
                      ? "text-primary bg-primary/10 font-semibold" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  Features
                </Link>

                <Link 
                  to="/pricing"
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname === '/pricing' 
                      ? "text-primary bg-primary/10 font-semibold" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  Pricing
                </Link>
              </>
            )}

            {/* Services Dropdown (Contains Standalone Checks & Guides) */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button 
                  type="button"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors group cursor-pointer outline-none",
                    isServicesActive 
                      ? "text-primary bg-primary/10 font-semibold" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <span>Services</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-transform" />
                </button>
              } />
              <DropdownMenuContent align="start" className="w-80 p-2 shadow-xl border border-border/80 rounded-xl mt-1">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Standalone Property Checks
                  </DropdownMenuLabel>
                  
                  <DropdownMenuItem render={
                    <Link to="/council-tax" className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors w-full group">
                      <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                        <Coins className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">Council Tax Checker</div>
                        <div className="text-xs text-muted-foreground leading-tight">Official VOA valuation bands & annual rates</div>
                      </div>
                    </Link>
                  } />
                  
                  <DropdownMenuItem render={
                    <Link to="/broadband" className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors w-full group">
                      <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                        <Wifi className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">Broadband Speeds</div>
                        <div className="text-xs text-muted-foreground leading-tight">FTTP full fibre & gigabit speed availability</div>
                      </div>
                    </Link>
                  } />
                  
                  <DropdownMenuItem render={
                    <Link to="/mobile" className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors w-full group">
                      <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                        <Smartphone className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">Mobile & 5G Signal</div>
                        <div className="text-xs text-muted-foreground leading-tight">Network coverage & transmitter masts</div>
                      </div>
                    </Link>
                  } />
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator className="my-1.5" />
                
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Property Guidelines
                  </DropdownMenuLabel>
                  
                  <DropdownMenuItem render={
                    <Link to="/buyer-guide" className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors w-full group">
                      <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0 mt-0.5">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">Buyer Guide</div>
                        <div className="text-xs text-muted-foreground leading-tight">Due diligence & conveyancing checklist</div>
                      </div>
                    </Link>
                  } />

                  <DropdownMenuItem render={
                    <Link to="/seller-guide" className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors w-full group">
                      <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0 mt-0.5">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">Seller Guide</div>
                        <div className="text-xs text-muted-foreground leading-tight">Material information & pack preparation</div>
                      </div>
                    </Link>
                  } />
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sample Report (Direct Link) */}
            <Link 
              to="/sample"
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                (location.pathname === '/sample' || location.pathname === '/sample-report')
                  ? "text-primary bg-primary/10 font-semibold" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Sample Report
            </Link>
          </nav>

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Account Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="outline" className="group gap-2 pl-1.5 pr-3 h-10 rounded-full border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground transition-colors">
                        {(profile?.displayName || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium max-w-[130px] truncate">
                        {profile?.displayName || user.displayName || user.email?.split('@')[0] || 'My Account'}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                    </Button>
                  } />
                  <DropdownMenuContent align="end" className="w-60 mt-1 shadow-xl rounded-xl p-1.5">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-normal p-2">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-bold leading-none text-foreground">{profile?.displayName || user.displayName || 'Member'}</p>
                          <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                          <div className="pt-2 flex items-center gap-1.5">
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 capitalize font-semibold">
                              {profile?.role || 'free'} Plan
                            </Badge>
                            {isAdmin && (
                              <Badge variant="default" className="text-[10px] h-4 px-1.5 font-bold uppercase tracking-wider">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </div>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator className="my-1" />
                    
                    <DropdownMenuItem render={
                      <Link to="/tool" className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted cursor-pointer font-medium text-sm">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <span>New HomePack</span>
                      </Link>
                    } />
                    
                    <DropdownMenuItem render={
                      <Link to="/profile" className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted cursor-pointer font-medium text-sm">
                        <User className="h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    } />
                    
                    <DropdownMenuItem render={
                      <Link to="/history" className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted cursor-pointer font-medium text-sm">
                        <History className="h-4 w-4" />
                        <span>Search History</span>
                      </Link>
                    } />

                    {isAdmin && (
                      <DropdownMenuItem render={
                        <Link to="/admin" className="flex items-center gap-2.5 p-2 rounded-md hover:bg-primary/10 cursor-pointer font-semibold text-sm text-primary">
                          <Shield className="h-4 w-4 text-primary" />
                          <span>Admin Control Panel</span>
                        </Link>
                      } />
                    )}
                    
                    <DropdownMenuSeparator className="my-1" />
                    
                    <DropdownMenuItem 
                      className="flex items-center gap-2.5 p-2 rounded-md text-destructive hover:bg-destructive/10 cursor-pointer text-sm font-medium"
                      onClick={() => logout()}
                    >
                      <LogOut className="h-4 w-4 text-destructive" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <LoginDialog trigger={<Button variant="ghost" size="sm" className="font-semibold text-sm">Sign In</Button>} />
                <Button asChild size="sm" className="rounded-full px-5 shadow-sm font-semibold">
                  <Link to="/tool">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border p-4 space-y-3 animate-in slide-in-from-top duration-200 shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* User Status Card on Mobile */}
          {user && (
            <div className="p-3 rounded-xl bg-muted/60 border border-border flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                  {(profile?.displayName || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm leading-tight text-foreground">
                    {profile?.displayName || user.displayName || 'Member'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {isAdmin && (
                  <Badge variant="default" className="text-[10px] h-4 px-1 font-bold">
                    Admin
                  </Badge>
                )}
                <Badge variant="secondary" className="text-[10px] h-4 px-1 capitalize font-semibold">
                  {profile?.role || 'free'}
                </Badge>
              </div>
            </div>
          )}

          {/* Main Mobile Navigation Links */}
          <div className="space-y-1">
            {user && (
              <Button asChild className="w-full justify-center rounded-full font-semibold shadow-md shadow-primary/20 gap-2 mb-2">
                <Link to="/tool" onClick={() => setIsMenuOpen(false)}>
                  <span>New HomePack</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}

            {/* Mobile Services Accordion / Group */}
            <div>
              <button
                type="button"
                className="flex items-center justify-between w-full px-3.5 py-2.5 text-base font-semibold rounded-lg hover:bg-muted text-foreground transition-colors"
                onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
              >
                <span>Services</span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isMobileServicesOpen && "rotate-180")} />
              </button>
              
              {isMobileServicesOpen && (
                <div className="pl-4 pr-1 py-1 space-y-1 bg-muted/30 rounded-lg my-1">
                  <Link 
                    to="/council-tax"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span>Council Tax Checker</span>
                  </Link>
                  <Link 
                    to="/broadband"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Wifi className="h-4 w-4 text-blue-500" />
                    <span>Broadband Speeds</span>
                  </Link>
                  <Link 
                    to="/mobile"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Smartphone className="h-4 w-4 text-emerald-500" />
                    <span>Mobile & 5G Signal</span>
                  </Link>
                  <Link 
                    to="/buyer-guide"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Buyer Guide</span>
                  </Link>
                  <Link 
                    to="/seller-guide"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Seller Guide</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Sample Report */}
            <Link 
              to="/sample"
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 text-base font-semibold rounded-lg transition-colors",
                (location.pathname === '/sample' || location.pathname === '/sample-report') ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Sample Report</span>
            </Link>

            {user ? (
              <>
                <Link 
                  to="/history"
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 text-base font-semibold rounded-lg transition-colors",
                    location.pathname === '/history' ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <History className="h-5 w-5 text-muted-foreground" />
                  <span>Search History</span>
                </Link>

                <Link 
                  to="/profile"
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 text-base font-semibold rounded-lg transition-colors",
                    location.pathname === '/profile' ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>Profile Settings</span>
                </Link>

                {isAdmin && (
                  <Link 
                    to="/admin"
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 text-base font-bold rounded-lg transition-colors text-primary bg-primary/10",
                      location.pathname === '/admin' ? "ring-1 ring-primary" : ""
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <span>Admin Control Panel</span>
                    </div>
                    <Badge variant="default" className="text-[10px] uppercase font-bold">
                      Admin
                    </Badge>
                  </Link>
                )}

                <div className="pt-3 border-t border-border">
                  <button 
                    className="flex items-center gap-3 w-full px-3.5 py-2.5 text-base font-semibold rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Log out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/features"
                  className="block px-3.5 py-2.5 text-base font-semibold rounded-lg hover:bg-muted text-foreground transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  to="/pricing"
                  className="block px-3.5 py-2.5 text-base font-semibold rounded-lg hover:bg-muted text-foreground transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </Link>

                <div className="pt-4 border-t border-border grid grid-cols-2 gap-3">
                  <LoginDialog trigger={<Button variant="outline" className="w-full font-bold">Sign In</Button>} />
                  <Button asChild className="w-full font-bold">
                    <Link to="/tool" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

