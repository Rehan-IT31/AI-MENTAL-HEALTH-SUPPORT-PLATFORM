import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  User,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { encrypt, decrypt } from './crypto/encryption';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// ============================
// AUTH
// ============================

// Sign in with Google
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // ✅ Always ensure user doc exists
    await createUserDocument(user);

    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// ============================
// USER DOCUMENT
// ============================

const createUserDocument = async (user: User): Promise<void> => {
  if (!user) return;

  const userDocRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
    const { displayName, email, photoURL } = user;

    await setDoc(
      userDocRef,
      {
        displayName,
        email,
        photoURL,
        userHistory: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
};

// ============================
// MESSAGE HISTORY
// ============================

export interface MessageHistoryItem {
  message: string;
  role: 'user' | 'assistant';
}

async function decryptMessageHistory(
  encryptedHistory: any[],
  userEmail: string
): Promise<MessageHistoryItem[]> {
  const decryptedHistory: MessageHistoryItem[] = [];

  for (const item of encryptedHistory) {
    try {
      const message = item.encryptedMessage
        ? await decrypt(item.encryptedMessage, userEmail)
        : item.message || 'Unable to decrypt message';

      decryptedHistory.push({
        message,
        role: item.role,
      });
    } catch (error) {
      console.error('Error decrypting message:', error);
      decryptedHistory.push({
        message: 'Unable to decrypt message',
        role: item.role || 'user',
      });
    }
  }

  return decryptedHistory;
}

async function encryptMessageHistory(
  history: MessageHistoryItem[],
  userEmail: string
): Promise<any[]> {
  const encryptedHistory = [];

  for (const item of history) {
    try {
      const encryptedMessage = await encrypt(item.message, userEmail);
      encryptedHistory.push({
        encryptedMessage,
        role: item.role,
      });
    } catch (error) {
      console.error('Error encrypting message:', error);
      encryptedHistory.push(item);
    }
  }

  return encryptedHistory;
}

// Get message history
export const getMessageHistory = async (): Promise<MessageHistoryItem[]> => {
  let user = auth.currentUser;

  if (!user) {
    user = await waitForAuthState();
    if (!user) throw new Error('User is not authenticated');
  }

  const userDocRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userDocRef);

  if (!snapshot.exists()) return [];

  return decryptMessageHistory(
    snapshot.data().userHistory || [],
    user.email!
  );
};

// Add message
export const addMessageToHistory = async (
  newMessage: MessageHistoryItem
): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('User is not authenticated');

  const userDocRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userDocRef);

  const currentHistory = snapshot.exists()
    ? snapshot.data().userHistory || []
    : [];

  const encryptedMessage = await encrypt(newMessage.message, user.email);

  await setDoc(
    userDocRef,
    {
      userHistory: [
        ...currentHistory,
        { encryptedMessage, role: newMessage.role },
      ],
      updatedAt: serverTimestamp(),
      updatePersona: true,
    },
    { merge: true }
  );

  fetch('https://cassidyadk-d5afltb5ba-em.a.run.app/track_progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: user.uid }),
  });
};

// ============================
// AUTH STATE (🔥 IMPORTANT FIX)
// ============================

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // 🔥 CRITICAL FIX: ensure Firestore doc exists on refresh/session restore
      await createUserDocument(user);
    }
    callback(user);
  });
};

export const getCurrentUser = (): User | null => auth.currentUser;

export const waitForAuthState = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChange((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const requireAuth = async (redirectTo: string = '/login') => {
  const user = await waitForAuthState();
  if (!user) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
};

export default app;
