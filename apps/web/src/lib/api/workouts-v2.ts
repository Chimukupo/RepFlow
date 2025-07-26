import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Workout, WorkoutSession } from 'shared/schemas/workout';

// Collection names
const WORKOUTS_COLLECTION = 'workouts-v2';
const WORKOUT_SESSIONS_COLLECTION = 'workout-sessions';

// Helper to convert Firestore document to Workout
const convertFirestoreWorkout = (doc: any): Workout => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    description: data.description,
    exercises: data.exercises || [],
    tags: data.tags || [],
    estimatedDuration: data.estimatedDuration,
    difficulty: data.difficulty,
    category: data.category,
    isTemplate: data.isTemplate || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    createdBy: data.createdBy,
  };
};

// Helper to convert Workout to Firestore data
const convertWorkoutToFirestore = (workout: Omit<Workout, 'id'>) => {
  return {
    name: workout.name,
    description: workout.description,
    exercises: workout.exercises,
    tags: workout.tags || [],
    estimatedDuration: workout.estimatedDuration,
    difficulty: workout.difficulty,
    category: workout.category,
    isTemplate: workout.isTemplate || false,
    createdAt: Timestamp.fromDate(workout.createdAt),
    updatedAt: Timestamp.fromDate(workout.updatedAt),
    createdBy: workout.createdBy,
  };
};

export class WorkoutAPIv2 {
  // Create a new workout
  static async createWorkout(userId: string, workout: Omit<Workout, 'id'>): Promise<Workout> {
    try {
      console.log('WorkoutAPIv2.createWorkout called with:', { userId, workout });
      
      const workoutData = convertWorkoutToFirestore({
        ...workout,
        createdBy: userId,
      });
      
      console.log('Converted workout data for Firestore:', workoutData);
      console.log('Collection name:', WORKOUTS_COLLECTION);
      console.log('Database instance:', db);

      const docRef = await addDoc(collection(db, WORKOUTS_COLLECTION), workoutData);
      console.log('Document created with ID:', docRef.id);
      
      const newDoc = await getDoc(docRef);
      console.log('Retrieved document:', newDoc.exists(), newDoc.data());
      
      const result = convertFirestoreWorkout(newDoc);
      console.log('Final converted workout:', result);
      
      return result;
    } catch (error) {
      console.error('Detailed error in WorkoutAPIv2.createWorkout:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error(`Failed to create workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all workouts for a user
  static async getUserWorkouts(userId: string, isTemplate?: boolean): Promise<Workout[]> {
    try {
      let workoutQuery = query(
        collection(db, WORKOUTS_COLLECTION),
        where('createdBy', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      if (isTemplate !== undefined) {
        workoutQuery = query(
          collection(db, WORKOUTS_COLLECTION),
          where('createdBy', '==', userId),
          where('isTemplate', '==', isTemplate),
          orderBy('updatedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(workoutQuery);
      return querySnapshot.docs.map(convertFirestoreWorkout);
    } catch (error) {
      console.error('Error fetching user workouts:', error);
      throw new Error('Failed to fetch workouts');
    }
  }

  // Get a specific workout by ID
  static async getWorkout(workoutId: string): Promise<Workout | null> {
    try {
      const docRef = doc(db, WORKOUTS_COLLECTION, workoutId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return convertFirestoreWorkout(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error fetching workout:', error);
      throw new Error('Failed to fetch workout');
    }
  }

  // Update a workout
  static async updateWorkout(workoutId: string, updates: Partial<Omit<Workout, 'id'>>): Promise<Workout> {
    try {
      const docRef = doc(db, WORKOUTS_COLLECTION, workoutId);
      const updateData = convertWorkoutToFirestore({
        ...updates,
        updatedAt: new Date(),
      } as Omit<Workout, 'id'>);

      await updateDoc(docRef, updateData);
      
      const updatedDoc = await getDoc(docRef);
      return convertFirestoreWorkout(updatedDoc);
    } catch (error) {
      console.error('Error updating workout:', error);
      throw new Error('Failed to update workout');
    }
  }

  // Delete a workout
  static async deleteWorkout(workoutId: string): Promise<void> {
    try {
      const docRef = doc(db, WORKOUTS_COLLECTION, workoutId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw new Error('Failed to delete workout');
    }
  }

  // Create a workout session (for tracking actual workouts)
  static async createWorkoutSession(userId: string, session: Omit<WorkoutSession, 'id'>): Promise<WorkoutSession> {
    try {
      const sessionData = {
        ...session,
        userId,
        startTime: Timestamp.fromDate(session.startTime),
        endTime: session.endTime ? Timestamp.fromDate(session.endTime) : null,
      };

      const docRef = await addDoc(collection(db, WORKOUT_SESSIONS_COLLECTION), sessionData);
      const newDoc = await getDoc(docRef);
      const data = newDoc.data()!;
      
      return {
        id: newDoc.id,
        workoutId: data.workoutId,
        workoutName: data.workoutName,
        startTime: data.startTime.toDate(),
        endTime: data.endTime?.toDate(),
        exercises: data.exercises,
        totalDuration: data.totalDuration,
        notes: data.notes,
        completed: data.completed || false,
        userId: data.userId,
      };
    } catch (error) {
      console.error('Error creating workout session:', error);
      throw new Error('Failed to create workout session');
    }
  }

  // Get workout sessions for a user
  static async getUserWorkoutSessions(userId: string, limit?: number): Promise<WorkoutSession[]> {
    try {
      let sessionQuery = query(
        collection(db, WORKOUT_SESSIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('startTime', 'desc')
      );

      if (limit) {
        sessionQuery = query(sessionQuery, firestoreLimit(limit));
      }

      const querySnapshot = await getDocs(sessionQuery);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          workoutId: data.workoutId,
          workoutName: data.workoutName,
          startTime: data.startTime.toDate(),
          endTime: data.endTime?.toDate(),
          exercises: data.exercises,
          totalDuration: data.totalDuration,
          notes: data.notes,
          completed: data.completed || false,
          userId: data.userId,
        };
      });
    } catch (error) {
      console.error('Error fetching workout sessions:', error);
      throw new Error('Failed to fetch workout sessions');
    }
  }
} 