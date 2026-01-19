
import { db } from '../firebaseConfig';
import { collection, serverTimestamp, doc, increment, writeBatch, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { Order, CartItem, OrderStatus } from '../types';

/**
 * Creates a new order in Firestore and updates product inventory using a strictly atomic WriteBatch.
 * Requires Firestore Security Rules to allow 'create' on /orders and 'update' on /products.
 */
export const createOrder = async (userId: string, items: CartItem[], total: number, shippingDetails: any) => {
  if (!userId || userId === 'guest') {
    throw new Error("AUTH_REQUIRED");
  }

  const batch = writeBatch(db);

  try {
    const ordersRef = collection(db, 'orders');
    const newOrderDoc = doc(ordersRef); 

    const orderData = {
      userId: userId,
      userEmail: shippingDetails.email.toLowerCase(),
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        image: item.image
      })),
      total: total,
      status: 'Processing',
      shippingDetails: {
        firstName: shippingDetails.firstName,
        lastName: shippingDetails.lastName,
        address: shippingDetails.address,
        city: shippingDetails.city,
        state: shippingDetails.state,
        zip: shippingDetails.zip,
        phone: shippingDetails.phone,
        paymentMethod: shippingDetails.paymentMethod || 'COD'
      },
      createdAt: serverTimestamp(),
      date: new Date().toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
    };

    // 1. Set the Order
    batch.set(newOrderDoc, orderData);

    // 2. Update stock for each item
    items.forEach((item) => {
      const productRef = doc(db, 'products', item.id);
      batch.update(productRef, {
        stock: increment(-item.quantity)
      });
    });

    // 3. Commit
    await batch.commit();
    
    return newOrderDoc.id;
  } catch (error: any) {
    console.error("Critical Registry Failure:", error);
    if (error.code === 'permission-denied') {
      throw new Error("PERMISSION_DENIED");
    }
    throw error;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
    if (!userId) return [];
    
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Order)).sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });
    } catch (error) {
        console.error("Order fetch error:", error);
        return [];
    }
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status });
    } catch (error) {
        console.error("Status update error:", error);
    }
};

export const getAllOrders = async (): Promise<Order[]> => {
    try {
        const ordersRef = collection(db, 'orders');
        const snapshot = await getDocs(ordersRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order))
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    } catch (error) {
        return [];
    }
};
