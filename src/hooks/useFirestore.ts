import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface Vehicle {
  id: string;
  ownerId: string;
  plateNumber: string;
  model: string;
  type: 'Car' | 'Bike';
  color?: string;
  qrUuid: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Alert {
  id: string;
  vehicleId: string;
  alertType: string;
  timestamp: Date;
  status: 'pending' | 'seen' | 'resolved';
}

// Generate unique QR UUID
const generateQrUuid = () => {
  return uuidv4().split('-')[0].toUpperCase();
};

// Hook to fetch user's vehicles
export const useVehicles = (userId: string | undefined) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!userId) {
      setVehicles([]);
      setLoading(false);
      return;
    }

    // NOTE:
    // We intentionally avoid `orderBy('createdAt')` here.
    // When `createdAt` is written as `serverTimestamp()`, the field may be
    // temporarily unset until the server resolves it, which can cause the new
    // vehicle to not appear immediately in some clients.
    // We'll sort client-side instead for consistent real-time UX.
    const q = query(collection(db, 'vehicles'), where('ownerId', '==', userId));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const vehicleList: Vehicle[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Vehicle[];

        // Sort by createdAt descending (client-side)
        vehicleList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setVehicles(vehicleList);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { vehicles, loading, error };
};

// Hook to fetch vehicle by QR UUID (for public scan view)
export const useVehicleByQrUuid = (qrUuid: string | undefined) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!qrUuid) {
      setVehicle(null);
      setLoading(false);
      return;
    }

    const fetchVehicle = async () => {
      try {
        const q = query(
          collection(db, 'vehicles'),
          where('qrUuid', '==', qrUuid)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setVehicle({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          } as Vehicle);
        } else {
          setVehicle(null);
        }
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [qrUuid]);

  return { vehicle, loading, error };
};

// Hook to fetch alerts for a user's vehicles (real-time)
export const useAlerts = (vehicleIds: string[]) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (vehicleIds.length === 0) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    // Query without orderBy to avoid needing composite index
    // We'll sort client-side instead
    const q = query(
      collection(db, 'alerts'),
      where('vehicleId', 'in', vehicleIds)
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const alertList: Alert[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as Alert[];
        
        // Sort by timestamp descending (client-side)
        alertList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setAlerts(alertList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Alerts fetch error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [vehicleIds.join(',')]);

  return { alerts, loading, error };
};

// Check if vehicle plate number already exists
export const checkPlateNumberExists = async (plateNumber: string): Promise<boolean> => {
  const normalizedPlate = plateNumber.toUpperCase().replace(/\s+/g, '');
  const q = query(
    collection(db, 'vehicles'),
    where('plateNumber', '==', normalizedPlate)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// Add a new vehicle with timeout and duplicate check
export const addVehicle = async (
  ownerId: string,
  plateNumber: string,
  model: string,
  type: 'Car' | 'Bike',
  color?: string
): Promise<string> => {
  const normalizedPlate = plateNumber.toUpperCase().replace(/\s+/g, '');
  
  // Check for duplicate plate number first
  const plateExists = await checkPlateNumberExists(normalizedPlate);
  if (plateExists) {
    throw new Error('This vehicle is already registered by another person.');
  }
  
  const qrUuid = generateQrUuid();
  
  // Set timeout for Firestore operation
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('Vehicle registration timed out. Please check your internet connection.')), 10000)
  );
  
  try {
    const docRef = await Promise.race([
      addDoc(collection(db, 'vehicles'), {
        ownerId,
        plateNumber: normalizedPlate,
        model,
        type,
        color: color || '',
        qrUuid,
        isActive: true,
        createdAt: serverTimestamp()
      }),
      timeoutPromise
    ]);

    return docRef.id;
  } catch (error: any) {
    console.error('Add vehicle error:', error);
    throw new Error(error.message || 'Failed to add vehicle. Please try again.');
  }
};

// Update vehicle
export const updateVehicle = async (
  vehicleId: string,
  data: Partial<Omit<Vehicle, 'id' | 'ownerId' | 'qrUuid' | 'createdAt'>>
) => {
  await updateDoc(doc(db, 'vehicles', vehicleId), data);
};

// Delete vehicle
export const deleteVehicle = async (vehicleId: string) => {
  await deleteDoc(doc(db, 'vehicles', vehicleId));
};

// Send an alert (from public scan view)
export const sendAlert = async (
  vehicleId: string,
  alertType: string
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'alerts'), {
    vehicleId,
    alertType,
    timestamp: serverTimestamp(),
    status: 'pending'
  });

  return docRef.id;
};

// Update alert status
export const updateAlertStatus = async (
  alertId: string,
  status: 'seen' | 'resolved'
) => {
  await updateDoc(doc(db, 'alerts', alertId), { status });
};
