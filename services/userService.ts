
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs } from 'firebase/firestore';
import { User, Address, SavedCard, UserStatus, UserProfileData } from '../types';

export const createUserDocument = async (user: User, uid: string) => {
  if (!user) return;
  const userRef = doc(db, 'users', uid);
  
  try {
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
      const isInitialAdmin = user.email.toLowerCase().includes('admin');
      
      const newUser: UserProfileData = {
        uid,
        name: user.name,
        email: user.email.toLowerCase(), 
        emailVerified: user.emailVerified,
        role: isInitialAdmin ? 'admin' : 'customer', 
        status: 'active', 
        phone: user.phone || '',
        addresses: [], 
        savedCards: [],
        wishlist: [],
        createdAt: new Date().toISOString()
      };
      await setDoc(userRef, newUser);
    }
  } catch (error: any) {
      console.warn("Could not create user document.");
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      // Defensive: Ensure wishlist is always an array
      return { 
          ...data,
          wishlist: data.wishlist || []
      } as UserProfileData;
    }
    return null;
  } catch (error: any) {
    return null;
  }
};

export const toggleWishlistItem = async (uid: string, productId: string, isAdding: boolean) => {
    const userRef = doc(db, 'users', uid);
    try {
        await updateDoc(userRef, {
            wishlist: isAdding ? arrayUnion(productId) : arrayRemove(productId)
        });
    } catch (e) {
        // Fallback for docs that don't exist or missing field permissions
        await setDoc(userRef, { 
            wishlist: isAdding ? [productId] : [] 
        }, { merge: true });
    }
};

export const getAllUsers = async (): Promise<UserProfileData[]> => {
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return { uid: doc.id, ...data, wishlist: data.wishlist || [] } as UserProfileData;
        });
    } catch (error: any) {
        if (error.code === 'permission-denied') throw new Error("PERMISSION_DENIED");
        return [];
    }
};

export const updateUserFields = async (uid: string, data: Partial<UserProfileData>) => {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, data);
  } catch (error) {
    await setDoc(userRef, data, { merge: true });
  }
};

export const addUserAddress = async (uid: string, address: Address) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    addresses: arrayUnion(address)
  });
};

export const removeUserAddress = async (uid: string, address: Address) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        addresses: arrayRemove(address)
    });
};

export const updateUserStatus = async (uid: string, status: UserStatus) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { status });
};
