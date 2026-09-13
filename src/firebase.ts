import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, Timestamp, addDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserProfile, UserRole, SearchedAddress } from './types';

export type { UserRole };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Disable reCAPTCHA app verification for web preview environment
auth.settings.appVerificationDisabledForTesting = true;
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const logout = () => signOut(auth);

export const resetPassword = (email: string) => firebaseSendPasswordResetEmail(auth, email);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
    // Skip logging for other errors, as this is simply a connection test.
  }
}
testConnection();

export const syncUserProfile = async (user: FirebaseUser, displayNameOverride?: string) => {
  const userDocRef = doc(db, 'users', user.uid);
  let userDoc;
  try {
    userDoc = await getDoc(userDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
  }

  if (!userDoc?.exists()) {
    const newUser: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: displayNameOverride || user.displayName || '',
      role: user.email === 'echerrypick@btinternet.com' ? 'admin' : 'free',
      searchCount: 0,
      lastSearchReset: new Date().toISOString(),
      searchedAddresses: [],
      searchHistory: [],
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(userDocRef, newUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
    return newUser;
  }

  const existingUser = userDoc.data() as UserProfile;
  // Ensure admin role for the specified email even if document already exists
  if (user.email === 'echerrypick@btinternet.com' && existingUser.role !== 'admin') {
    try {
      await updateDoc(userDocRef, { role: 'admin' });
      return { ...existingUser, role: 'admin' };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  }

  // Update displayName if it's missing in Firestore but available now
  if (!existingUser.displayName && (displayNameOverride || user.displayName)) {
    const updatedDisplayName = displayNameOverride || user.displayName || '';
    try {
      await updateDoc(userDocRef, { displayName: updatedDisplayName });
      return { ...existingUser, displayName: updatedDisplayName };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  }

  return existingUser;
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return await syncUserProfile(result.user);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Firestore Error')) {
      throw error;
    }
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, pass: string) => {
  try {
    console.log("Attempting sign in for:", email);
    const result = await firebaseSignInWithEmailAndPassword(auth, email, pass);
    console.log("Sign in successful for:", email);
    return await syncUserProfile(result.user);
  } catch (error: any) {
    console.error("Error signing in with email:", error.code, error.message);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
  try {
    const result = await firebaseCreateUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName });
    // Pass the displayName explicitly to ensure it's saved in Firestore
    return await syncUserProfile(result.user, displayName);
  } catch (error) {
    console.error("Error signing up with email:", error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
};

export type PermittedProfileUpdates = {
  displayName?: string;
  phoneNumber?: string;
  company?: string;
  jobTitle?: string;
  preferredRegion?: string;
  bio?: string;
  notifications?: {
    emailAlerts?: boolean;
    propertyUpdates?: boolean;
    marketingEmails?: boolean;
  };
};

export const updateUserProfile = async (uid: string, updates: PermittedProfileUpdates): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    
    // Only pass permitted fields
    const payload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (updates.displayName !== undefined) payload.displayName = updates.displayName.trim();
    if (updates.phoneNumber !== undefined) payload.phoneNumber = updates.phoneNumber.trim();
    if (updates.company !== undefined) payload.company = updates.company.trim();
    if (updates.jobTitle !== undefined) payload.jobTitle = updates.jobTitle.trim();
    if (updates.preferredRegion !== undefined) payload.preferredRegion = updates.preferredRegion.trim().toUpperCase();
    if (updates.bio !== undefined) payload.bio = updates.bio.trim();
    if (updates.notifications !== undefined) payload.notifications = updates.notifications;

    await updateDoc(userDocRef, payload);

    // Keep Firebase Auth displayName in sync if changed
    if (updates.displayName !== undefined && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: updates.displayName.trim() });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    throw error;
  }
};

