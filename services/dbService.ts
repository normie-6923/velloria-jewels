import { db } from '../firebaseConfig';
import { collection, getDocs, doc, writeBatch, query, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Product, HeroSlide, Collection } from '../types';
import { PRODUCTS, HERO_SLIDES, COLLECTIONS } from '../constants';

const PRODUCTS_COLLECTION = 'products';
const SLIDES_COLLECTION = 'hero_slides';
const COLLECTIONS_COLLECTION = 'collections';

const isCollectionEmpty = async (collectionName: string) => {
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    return false;
  }
};

export const seedDatabase = async () => {
  try {
    const productsEmpty = await isCollectionEmpty(PRODUCTS_COLLECTION);
    if (productsEmpty) {
      const batch = writeBatch(db);
      PRODUCTS.forEach((product) => {
        const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
        batch.set(docRef, product);
      });
      HERO_SLIDES.forEach((slide, index) => {
        const docRef = doc(db, SLIDES_COLLECTION, `slide_${index}`);
        batch.set(docRef, { ...slide, id: `slide_${index}` });
      });
      COLLECTIONS.forEach((col) => {
        const docRef = doc(db, COLLECTIONS_COLLECTION, col.id);
        batch.set(docRef, col);
      });
      await batch.commit();
    }
  } catch (error) {
    console.warn("Skipping database seed.");
  }
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (querySnapshot.empty) return PRODUCTS;
    return querySnapshot.docs.map(doc => doc.data() as Product);
  } catch (error: any) {
    if (error.code === 'permission-denied') {
        throw new Error("PERMISSION_DENIED");
    }
    return PRODUCTS;
  }
};

export const addProduct = async (product: Product) => {
    const productRef = doc(db, PRODUCTS_COLLECTION, product.id);
    // Use merge: true to safely update existing documents without overwriting unchanged fields
    await setDoc(productRef, product, { merge: true });
};

export const removeProduct = async (id: string) => {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(productRef);
};

export const getHeroSlides = async (): Promise<HeroSlide[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, SLIDES_COLLECTION));
    if (querySnapshot.empty) return HERO_SLIDES;
    const slides = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as HeroSlide));
    return slides.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
  } catch (error: any) {
    if (error.code === 'permission-denied') {
        throw new Error("PERMISSION_DENIED");
    }
    return HERO_SLIDES;
  }
};

export const updateHeroSlide = async (id: string, slideData: Partial<HeroSlide>) => {
    const { id: _, ...dataToUpdate } = slideData;
    const slideRef = doc(db, SLIDES_COLLECTION, id);
    await updateDoc(slideRef, dataToUpdate);
};

export const getCollections = async (): Promise<Collection[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS_COLLECTION));
    if (querySnapshot.empty) return COLLECTIONS;
    return querySnapshot.docs.map(doc => doc.data() as Collection);
  } catch (error: any) {
    if (error.code === 'permission-denied') {
        throw new Error("PERMISSION_DENIED");
    }
    return COLLECTIONS;
  }
};