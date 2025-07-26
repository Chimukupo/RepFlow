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
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Workout,
  WorkoutCreateData,
  WorkoutUpdateData,
  WorkoutQuery
} from 'shared/schemas/workout';

const COLLECTION_NAME = 'workouts';

// Helper function to convert Firestore data to our Workout type
const convertFirestoreToWorkout = (doc: DocumentSnapshot): Workout | null => {
  if (!doc.exists()) return null;
  
  const data = doc.data();
  return {
    id: doc.id,
    user_id: data.user_id,
    name: data.name,
    date: data.date.toDate(),
    exercises: data.exercises,
    duration: data.duration,
    notes: data.notes,
    is_template: data.is_template || false,
    created_at: data.created_at.toDate(),
    updated_at: data.updated_at.toDate()
  };
};

// Helper function to convert our data to Firestore format
const convertToFirestoreData = (data: WorkoutCreateData | WorkoutUpdateData) => {
  return {
    ...data,
    date: data.date ? Timestamp.fromDate(data.date) : undefined,
    updated_at: Timestamp.now()
  };
};

export class WorkoutAPI {
  /**
   * Create a new workout
   */
  static async create(userId: string, workoutData: WorkoutCreateData): Promise<Workout> {
    try {
      const firestoreData = {
        ...convertToFirestoreData(workoutData),
        user_id: userId,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), firestoreData);
      const newDoc = await getDoc(docRef);
      
      const workout = convertFirestoreToWorkout(newDoc);
      if (!workout) {
        throw new Error('Failed to create workout');
      }
      
      return workout;
    } catch (error) {
      console.error('Error creating workout:', error);
      throw new Error('Failed to create workout. Please try again.');
    }
  }

  /**
   * Get a workout by ID
   */
  static async getById(workoutId: string): Promise<Workout | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, workoutId);
      const docSnap = await getDoc(docRef);
      
      return convertFirestoreToWorkout(docSnap);
    } catch (error) {
      console.error('Error fetching workout:', error);
      throw new Error('Failed to fetch workout. Please try again.');
    }
  }

  /**
   * Update a workout
   */
  static async update(workoutId: string, updates: WorkoutUpdateData): Promise<Workout> {
    try {
      const docRef = doc(db, COLLECTION_NAME, workoutId);
      const firestoreData = convertToFirestoreData(updates);
      
      await updateDoc(docRef, firestoreData);
      
      const updatedDoc = await getDoc(docRef);
      const workout = convertFirestoreToWorkout(updatedDoc);
      
      if (!workout) {
        throw new Error('Failed to update workout');
      }
      
      return workout;
    } catch (error) {
      console.error('Error updating workout:', error);
      throw new Error('Failed to update workout. Please try again.');
    }
  }

  /**
   * Delete a workout
   */
  static async delete(workoutId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, workoutId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw new Error('Failed to delete workout. Please try again.');
    }
  }

  /**
   * Get workouts with filtering and pagination
   */
  static async getWorkouts(queryParams: WorkoutQuery): Promise<{
    workouts: Workout[];
    hasMore: boolean;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const constraints: QueryConstraint[] = [
        where('user_id', '==', queryParams.user_id)
      ];

      // Add filtering constraints
      if (queryParams.start_date) {
        constraints.push(where('date', '>=', Timestamp.fromDate(queryParams.start_date)));
      }
      
      if (queryParams.end_date) {
        constraints.push(where('date', '<=', Timestamp.fromDate(queryParams.end_date)));
      }
      
      if (queryParams.exercise_name) {
        // Note: This requires a more complex query structure for array searching
        // For now, we'll filter client-side after fetching
      }
      
      if (queryParams.muscle_groups && queryParams.muscle_groups.length > 0) {
        // Note: Complex array filtering - might need client-side filtering
      }
      
      if (queryParams.is_template !== undefined) {
        constraints.push(where('is_template', '==', queryParams.is_template));
      }

      // Add ordering and pagination
      constraints.push(orderBy('date', 'desc'));
      constraints.push(limit(queryParams.limit || 20));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const workouts: Workout[] = [];
      querySnapshot.forEach((doc) => {
        const workout = convertFirestoreToWorkout(doc);
        if (workout) {
          workouts.push(workout);
        }
      });

      // Client-side filtering for complex queries
      let filteredWorkouts = workouts;
      
      if (queryParams.exercise_name) {
        filteredWorkouts = filteredWorkouts.filter(workout =>
          workout.exercises.some(exercise => 
            exercise.name.toLowerCase().includes(queryParams.exercise_name!.toLowerCase())
          )
        );
      }
      
      if (queryParams.muscle_groups && queryParams.muscle_groups.length > 0) {
        filteredWorkouts = filteredWorkouts.filter(workout =>
          workout.exercises.some(exercise =>
            exercise.muscle_groups.some(group => 
              queryParams.muscle_groups!.includes(group)
            )
          )
        );
      }

      const hasMore = querySnapshot.docs.length === (queryParams.limit || 20);
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        workouts: filteredWorkouts,
        hasMore,
        lastDoc
      };
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw new Error('Failed to fetch workouts. Please try again.');
    }
  }

  /**
   * Get workouts for a specific date range (useful for gamification)
   */
  static async getWorkoutsInDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Workout[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const workouts: Workout[] = [];
      
      querySnapshot.forEach((doc) => {
        const workout = convertFirestoreToWorkout(doc);
        if (workout) {
          workouts.push(workout);
        }
      });

      return workouts;
    } catch (error) {
      console.error('Error fetching workouts in date range:', error);
      throw new Error('Failed to fetch workouts. Please try again.');
    }
  }

  /**
   * Get workout templates for a user
   */
  static async getTemplates(userId: string): Promise<Workout[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('is_template', '==', true),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const templates: Workout[] = [];
      
      querySnapshot.forEach((doc) => {
        const workout = convertFirestoreToWorkout(doc);
        if (workout) {
          templates.push(workout);
        }
      });

      return templates;
    } catch (error) {
      console.error('Error fetching workout templates:', error);
      throw new Error('Failed to fetch workout templates. Please try again.');
    }
  }

  /**
   * Get recent workouts for a user
   */
  static async getRecent(userId: string, limitCount: number = 10): Promise<Workout[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('is_template', '==', false),
        orderBy('date', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const workouts: Workout[] = [];
      
      querySnapshot.forEach((doc) => {
        const workout = convertFirestoreToWorkout(doc);
        if (workout) {
          workouts.push(workout);
        }
      });

      return workouts;
    } catch (error) {
      console.error('Error fetching recent workouts:', error);
      throw new Error('Failed to fetch recent workouts. Please try again.');
    }
  }
} 