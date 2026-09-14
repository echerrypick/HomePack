import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { resetPassword, updateUserProfile, updateUserSubscriptionPlan, PermittedProfileUpdates } from '../firebase';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Shield, 
  History, 
  Key, 
  Lock, 
  Edit3, 
  Save, 
  X, 
  Building2, 
  Briefcase, 
  Phone, 
  MapPin, 
  Bell, 
  Copy, 
  Check, 
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  Palette,
  Download,
  CheckCircle2,
  Globe,
  FileText,
  CreditCard,
  Home
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ROLE_DISPLAY_NAMES: Record<string, { label: string; color: string; desc: string }> = {
  admin: {
    label: 'System Administrator',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50',
    desc: 'Unrestricted administrative access across all system tools and user accounts.'
  },
  agency: {
    label: 'Agency White-Label (£49/mo)',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50',
    desc: 'Full enterprise tier with unlimited searches, custom agency logo & brand colors, and agent bio on all reports.'
  },
  subscription: {
    label: 'B2B Pro Subscriber (£29/mo)',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
    desc: 'Professional tier with unlimited property searches, token-free PDF exports, and complete Land Registry/planning.'
  },
  free: {
    label: 'Standard Free Account',
    color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
    desc: 'Basic tier with complimentary single-property preview lookups and pay-as-you-go PDF download option.'
  }
};

const SUGGESTED_ROLES = [
  'Homebuyer',
  'Property Investor',
  'Estate Agent',
  'Chartered Surveyor',
  'Conveyancer / Solicitor',
  'Landlord',
  'Mortgage Broker',
  'Architect / Developer'
];

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitchingTier, setIsSwitchingTier] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  // Form state for permitted editable items
  const [formData, setFormData] = useState<PermittedProfileUpdates>({
    displayName: '',
    phoneNumber: '',
    company: '',
    jobTitle: '',
    preferredRegion: '',
    bio: '',
    accountType: 'consumer',
    branding: {
      logoUrl: '',
      primaryColor: '#2d4a77',
      accentColor: '#d1e3f8',
      companyTagline: '',
      agentName: '',
      agentBio: '',
      agencyPhone: '',
      agencyEmail: '',
      website: ''
    },
    notifications: {
      emailAlerts: true,
      propertyUpdates: true,
      marketingEmails: false,
    }
  });

  // Sync state when profile or user changes
  useEffect(() => {
    if (profile || user) {
      setFormData({
        displayName: profile?.displayName || user?.displayName || '',
        phoneNumber: profile?.phoneNumber || '',
        company: profile?.company || '',
        jobTitle: profile?.jobTitle || '',
        preferredRegion: profile?.preferredRegion || '',
        bio: profile?.bio || '',
        accountType: profile?.accountType || (profile?.role === 'agency' || profile?.role === 'subscription' ? 'business' : 'consumer'),
        branding: {
          logoUrl: profile?.branding?.logoUrl || '',
          primaryColor: profile?.branding?.primaryColor || '#2d4a77',
          accentColor: profile?.branding?.accentColor || '#d1e3f8',
          companyTagline: profile?.branding?.companyTagline || '',
          agentName: profile?.branding?.agentName || profile?.displayName || '',
          agentBio: profile?.branding?.agentBio || '',
          agencyPhone: profile?.branding?.agencyPhone || profile?.phoneNumber || '',
          agencyEmail: profile?.branding?.agencyEmail || profile?.email || '',
          website: profile?.branding?.website || ''
        },
        notifications: {
          emailAlerts: profile?.notifications?.emailAlerts ?? true,
          propertyUpdates: profile?.notifications?.propertyUpdates ?? true,
          marketingEmails: profile?.notifications?.marketingEmails ?? false,
        }
      });
    }
  }, [profile, user]);

  const handleCopyUid = () => {
    if (!user?.uid) return;
    navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    toast.success('Account UID copied to clipboard');
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsResetting(true);
    try {
      await resetPassword(user.email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send password reset email');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.displayName || formData.displayName.trim().length === 0) {
      toast.error('Please enter your full name');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, formData);
      toast.success('Profile and account attributes updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAccountTypeToggle = async (type: 'consumer' | 'business') => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, { accountType: type });
      setFormData(prev => ({ ...prev, accountType: type }));
      toast.success(`Account switched to ${type === 'business' ? 'Business / Professional (B2B)' : 'Regular Customer (B2C)'}`);
    } catch (e: any) {
      toast.error('Failed to change account type');
    }
  };

  const handleSwitchSubscriptionPlan = async (role: 'free' | 'subscription' | 'agency') => {
    if (!user) return;
    setIsSwitchingTier(true);
    try {
      await updateUserSubscriptionPlan(user.uid, role, 'business');
      toast.success(`Subscription plan successfully updated to ${role === 'agency' ? 'B2B White-Label (£49/mo)' : role === 'subscription' ? 'B2B Pro (£29/mo)' : 'Free Trial'}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update subscription tier');
    } finally {
      setIsSwitchingTier(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to latest profile state
    setFormData({
      displayName: profile?.displayName || user?.displayName || '',
      phoneNumber: profile?.phoneNumber || '',
      company: profile?.company || '',
      jobTitle: profile?.jobTitle || '',
      preferredRegion: profile?.preferredRegion || '',
      bio: profile?.bio || '',
      accountType: profile?.accountType || 'consumer',
      branding: {
        logoUrl: profile?.branding?.logoUrl || '',
        primaryColor: profile?.branding?.primaryColor || '#2d4a77',
        accentColor: profile?.branding?.accentColor || '#d1e3f8',
        companyTagline: profile?.branding?.companyTagline || '',
        agentName: profile?.branding?.agentName || '',
        agentBio: profile?.branding?.agentBio || '',
        agencyPhone: profile?.branding?.agencyPhone || '',
        agencyEmail: profile?.branding?.agencyEmail || '',
        website: profile?.branding?.website || ''
      },
      notifications: {
        emailAlerts: profile?.notifications?.emailAlerts ?? true,
        propertyUpdates: profile?.notifications?.propertyUpdates ?? true,
        marketingEmails: profile?.notifications?.marketingEmails ?? false,
      }
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-16 max-w-md flex-grow text-center">
          <Card id="profile-unauth-card" className="p-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Sign in Required</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Please sign in to view and manage your profile settings, search history, and account tier.
            </p>
            <Button asChild className="w-full">
              <Link to="/tool">Go to Sign In</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const currentAccountType = profile?.accountType || formData.accountType || 'consumer';
  const roleInfo = ROLE_DISPLAY_NAMES[profile?.role || 'free'] || ROLE_DISPLAY_NAMES.free;
  const memberSince = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-4xl flex-grow">
        {/* Page Title & Profile Header Banner */}
        <div id="profile-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl shadow-sm">
              {(profile?.displayName || user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Profile & Account</h1>
                <Badge variant="outline" className={currentAccountType === 'business' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'}>
                  {currentAccountType === 'business' ? 'Business / B2B' : 'Regular Customer / B2C'}
                </Badge>
                <Badge variant="outline" className={roleInfo.color}>
                  {roleInfo.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your account type, professional branding, and property due diligence history
              </p>
            </div>
          </div>

          {!isEditing ? (
            <Button 
              id="edit-profile-btn"
              onClick={() => setIsEditing(true)}
              className="gap-2 shadow-sm shrink-0 self-start sm:self-auto"
            >
              <Edit3 className="h-4 w-4" />
              Edit Permitted Details
            </Button>
          ) : (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button 
                id="cancel-profile-btn"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button 
                id="save-profile-header-btn"
                size="sm"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="gap-1 shadow-sm"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-8">
          {/* SECTION 1: ACCOUNT CLASSIFICATION & TIER ATTRIBUTES */}
          <Card id="account-classification-card" className="border-border shadow-xs overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Account Classification & Features
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Configure whether you use HomePackAI as an individual buyer/seller or as a property business
                  </CardDescription>
                </div>

                {/* Account Type Switcher */}
                <div className="flex items-center bg-background p-1 rounded-xl border shadow-2xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleAccountTypeToggle('consumer')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      currentAccountType === 'consumer' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Regular Customer (B2C)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAccountTypeToggle('business')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      currentAccountType === 'business' 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Business / Professional (B2B)
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-6">
              {currentAccountType === 'consumer' ? (
                /* CONSUMER / B2C ATTRIBUTES */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-600 text-white font-semibold text-xs">Direct-to-Consumer (B2C)</Badge>
                          <span className="text-xs text-muted-foreground font-medium">Pay-as-you-go (£9.99/report)</span>
                        </div>
                        <h4 className="font-semibold text-foreground text-base">Individual Homebuyer & Seller Account</h4>
                        <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                          Download official 9-page due diligence dossiers on any UK property for £9.99 per report with zero subscription obligations. All your purchased packs remain permanently saved in your profile.
                        </p>
                      </div>
                      <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                        <Link to="/tool">
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          New Search
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Purchased Reports List */}
                  <div className="p-4 rounded-xl border border-border bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        <h4 className="font-semibold text-sm">Unlocked B2C Report Downloads ({profile?.purchasedReports?.length || 0})</h4>
                      </div>
                      <span className="text-xs text-muted-foreground">Permanent Cloud Access</span>
                    </div>

                    {(profile?.purchasedReports || []).length > 0 ? (
                      <div className="space-y-2">
                        {profile?.purchasedReports?.map((addr, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border text-sm">
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span className="font-medium text-foreground truncate">{addr}</span>
                            </div>
                            <Button asChild variant="outline" size="sm" className="h-8 text-xs shrink-0">
                              <Link to="/tool">View Pack</Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground text-xs">
                        <p>No individual reports purchased yet.</p>
                        <p className="mt-1">When you generate a property report, you can unlock the full 9-page official PDF for £9.99.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* BUSINESS / B2B ATTRIBUTES */
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-600 text-white font-semibold text-xs">B2B Professional Tier</Badge>
                          <Badge variant="outline" className="text-xs">{roleInfo.label}</Badge>
                        </div>
                        <h4 className="font-semibold text-foreground text-base">Estate Agent, Broker & Surveyor SaaS</h4>
                        <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                          Package unlimited due diligence searches into your firm's daily operations. Upgrade to Enterprise White-Label (£49/mo) to stamp your custom agency logo, branding, and agent bio on all client reports.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <Button 
                          size="sm" 
                          variant={profile?.role === 'subscription' ? 'default' : 'outline'}
                          onClick={() => handleSwitchSubscriptionPlan('subscription')}
                          disabled={isSwitchingTier || profile?.role === 'subscription'}
                          className="text-xs h-8"
                        >
                          {profile?.role === 'subscription' ? '✓ Pro Active' : 'B2B Pro (£29/mo)'}
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
                          onClick={() => handleSwitchSubscriptionPlan('agency')}
                          disabled={isSwitchingTier || profile?.role === 'agency'}
                        >
                          {profile?.role === 'agency' ? '✓ White-Label Active' : 'White-Label (£49/mo)'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* White-Label Customization Suite */}
                  <div className="p-5 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/10 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">Agency White-Label Branding Suite</h4>
                          <p className="text-xs text-muted-foreground">Customise client-facing reports with your logo, colors, and direct contact details</p>
                        </div>
                      </div>
                      {profile?.role === 'agency' ? (
                        <Badge className="bg-purple-600 text-white text-xs">Active on Reports</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">
                          Included in White-Label (£49/mo)
                        </Badge>
                      )}
                    </div>

                    {/* Read-Only White-Label Display & Live Mini Preview */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-2.5 rounded-lg bg-background border">
                          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Agency Firm</span>
                          <span className="font-semibold text-foreground truncate block">{profile?.company || 'Not set'}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-background border">
                          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Brand Primary</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="h-3.5 w-3.5 rounded-full border shrink-0" style={{ backgroundColor: profile?.branding?.primaryColor || '#2d4a77' }} />
                            <span className="font-mono text-xs">{profile?.branding?.primaryColor || '#2d4a77'}</span>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-background border">
                          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Lead Agent</span>
                          <span className="font-semibold text-foreground truncate block">{profile?.branding?.agentName || profile?.displayName || 'Not set'}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-background border">
                          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Logo Status</span>
                          <span className="font-semibold text-foreground truncate block">{profile?.branding?.logoUrl ? '✓ Configured' : 'Standard Icon'}</span>
                        </div>
                      </div>

                      {/* Interactive Report Cover Mini-Preview */}
                      <div className="p-4 rounded-xl border bg-white text-black shadow-xs">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                          Live PDF Cover Preview
                        </div>
                        <div className="border p-4 rounded-lg text-center" style={{ borderColor: profile?.branding?.accentColor || '#d1e3f8', borderTop: `4px solid ${profile?.branding?.primaryColor || '#2d4a77'}` }}>
                          {profile?.branding?.logoUrl ? (
                            <img src={profile.branding.logoUrl} alt="Logo" className="max-h-12 max-w-[160px] mx-auto mb-2 object-contain" />
                          ) : (
                            <div className="inline-block p-2 rounded-lg text-white mb-2" style={{ backgroundColor: profile?.branding?.primaryColor || '#2d4a77' }}>
                              <Home className="h-5 w-5" />
                            </div>
                          )}
                          <h5 className="font-serif font-bold text-base" style={{ color: profile?.branding?.primaryColor || '#2d4a77' }}>
                            {profile?.company || profile?.branding?.companyTagline || 'HomePackAI Enterprise'}
                          </h5>
                          <p className="text-[11px] text-muted-foreground">Property Information Report</p>
                          <div className="mt-3 pt-2 border-t text-[11px] text-muted-foreground flex justify-between items-center">
                            <span>Prepared by {profile?.branding?.agentName || profile?.displayName || 'Certified Agent'}</span>
                            <span>{profile?.branding?.agencyPhone || 'Official Due Diligence'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 2: PERMITTED EDITABLE ITEMS */}
          <Card id="permitted-details-card" className="border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/40" />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">Personal & Professional Details</CardTitle>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 text-[11px] font-medium">
                      ✓ Permitted to Edit
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">
                    Information used on your HomePack reports, correspondence, and search defaults
                  </CardDescription>
                </div>

                {!isEditing && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                    className="text-primary hover:text-primary/80 gap-1 text-xs font-semibold"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Modify
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {isEditing ? (
                <form id="profile-edit-form" onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="font-semibold flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-primary" /> Full Name <span className="text-destructive">*</span>
                      </span>
                      <span className="text-xs text-muted-foreground">Displayed on generated packs</span>
                    </Label>
                    <Input 
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="e.g. Eleanor Smith"
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="font-semibold flex items-center gap-1.5 text-sm">
                        <Phone className="h-4 w-4 text-primary" /> Phone / Mobile
                      </Label>
                      <Input 
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="e.g. 07123 456789"
                        maxLength={30}
                      />
                    </div>

                    {/* Preferred Postcode / Region */}
                    <div className="space-y-2">
                      <Label htmlFor="preferredRegion" className="font-semibold flex items-center gap-1.5 text-sm">
                        <MapPin className="h-4 w-4 text-primary" /> Default Search Area / Postcode
                      </Label>
                      <Input 
                        id="preferredRegion"
                        value={formData.preferredRegion}
                        onChange={(e) => setFormData(prev => ({ ...prev, preferredRegion: e.target.value }))}
                        placeholder="e.g. DE72 or Derbyshire"
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Company / Agency */}
                    <div className="space-y-2">
                      <Label htmlFor="company" className="font-semibold flex items-center gap-1.5 text-sm">
                        <Building2 className="h-4 w-4 text-primary" /> Company / Firm / Agency
                      </Label>
                      <Input 
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="e.g. Oakwood Property Consultants"
                        maxLength={120}
                      />
                    </div>

                    {/* Job Title / Role */}
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle" className="font-semibold flex items-center gap-1.5 text-sm">
                        <Briefcase className="h-4 w-4 text-primary" /> Property Role / Profession
                      </Label>
                      <Input 
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                        placeholder="e.g. Homebuyer, Surveyor, Agent"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  {/* Quick role suggestions */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">Quick select property role:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_ROLES.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, jobTitle: role }))}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                            formData.jobTitle === role 
                              ? 'bg-primary text-primary-foreground border-primary font-medium'
                              : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bio / Search Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="font-semibold flex items-center gap-1.5 text-sm">
                      <Sparkles className="h-4 w-4 text-primary" /> Property Search Notes / Bio
                    </Label>
                    <Textarea 
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Add personal notes, specific search criteria, target investment zones, or agency introduction..."
                      rows={3}
                      maxLength={1000}
                    />
                    <div className="text-right text-xs text-muted-foreground">
                      {(formData.bio || '').length} / 1000 characters
                    </div>
                  </div>

                  {/* Business White-Label Branding Fields */}
                  {formData.accountType === 'business' && (
                    <div className="pt-3 border-t border-purple-200 dark:border-purple-900/40 space-y-4 bg-purple-50/20 dark:bg-purple-950/10 p-4 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold text-sm text-foreground">B2B White-Label Report Customization</span>
                        <Badge className="bg-purple-600 text-white text-[10px]">Client PDF Branding</Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="logoUrl" className="text-xs font-semibold">Agency Logo URL</Label>
                          <Input
                            id="logoUrl"
                            value={formData.branding?.logoUrl || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              branding: { ...prev.branding, logoUrl: e.target.value }
                            }))}
                            placeholder="https://example.com/logo.png"
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="companyTagline" className="text-xs font-semibold">Tagline / Subtitle</Label>
                          <Input
                            id="companyTagline"
                            value={formData.branding?.companyTagline || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              branding: { ...prev.branding, companyTagline: e.target.value }
                            }))}
                            placeholder="e.g. Chartered Surveyors & Agents"
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="primaryColor" className="text-xs font-semibold flex items-center justify-between">
                            <span>Primary Brand Color</span>
                            <span className="font-mono text-[11px]">{formData.branding?.primaryColor || '#2d4a77'}</span>
                          </Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              id="primaryColor"
                              value={formData.branding?.primaryColor || '#2d4a77'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                branding: { ...prev.branding, primaryColor: e.target.value }
                              }))}
                              className="h-9 w-12 rounded cursor-pointer border p-0.5"
                            />
                            <Input
                              value={formData.branding?.primaryColor || '#2d4a77'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                branding: { ...prev.branding, primaryColor: e.target.value }
                              }))}
                              className="text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="accentColor" className="text-xs font-semibold flex items-center justify-between">
                            <span>Accent Color</span>
                            <span className="font-mono text-[11px]">{formData.branding?.accentColor || '#d1e3f8'}</span>
                          </Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              id="accentColor"
                              value={formData.branding?.accentColor || '#d1e3f8'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                branding: { ...prev.branding, accentColor: e.target.value }
                              }))}
                              className="h-9 w-12 rounded cursor-pointer border p-0.5"
                            />
                            <Input
                              value={formData.branding?.accentColor || '#d1e3f8'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                branding: { ...prev.branding, accentColor: e.target.value }
                              }))}
                              className="text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="agentName" className="text-xs font-semibold">Lead Agent / Sign-off Name</Label>
                          <Input
                            id="agentName"
                            value={formData.branding?.agentName || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              branding: { ...prev.branding, agentName: e.target.value }
                            }))}
                            placeholder="e.g. Sarah Jenkins MNAEA"
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="website" className="text-xs font-semibold">Agency Website</Label>
                          <Input
                            id="website"
                            value={formData.branding?.website || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              branding: { ...prev.branding, website: e.target.value }
                            }))}
                            placeholder="www.jenkinsestates.co.uk"
                            className="text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <Label htmlFor="agentBio" className="text-xs font-semibold">Client Sign-off / Advisory Note (PDF Page 9)</Label>
                          <Textarea
                            id="agentBio"
                            value={formData.branding?.agentBio || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              branding: { ...prev.branding, agentBio: e.target.value }
                            }))}
                            placeholder="Add your bespoke agency sign-off, advisory disclaimer, or specialist qualifications."
                            rows={2}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Communication & Notification Preferences */}
                  <div className="pt-2 border-t border-border/60 space-y-3">
                    <Label className="font-semibold flex items-center gap-1.5 text-sm">
                      <Bell className="h-4 w-4 text-primary" /> Communication & Alert Preferences
                    </Label>
                    <div className="grid gap-2.5">
                      <label className="flex items-center gap-3 p-2.5 rounded-lg border border-border/70 hover:bg-muted/30 cursor-pointer transition-colors">
                        <input 
                          type="checkbox"
                          className="h-4 w-4 rounded text-primary focus:ring-primary border-input"
                          checked={formData.notifications?.emailAlerts ?? true}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, emailAlerts: e.target.checked }
                          }))}
                        />
                        <div className="text-xs">
                          <div className="font-medium text-foreground">Property Search Alerts</div>
                          <div className="text-muted-foreground">Receive updates when new data or pricing records match your searches</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-2.5 rounded-lg border border-border/70 hover:bg-muted/30 cursor-pointer transition-colors">
                        <input 
                          type="checkbox"
                          className="h-4 w-4 rounded text-primary focus:ring-primary border-input"
                          checked={formData.notifications?.propertyUpdates ?? true}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, propertyUpdates: e.target.checked }
                          }))}
                        />
                        <div className="text-xs">
                          <div className="font-medium text-foreground">Report Completion Notices</div>
                          <div className="text-muted-foreground">Receive an email notification when background property dossiers finish compiling</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-2.5 rounded-lg border border-border/70 hover:bg-muted/30 cursor-pointer transition-colors">
                        <input 
                          type="checkbox"
                          className="h-4 w-4 rounded text-primary focus:ring-primary border-input"
                          checked={formData.notifications?.marketingEmails ?? false}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, marketingEmails: e.target.checked }
                          }))}
                        />
                        <div className="text-xs">
                          <div className="font-medium text-foreground">Product & Regulatory Insights</div>
                          <div className="text-muted-foreground">Periodic monthly digest on UK property legislation, planning changes, and HomePack features</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="gap-2 shadow-sm"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Saving Changes...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Full Name
                      </Label>
                      <div className="flex items-center gap-2 font-medium text-foreground text-base">
                        <User className="h-4 w-4 text-primary shrink-0" />
                        {profile?.displayName || user.displayName || <span className="text-muted-foreground font-normal italic">Not specified</span>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Telephone / Mobile
                      </Label>
                      <div className="flex items-center gap-2 font-medium text-foreground text-base">
                        <Phone className="h-4 w-4 text-primary shrink-0" />
                        {profile?.phoneNumber || <span className="text-muted-foreground font-normal italic">Not provided</span>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Company / Firm
                      </Label>
                      <div className="flex items-center gap-2 font-medium text-foreground text-base">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        {profile?.company || <span className="text-muted-foreground font-normal italic">Individual / Private</span>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Property Role
                      </Label>
                      <div className="flex items-center gap-2 font-medium text-foreground text-base">
                        <Briefcase className="h-4 w-4 text-primary shrink-0" />
                        {profile?.jobTitle || <span className="text-muted-foreground font-normal italic">Not specified</span>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Default Search Region / Postcode
                      </Label>
                      <div className="flex items-center gap-2 font-medium text-foreground text-base">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        {profile?.preferredRegion ? (
                          <Badge variant="secondary" className="font-mono text-xs">
                            {profile.preferredRegion}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground font-normal italic">Any UK Region</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Last Profile Update
                      </Label>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        {profile?.updatedAt 
                          ? new Date(profile.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : 'Original registration'}
                      </div>
                    </div>
                  </div>

                  {profile?.bio && (
                    <div className="pt-3 border-t border-border/60">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Search Notes / Bio
                      </Label>
                      <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg border border-border/50 whitespace-pre-line leading-relaxed">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Notification Status Pill Summary */}
                  <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 mr-1">
                      <Bell className="h-3.5 w-3.5 text-primary" /> Active Alerts:
                    </span>
                    <Badge variant="outline" className="text-[11px] font-normal">
                      Search Alerts: {profile?.notifications?.emailAlerts !== false ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Badge variant="outline" className="text-[11px] font-normal">
                      Report Notices: {profile?.notifications?.propertyUpdates !== false ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Badge variant="outline" className="text-[11px] font-normal">
                      Newsletter: {profile?.notifications?.marketingEmails ? 'Subscribed' : 'Off'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>

            {!isEditing && (
              <CardFooter className="bg-muted/20 border-t border-border/50 py-3 px-6 flex justify-between items-center text-xs text-muted-foreground">
                <span>Need to update your contact or company details?</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-1.5 text-xs font-medium"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* SECTION 2: PROTECTED / LOCKED ACCOUNT DETAILS */}
          <Card id="protected-details-card" className="border-border/80 bg-slate-50/50 dark:bg-slate-950/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-500" />
                    Protected Account Identity
                  </CardTitle>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 text-[11px] font-medium flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Protected Items
                  </Badge>
                </div>
              </div>
              <CardDescription>
                These items are protected for security, authentication integrity, and subscription tier rules. They cannot be edited directly by users.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Account Email (Protected) */}
              <div className="p-3.5 rounded-lg border border-border bg-background/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Primary Login Email
                  </div>
                  <div className="font-semibold text-foreground text-sm sm:text-base">
                    {user.email}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tied directly to your Firebase Authentication credential. Password can be reset below.
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 self-start sm:self-center gap-1 text-xs text-muted-foreground border-dashed">
                  <Lock className="h-3 w-3 text-amber-500" /> Protected Identifier
                </Badge>
              </div>

              {/* Account Role / Tier (Protected) */}
              <div className="p-3.5 rounded-lg border border-border bg-background/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Layers className="h-3.5 w-3.5 text-primary" /> Subscription & Account Tier
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-base">
                      {roleInfo.label}
                    </span>
                    <Badge variant="outline" className={roleInfo.color}>
                      {profile?.role || 'free'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {roleInfo.desc}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <Badge variant="outline" className="gap-1 text-xs text-muted-foreground border-dashed self-start sm:self-auto">
                    <Lock className="h-3 w-3 text-amber-500" /> Protected Tier
                  </Badge>
                  {profile?.role !== 'admin' && profile?.role !== 'agency' && (
                    <Button asChild size="sm" variant="default" className="text-xs h-8">
                      <Link to="/pricing">
                        Upgrade Plan
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* User ID / UID (Protected) */}
              <div className="p-3.5 rounded-lg border border-border bg-background/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Key className="h-3.5 w-3.5 text-primary" /> Immutable User UID
                  </div>
                  <div className="font-mono text-xs sm:text-sm text-foreground truncate">
                    {user.uid}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Unique database identity key assigned by Firebase security infrastructure.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="gap-1 text-xs text-muted-foreground border-dashed">
                    <Lock className="h-3 w-3 text-amber-500" /> Immutable Key
                  </Badge>
                  <Button 
                    id="copy-uid-btn"
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyUid}
                    className="h-8 text-xs gap-1"
                  >
                    {copiedUid ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedUid ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* Registration & Search Counter (Protected) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg border border-border bg-background/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> Member Since
                    </span>
                    <Badge variant="outline" className="text-[10px] border-dashed text-muted-foreground">
                      <Lock className="h-2.5 w-2.5 mr-0.5 text-amber-500" /> Record
                    </Badge>
                  </div>
                  <div className="font-semibold text-foreground text-sm">
                    {memberSince}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Original account registration date</p>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-background/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <History className="h-3.5 w-3.5 text-primary" /> Searches Performed
                    </span>
                    <Badge variant="outline" className="text-[10px] border-dashed text-muted-foreground">
                      <Lock className="h-2.5 w-2.5 mr-0.5 text-amber-500" /> Counter
                    </Badge>
                  </div>
                  <div className="font-semibold text-foreground text-sm">
                    {profile?.searchCount ?? 0} searches logged
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Managed automatically based on your plan limits
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: ACCOUNT SECURITY & PASSWORD RESET */}
          <Card id="security-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Security & Authentication
              </CardTitle>
              <CardDescription>
                Manage your credentials and sign-in protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-muted/20">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Password Reset Link</div>
                  <div className="text-xs sm:text-sm text-muted-foreground max-w-md">
                    We will send a secure single-use password reset authorization email to <span className="font-medium text-foreground">{user.email}</span>.
                  </div>
                </div>
                <Button 
                  id="reset-password-btn"
                  variant="outline" 
                  onClick={handlePasswordReset} 
                  disabled={isResetting}
                  className="shrink-0"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {isResetting ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4: PROPERTY SEARCH HISTORY SUMMARY */}
          <Card id="history-summary-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  HomePack Property History
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-xs">
                  <Link to="/history">
                    View Full Archive <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
              <CardDescription>
                Overview of property searches and reports associated with your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {profile?.propertyReportCounts && Object.keys(profile.propertyReportCounts).length > 0 ? (
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Recent Properties Generated
                  </Label>
                  <div className="grid gap-2">
                    {Object.entries(profile.propertyReportCounts).slice(0, 5).map(([address, count]) => (
                      <div key={address} className="flex justify-between items-center p-2.5 bg-muted/40 rounded-lg border border-border/60 text-sm">
                        <span className="truncate mr-4 font-medium">{address.replace(/_/g, '.')}</span>
                        <Badge variant="secondary" className="shrink-0 font-normal text-xs">
                          {count} {count === 1 ? 'report' : 'reports'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground text-sm">
                  No property reports generated yet.
                </div>
              )}

              <Button asChild className="w-full shadow-sm">
                <Link to="/history">
                  <History className="h-4 w-4 mr-2" />
                  Open Full Search History & Reports
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

