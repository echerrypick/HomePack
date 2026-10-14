import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, syncUserProfile } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [baseProfile, setProfile] = useState<UserProfile | null>(null);
  const [billingOverlay, setBillingOverlay] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setProfile(null);
      setBillingOverlay(null);
      if (user) {
        // Sync profile on every auth state change to ensure data integrity and roles
        try {
          await syncUserProfile(user);
        } catch (error) {
          console.error("Error syncing user profile:", error);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const path = `users/${user.uid}`;
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        }
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        setLoading(false);
      });
      return unsubscribe;
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    let inFlight = false;
    const refreshBilling = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const status = await fetch('/api/billing/status').then(response => response.json());
        if (!active) return;
        if (!status.testMode) { setBillingOverlay(null); return; }
        setBillingOverlay({ role: baseProfile?.role === 'admin' ? 'admin' : 'free', accountType: 'consumer', purchasedPropertyKeys: [], purchasedReports: [], stripeCustomerId: undefined, stripeSubscriptionId: undefined, subscriptionStatus: undefined, subscriptionExpiresAt: 0 });
        const response = await fetch('/api/billing/profile', { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        if (!response.ok) throw new Error('Unable to load sandbox membership.');
        const data = await response.json();
        if (active) setBillingOverlay(data.profile);
      } catch { /* Sandbox access remains unavailable until verification succeeds. */ }
      finally { inFlight = false; }
    };
    void refreshBilling();
    window.addEventListener('homepack-billing-updated', refreshBilling);
    window.addEventListener('focus', refreshBilling);
    return () => { active = false; window.removeEventListener('homepack-billing-updated', refreshBilling); window.removeEventListener('focus', refreshBilling); };
  }, [user?.uid]);
  const profile = baseProfile ? { ...baseProfile, ...billingOverlay, ...(baseProfile.role === 'admin' ? { role: 'admin' as const } : {}) } : null;

  const isAdmin = profile?.role === 'admin' || (user?.emailVerified && user?.email === 'echerrypick@btinternet.com');

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
