import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function syncUser(user: any, extraData: any = {}) {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    // Initial profile creation
    await setDoc(userRef, {
      uid: user.uid,
      displayName: extraData.displayName || user.displayName || 'Farmer',
      email: user.email,
      photoURL: user.photoURL,
      role: 'farmer', 
      language: 'en',
      phone: extraData.phone || user.phoneNumber || '',
      username: extraData.username || '',
      location: null,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
  } else {
    // Update last login
    await setDoc(userRef, {
      lastLogin: serverTimestamp(),
      displayName: user.displayName || userDoc.data().displayName,
      email: user.email || userDoc.data().email,
      phone: extraData.phone || userDoc.data().phone || '',
    }, { merge: true });
  }
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUser(result.user);
    return result.user;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
}

export async function signupWithEmail(email: string, pass: string, name: string, phone: string, username: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: name });
    await syncUser(result.user, { displayName: name, phone, username });
    return result.user;
  } catch (error) {
    console.error("Signup failed", error);
    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    await syncUser(result.user);
    return result.user;
  } catch (error) {
    console.error("Email login failed", error);
    throw error;
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Reset password failed", error);
    throw error;
  }
}

export async function loginAnonymously() {
  try {
    const result = await signInAnonymously(auth);
    await syncUser(result.user);
    return result.user;
  } catch (error) {
    console.error("Anonymous login failed", error);
    throw error;
  }
}
