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
  Routine,
  RoutineCreateData,
  RoutineUpdateData,
  RoutineQuery,
  DayOfWeek,
  RoutineCategory,
  RoutineDifficulty
} from 'shared/schemas/routine';

const COLLECTION_NAME = 'routines';

// Helper function to convert Firestore data to our Routine type
const convertFirestoreToRoutine = (doc: DocumentSnapshot): Routine | null => {
  if (!doc.exists()) return null;
  
  const data = doc.data();
  return {
    id: doc.id,
    user_id: data.user_id,
    name: data.name,
    description: data.description,
    category: data.category,
    difficulty: data.difficulty,
    exercises: data.exercises,
    schedule: data.schedule,
    estimated_duration: data.estimated_duration,
    is_public: data.is_public || false,
    tags: data.tags || [],
    times_used: data.times_used || 0,
    average_rating: data.average_rating,
    created_at: data.created_at.toDate(),
    updated_at: data.updated_at.toDate()
  };
};

// Helper function to convert our data to Firestore format
const convertToFirestoreData = (data: RoutineCreateData | RoutineUpdateData) => {
  return {
    ...data,
    updated_at: Timestamp.now()
  };
};

export class RoutineAPI {
  /**
   * Create a new routine
   */
  static async create(userId: string, routineData: RoutineCreateData): Promise<Routine> {
    try {
      const firestoreData = {
        ...convertToFirestoreData(routineData),
        user_id: userId,
        times_used: 0,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), firestoreData);
      const newDoc = await getDoc(docRef);
      
      const routine = convertFirestoreToRoutine(newDoc);
      if (!routine) {
        throw new Error('Failed to create routine');
      }
      
      return routine;
    } catch (error) {
      console.error('Error creating routine:', error);
      throw new Error('Failed to create routine. Please try again.');
    }
  }

  /**
   * Get a routine by ID
   */
  static async getById(routineId: string): Promise<Routine | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, routineId);
      const docSnap = await getDoc(docRef);
      
      return convertFirestoreToRoutine(docSnap);
    } catch (error) {
      console.error('Error fetching routine:', error);
      throw new Error('Failed to fetch routine. Please try again.');
    }
  }

  /**
   * Update a routine
   */
  static async update(routineId: string, updates: RoutineUpdateData): Promise<Routine> {
    try {
      const docRef = doc(db, COLLECTION_NAME, routineId);
      const firestoreData = convertToFirestoreData(updates);
      
      await updateDoc(docRef, firestoreData);
      
      const updatedDoc = await getDoc(docRef);
      const routine = convertFirestoreToRoutine(updatedDoc);
      
      if (!routine) {
        throw new Error('Failed to update routine');
      }
      
      return routine;
    } catch (error) {
      console.error('Error updating routine:', error);
      throw new Error('Failed to update routine. Please try again.');
    }
  }

  /**
   * Increment routine usage count
   */
  static async incrementUsage(routineId: string): Promise<Routine> {
    try {
      const docRef = doc(db, COLLECTION_NAME, routineId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Routine not found');
      }
      
      const currentData = docSnap.data();
      const newTimesUsed = (currentData.times_used || 0) + 1;
      
      await updateDoc(docRef, {
        times_used: newTimesUsed,
        updated_at: Timestamp.now()
      });
      
      const updatedDoc = await getDoc(docRef);
      const routine = convertFirestoreToRoutine(updatedDoc);
      
      if (!routine) {
        throw new Error('Failed to update routine usage');
      }
      
      return routine;
    } catch (error) {
      console.error('Error updating routine usage:', error);
      throw new Error('Failed to update routine usage. Please try again.');
    }
  }

  /**
   * Delete a routine
   */
  static async delete(routineId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, routineId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting routine:', error);
      throw new Error('Failed to delete routine. Please try again.');
    }
  }

  /**
   * Get routines with filtering and pagination
   */
  static async getRoutines(queryParams: RoutineQuery): Promise<Routine[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME));

      // Add user filter if specified
      if (queryParams.user_id) {
        q = query(q, where('user_id', '==', queryParams.user_id));
      }

      // Add filtering constraints
      if (queryParams.category) {
        q = query(q, where('category', '==', queryParams.category));
      }
      
      if (queryParams.difficulty) {
        q = query(q, where('difficulty', '==', queryParams.difficulty));
      }
      
      if (queryParams.is_public !== undefined) {
        q = query(q, where('is_public', '==', queryParams.is_public));
      }

      // Add ordering and pagination
      q = query(q, orderBy('created_at', 'desc'));
      q = query(q, limit(queryParams.limit || 20));

      const querySnapshot = await getDocs(q);
      const routines: Routine[] = [];
      
      querySnapshot.forEach((doc) => {
        const routine = convertFirestoreToRoutine(doc);
        if (routine) {
          routines.push(routine);
        }
      });

      // Client-side filtering for complex queries
      let filteredRoutines = routines;
      
      if (queryParams.search) {
        filteredRoutines = filteredRoutines.filter(routine =>
          routine.name.toLowerCase().includes(queryParams.search!.toLowerCase()) ||
          routine.description?.toLowerCase().includes(queryParams.search!.toLowerCase())
        );
      }
      
      if (queryParams.muscle_groups && queryParams.muscle_groups.length > 0) {
        filteredRoutines = filteredRoutines.filter(routine =>
          routine.exercises.some(exercise =>
            exercise.muscle_groups.some(group => 
              queryParams.muscle_groups!.includes(group)
            )
          )
        );
      }
      
      if (queryParams.tags && queryParams.tags.length > 0) {
        filteredRoutines = filteredRoutines.filter(routine =>
          routine.tags?.some(tag => 
            queryParams.tags!.includes(tag)
          )
        );
      }
      
      if (queryParams.min_duration) {
        filteredRoutines = filteredRoutines.filter(routine =>
          routine.estimated_duration && routine.estimated_duration >= queryParams.min_duration!
        );
      }
      
      if (queryParams.max_duration) {
        filteredRoutines = filteredRoutines.filter(routine =>
          routine.estimated_duration && routine.estimated_duration <= queryParams.max_duration!
        );
      }

      return filteredRoutines;
    } catch (error) {
      console.error('Error fetching routines:', error);
      throw new Error('Failed to fetch routines. Please try again.');
    }
  }

  /**
   * Get user's routines
   */
  static async getUserRoutines(userId: string): Promise<Routine[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const routines: Routine[] = [];
      
      querySnapshot.forEach((doc) => {
        const routine = convertFirestoreToRoutine(doc);
        if (routine) {
          routines.push(routine);
        }
      });

      return routines;
    } catch (error) {
      console.error('Error fetching user routines:', error);
      throw new Error('Failed to fetch user routines. Please try again.');
    }
  }

  /**
   * Get routines scheduled for a specific day
   */
  static async getRoutinesForDay(userId: string, day: DayOfWeek): Promise<Routine[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('schedule', 'array-contains', day),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const routines: Routine[] = [];
      
      querySnapshot.forEach((doc) => {
        const routine = convertFirestoreToRoutine(doc);
        if (routine) {
          routines.push(routine);
        }
      });

      return routines;
    } catch (error) {
      console.error('Error fetching routines for day:', error);
      throw new Error('Failed to fetch routines for day. Please try again.');
    }
  }

  /**
   * Get public routines (for discovery)
   */
  static async getPublicRoutines(
    category?: RoutineCategory,
    difficulty?: RoutineDifficulty,
    limitCount: number = 20
  ): Promise<Routine[]> {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('is_public', '==', true)
      );

      if (category) {
        q = query(q, where('category', '==', category));
      }
      
      if (difficulty) {
        q = query(q, where('difficulty', '==', difficulty));
      }

      q = query(q, orderBy('times_used', 'desc'), limit(limitCount));

      const querySnapshot = await getDocs(q);
      const routines: Routine[] = [];
      
      querySnapshot.forEach((doc) => {
        const routine = convertFirestoreToRoutine(doc);
        if (routine) {
          routines.push(routine);
        }
      });

      return routines;
    } catch (error) {
      console.error('Error fetching public routines:', error);
      throw new Error('Failed to fetch public routines. Please try again.');
    }
  }

  /**
   * Get routines by category
   */
  static async getRoutinesByCategory(userId: string, category: RoutineCategory): Promise<Routine[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('category', '==', category),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const routines: Routine[] = [];
      
      querySnapshot.forEach((doc) => {
        const routine = convertFirestoreToRoutine(doc);
        if (routine) {
          routines.push(routine);
        }
      });

      return routines;
    } catch (error) {
      console.error('Error fetching routines by category:', error);
      throw new Error('Failed to fetch routines by category. Please try again.');
    }
  }

  /**
   * Get most used routines
   */
  static async getMostUsedRoutines(userId: string, limitCount: number = 10): Promise<Routine[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('times_used', '>', 0),
        orderBy('times_used', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const routines: Routine[] = [];
      
      querySnapshot.forEach((doc) => {
        const routine = convertFirestoreToRoutine(doc);
        if (routine) {
          routines.push(routine);
        }
      });

      return routines;
    } catch (error) {
      console.error('Error fetching most used routines:', error);
      throw new Error('Failed to fetch most used routines. Please try again.');
    }
  }

  /**
   * Get recommended routines based on user's fitness level and goals
   */
  static async getRecommendedRoutines(
    difficulty: RoutineDifficulty,
    categories: RoutineCategory[],
    limitCount: number = 10
  ): Promise<Routine[]> {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('is_public', '==', true),
        where('difficulty', '==', difficulty)
      );

      if (categories.length === 1) {
        q = query(q, where('category', '==', categories[0]));
      }

      q = query(q, orderBy('average_rating', 'desc'), limit(limitCount * 2));

      const querySnapshot = await getDocs(q);
      const routines: Routine[] = [];
      
      querySnapshot.forEach((doc) => {
        const routine = convertFirestoreToRoutine(doc);
        if (routine) {
          routines.push(routine);
        }
      });

      // Client-side filtering for multiple categories
      let filteredRoutines = routines;
      if (categories.length > 1) {
        filteredRoutines = routines.filter(routine =>
          categories.includes(routine.category)
        );
      }

      return filteredRoutines.slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching recommended routines:', error);
      throw new Error('Failed to fetch recommended routines. Please try again.');
    }
  }
} 