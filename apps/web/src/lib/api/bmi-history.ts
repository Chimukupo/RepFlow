import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  BMIHistory,
  BMIHistoryCreateData,
  BMIHistoryUpdateData,
  BMIHistoryQuery,
  BMIStats,
  BMICategory
} from 'shared/schemas/bmi-history';
import { 
  calculateBMI, 
  getBMICategory, 
  calculateBMIStats,
  createBMIHistoryEntry 
} from 'shared/schemas/bmi-history';

const COLLECTION_NAME = 'bmi_history';

// Helper function to convert Firestore data to our BMIHistory type
const convertFirestoreToBMIHistory = (doc: DocumentSnapshot): BMIHistory | null => {
  if (!doc.exists()) return null;
  
  const data = doc.data();
  return {
    id: doc.id,
    user_id: data.user_id,
    weight: data.weight,
    height: data.height,
    units: data.units,
    bmi: data.bmi,
    category: data.category,
    recorded_at: data.recorded_at.toDate(),
    notes: data.notes,
    source: data.source,
    created_at: data.created_at.toDate(),
    updated_at: data.updated_at.toDate()
  };
};

// Helper function to convert our data to Firestore format
const convertToFirestoreData = (data: BMIHistoryCreateData | BMIHistoryUpdateData) => {
  const result: Record<string, any> = {
    ...data,
    updated_at: Timestamp.now()
  };
  
  if ('recorded_at' in data && data.recorded_at) {
    result.recorded_at = Timestamp.fromDate(data.recorded_at);
  }
  
  return result;
};

export class BMIHistoryAPI {
  /**
   * Create a new BMI history entry
   */
  static async create(userId: string, bmiData: BMIHistoryCreateData): Promise<BMIHistory> {
    try {
      // Use the helper function to create a complete BMI entry
      const entryData = createBMIHistoryEntry(bmiData, userId);
      
      const firestoreData = {
        ...entryData,
        recorded_at: Timestamp.fromDate(entryData.recorded_at),
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), firestoreData);
      const newDoc = await getDoc(docRef);
      
      const bmiHistory = convertFirestoreToBMIHistory(newDoc);
      if (!bmiHistory) {
        throw new Error('Failed to create BMI history entry');
      }
      
      return bmiHistory;
    } catch (error) {
      console.error('Error creating BMI history entry:', error);
      throw new Error('Failed to create BMI history entry. Please try again.');
    }
  }

  /**
   * Get a BMI history entry by ID
   */
  static async getById(entryId: string): Promise<BMIHistory | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, entryId);
      const docSnap = await getDoc(docRef);
      
      return convertFirestoreToBMIHistory(docSnap);
    } catch (error) {
      console.error('Error fetching BMI history entry:', error);
      throw new Error('Failed to fetch BMI history entry. Please try again.');
    }
  }

  /**
   * Update a BMI history entry
   */
  static async update(entryId: string, updates: BMIHistoryUpdateData): Promise<BMIHistory> {
    try {
      const docRef = doc(db, COLLECTION_NAME, entryId);
      
      // If weight or height is being updated, recalculate BMI and category
      let firestoreData = convertToFirestoreData(updates);
      
      if (updates.weight || updates.height || updates.units) {
        const currentDoc = await getDoc(docRef);
        if (currentDoc.exists()) {
          const currentData = currentDoc.data();
          const newWeight = updates.weight || currentData.weight;
          const newHeight = updates.height || currentData.height;
          const newUnits = updates.units || currentData.units;
          
          const newBMI = calculateBMI(newWeight, newHeight, newUnits);
          const newCategory = getBMICategory(newBMI);
          
          firestoreData = {
            ...firestoreData,
            bmi: newBMI,
            category: newCategory
          };
        }
      }
      
      await updateDoc(docRef, firestoreData);
      
      const updatedDoc = await getDoc(docRef);
      const bmiHistory = convertFirestoreToBMIHistory(updatedDoc);
      
      if (!bmiHistory) {
        throw new Error('Failed to update BMI history entry');
      }
      
      return bmiHistory;
    } catch (error) {
      console.error('Error updating BMI history entry:', error);
      throw new Error('Failed to update BMI history entry. Please try again.');
    }
  }

  /**
   * Delete a BMI history entry
   */
  static async delete(entryId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, entryId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting BMI history entry:', error);
      throw new Error('Failed to delete BMI history entry. Please try again.');
    }
  }

  /**
   * Get BMI history with filtering and pagination
   */
  static async getBMIHistory(queryParams: BMIHistoryQuery): Promise<BMIHistory[]> {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', queryParams.user_id)
      );

      // Add filtering constraints
      if (queryParams.start_date) {
        q = query(q, where('recorded_at', '>=', Timestamp.fromDate(queryParams.start_date)));
      }
      
      if (queryParams.end_date) {
        q = query(q, where('recorded_at', '<=', Timestamp.fromDate(queryParams.end_date)));
      }
      
      if (queryParams.category) {
        q = query(q, where('category', '==', queryParams.category));
      }
      
      if (queryParams.source) {
        q = query(q, where('source', '==', queryParams.source));
      }

      // Add ordering and pagination
      q = query(q, orderBy('recorded_at', 'desc'));
      q = query(q, limit(queryParams.limit || 30));

      const querySnapshot = await getDocs(q);
      const entries: BMIHistory[] = [];
      
      querySnapshot.forEach((doc) => {
        const entry = convertFirestoreToBMIHistory(doc);
        if (entry) {
          entries.push(entry);
        }
      });

      return entries;
    } catch (error) {
      console.error('Error fetching BMI history:', error);
      throw new Error('Failed to fetch BMI history. Please try again.');
    }
  }

  /**
   * Get BMI history for a specific date range
   */
  static async getBMIHistoryInDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BMIHistory[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('recorded_at', '>=', Timestamp.fromDate(startDate)),
        where('recorded_at', '<=', Timestamp.fromDate(endDate)),
        orderBy('recorded_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const entries: BMIHistory[] = [];
      
      querySnapshot.forEach((doc) => {
        const entry = convertFirestoreToBMIHistory(doc);
        if (entry) {
          entries.push(entry);
        }
      });

      return entries;
    } catch (error) {
      console.error('Error fetching BMI history in date range:', error);
      throw new Error('Failed to fetch BMI history. Please try again.');
    }
  }

  /**
   * Get latest BMI entry for a user
   */
  static async getLatest(userId: string): Promise<BMIHistory | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        orderBy('recorded_at', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      return convertFirestoreToBMIHistory(querySnapshot.docs[0]);
    } catch (error) {
      console.error('Error fetching latest BMI entry:', error);
      throw new Error('Failed to fetch latest BMI entry. Please try again.');
    }
  }

  /**
   * Get BMI statistics for a user
   */
  static async getBMIStats(userId: string, days: number = 90): Promise<BMIStats> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const entries = await this.getBMIHistoryInDateRange(userId, startDate, endDate);
      
      const stats = calculateBMIStats(entries);
      
      return {
        user_id: userId,
        ...stats
      } as BMIStats;
    } catch (error) {
      console.error('Error calculating BMI stats:', error);
      throw new Error('Failed to calculate BMI statistics. Please try again.');
    }
  }

  /**
   * Get BMI entries by category
   */
  static async getBMIByCategory(userId: string, category: BMICategory): Promise<BMIHistory[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('category', '==', category),
        orderBy('recorded_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const entries: BMIHistory[] = [];
      
      querySnapshot.forEach((doc) => {
        const entry = convertFirestoreToBMIHistory(doc);
        if (entry) {
          entries.push(entry);
        }
      });

      return entries;
    } catch (error) {
      console.error('Error fetching BMI entries by category:', error);
      throw new Error('Failed to fetch BMI entries by category. Please try again.');
    }
  }

  /**
   * Get recent BMI entries
   */
  static async getRecent(userId: string, limitCount: number = 10): Promise<BMIHistory[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        orderBy('recorded_at', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const entries: BMIHistory[] = [];
      
      querySnapshot.forEach((doc) => {
        const entry = convertFirestoreToBMIHistory(doc);
        if (entry) {
          entries.push(entry);
        }
      });

      return entries;
    } catch (error) {
      console.error('Error fetching recent BMI entries:', error);
      throw new Error('Failed to fetch recent BMI entries. Please try again.');
    }
  }

  /**
   * Create BMI entry from profile update
   */
  static async createFromProfile(
    userId: string,
    weight: number,
    height: number,
    units: 'metric' | 'imperial'
  ): Promise<BMIHistory> {
    try {
      const bmiData: BMIHistoryCreateData = {
        weight,
        height,
        units,
        source: 'profile_update',
        recorded_at: new Date()
      };

      return await this.create(userId, bmiData);
    } catch (error) {
      console.error('Error creating BMI entry from profile:', error);
      throw new Error('Failed to create BMI entry from profile. Please try again.');
    }
  }
} 