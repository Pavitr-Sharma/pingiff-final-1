import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PrebookingData {
  productTitle: string;
  productPrice: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  quantity: number;
  userId?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export const createPrebooking = async (data: PrebookingData): Promise<string> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out. Please check your internet connection.')), 10000)
  );

  const docRef = await Promise.race([
    addDoc(collection(db, 'prebookings'), {
      ...data,
      createdAt: serverTimestamp(),
    }),
    timeoutPromise,
  ]);

  return docRef.id;
};
