
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAvowcyKc7uDe2btqTj5qpj61_dqzLUmKQ",
  authDomain: "vroica-6c470.firebaseapp.com",
  projectId: "vroica-6c470",
  storageBucket: "vroica-6c470.firebasestorage.app",
  messagingSenderId: "1047520061560",
  appId: "1:1047520061560:web:cd2fbf95b0ae41d050658d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
