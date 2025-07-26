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
  Goal,
  GoalCreateData,
  GoalUpdateData,
  GoalQuery,
  GoalStatus,
  GoalCategory
} from 'shared/schemas/goal';

const COLLECTION_NAME = 'goals';

// Helper function to convert Firestore data to our Goal type
const convertFirestoreToGoal = (doc: DocumentSnapshot): Goal | null => {
  if (!doc.exists()) return null;
  
  const data = doc.data();
  return {
    id: doc.id,
    user_id: data.user_id,
    title: data.title,
    description: data.description,
    category: data.category,
    type: data.type,
    priority: data.priority,
    status: data.status || 'active',
    target_value: data.target_value,
    current_value: data.current_value,
    unit: data.unit,
    target_date: data.target_date.toDate(),
    related_exercise: data.related_exercise,
    related_muscle_groups: data.related_muscle_groups,
    milestones: data.milestones?.map((milestone: any) => ({
      ...milestone,
      completed_at: milestone.completed_at?.toDate(),
      created_at: milestone.created_at.toDate()
    })),
    is_public: data.is_public || false,
    reminder_frequency: data.reminder_frequency,
    progress_percentage: data.progress_percentage || 0,
    last_updated: data.last_updated?.toDate(),
    completed_at: data.completed_at?.toDate(),
    created_at: data.created_at.toDate(),
    updated_at: data.updated_at.toDate()
  };
};

// Helper function to convert our data to Firestore format
const convertToFirestoreData = (data: GoalCreateData | GoalUpdateData) => {
  const result: Record<string, any> = {
    ...data,
    updated_at: Timestamp.now()
  };
  
  if (data.target_date) {
    result.target_date = Timestamp.fromDate(data.target_date);
  }
  
  if ('last_updated' in data && data.last_updated) {
    result.last_updated = Timestamp.fromDate(data.last_updated);
  }
  
  if ('completed_at' in data && data.completed_at) {
    result.completed_at = Timestamp.fromDate(data.completed_at);
  }
  
  if (data.milestones) {
    result.milestones = data.milestones.map(milestone => ({
      ...milestone,
      completed_at: milestone.completed_at ? Timestamp.fromDate(milestone.completed_at) : undefined,
      created_at: milestone.created_at ? Timestamp.fromDate(milestone.created_at) : Timestamp.now()
    }));
  }
  
  return result;
};

export class GoalAPI {
  /**
   * Create a new goal
   */
  static async create(userId: string, goalData: GoalCreateData): Promise<Goal> {
    try {
      const firestoreData = {
        ...convertToFirestoreData(goalData),
        user_id: userId,
        status: 'active',
        progress_percentage: 0,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), firestoreData);
      const newDoc = await getDoc(docRef);
      
      const goal = convertFirestoreToGoal(newDoc);
      if (!goal) {
        throw new Error('Failed to create goal');
      }
      
      return goal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw new Error('Failed to create goal. Please try again.');
    }
  }

  /**
   * Get a goal by ID
   */
  static async getById(goalId: string): Promise<Goal | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, goalId);
      const docSnap = await getDoc(docRef);
      
      return convertFirestoreToGoal(docSnap);
    } catch (error) {
      console.error('Error fetching goal:', error);
      throw new Error('Failed to fetch goal. Please try again.');
    }
  }

  /**
   * Update a goal
   */
  static async update(goalId: string, updates: GoalUpdateData): Promise<Goal> {
    try {
      const docRef = doc(db, COLLECTION_NAME, goalId);
      const firestoreData = convertToFirestoreData(updates);
      
      await updateDoc(docRef, firestoreData);
      
      const updatedDoc = await getDoc(docRef);
      const goal = convertFirestoreToGoal(updatedDoc);
      
      if (!goal) {
        throw new Error('Failed to update goal');
      }
      
      return goal;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw new Error('Failed to update goal. Please try again.');
    }
  }

  /**
   * Update goal progress
   */
  static async updateProgress(goalId: string, newValue: number): Promise<Goal> {
    try {
      const docRef = doc(db, COLLECTION_NAME, goalId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Goal not found');
      }
      
      const currentGoal = convertFirestoreToGoal(docSnap);
      if (!currentGoal) {
        throw new Error('Failed to parse goal data');
      }
      
      // Calculate progress percentage
      const progress = Math.min(Math.round((newValue / currentGoal.target_value) * 100), 100);
      const isCompleted = progress >= 100;
      
      const updates = {
        current_value: newValue,
        progress_percentage: progress,
        status: isCompleted ? 'completed' as GoalStatus : currentGoal.status,
        completed_at: isCompleted && !currentGoal.completed_at ? Timestamp.now() : undefined,
        last_updated: Timestamp.now(),
        updated_at: Timestamp.now()
      };
      
      await updateDoc(docRef, updates);
      
      const updatedDoc = await getDoc(docRef);
      const goal = convertFirestoreToGoal(updatedDoc);
      
      if (!goal) {
        throw new Error('Failed to update goal progress');
      }
      
      return goal;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw new Error('Failed to update goal progress. Please try again.');
    }
  }

  /**
   * Delete a goal
   */
  static async delete(goalId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, goalId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw new Error('Failed to delete goal. Please try again.');
    }
  }

  /**
   * Get goals with filtering and pagination
   */
  static async getGoals(queryParams: GoalQuery): Promise<Goal[]> {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', queryParams.user_id)
      );

      // Add filtering constraints
      if (queryParams.category) {
        q = query(q, where('category', '==', queryParams.category));
      }
      
      if (queryParams.type) {
        q = query(q, where('type', '==', queryParams.type));
      }
      
      if (queryParams.status) {
        q = query(q, where('status', '==', queryParams.status));
      }
      
      if (queryParams.priority) {
        q = query(q, where('priority', '==', queryParams.priority));
      }
      
      if (queryParams.is_public !== undefined) {
        q = query(q, where('is_public', '==', queryParams.is_public));
      }

      // Add date range filtering
      if (queryParams.target_date_before) {
        q = query(q, where('target_date', '<=', Timestamp.fromDate(queryParams.target_date_before)));
      }
      
      if (queryParams.target_date_after) {
        q = query(q, where('target_date', '>=', Timestamp.fromDate(queryParams.target_date_after)));
      }

      // Add ordering and pagination
      q = query(q, orderBy('created_at', 'desc'));
      q = query(q, limit(queryParams.limit || 20));

      const querySnapshot = await getDocs(q);
      const goals: Goal[] = [];
      
      querySnapshot.forEach((doc) => {
        const goal = convertFirestoreToGoal(doc);
        if (goal) {
          goals.push(goal);
        }
      });

      // Client-side text search if needed
      if (queryParams.search) {
        return goals.filter(goal =>
          goal.title.toLowerCase().includes(queryParams.search!.toLowerCase()) ||
          goal.description?.toLowerCase().includes(queryParams.search!.toLowerCase())
        );
      }

      return goals;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw new Error('Failed to fetch goals. Please try again.');
    }
  }

  /**
   * Get active goals for a user
   */
  static async getActiveGoals(userId: string): Promise<Goal[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('status', '==', 'active'),
        orderBy('priority', 'desc'),
        orderBy('target_date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const goals: Goal[] = [];
      
      querySnapshot.forEach((doc) => {
        const goal = convertFirestoreToGoal(doc);
        if (goal) {
          goals.push(goal);
        }
      });

      return goals;
    } catch (error) {
      console.error('Error fetching active goals:', error);
      throw new Error('Failed to fetch active goals. Please try again.');
    }
  }

  /**
   * Get overdue goals for a user
   */
  static async getOverdueGoals(userId: string): Promise<Goal[]> {
    try {
      const today = new Date();
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('status', '==', 'active'),
        where('target_date', '<', Timestamp.fromDate(today)),
        orderBy('target_date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const goals: Goal[] = [];
      
      querySnapshot.forEach((doc) => {
        const goal = convertFirestoreToGoal(doc);
        if (goal) {
          goals.push(goal);
        }
      });

      return goals;
    } catch (error) {
      console.error('Error fetching overdue goals:', error);
      throw new Error('Failed to fetch overdue goals. Please try again.');
    }
  }

  /**
   * Get goals by category
   */
  static async getGoalsByCategory(userId: string, category: GoalCategory): Promise<Goal[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('category', '==', category),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const goals: Goal[] = [];
      
      querySnapshot.forEach((doc) => {
        const goal = convertFirestoreToGoal(doc);
        if (goal) {
          goals.push(goal);
        }
      });

      return goals;
    } catch (error) {
      console.error('Error fetching goals by category:', error);
      throw new Error('Failed to fetch goals by category. Please try again.');
    }
  }

  /**
   * Get completed goals for a user
   */
  static async getCompletedGoals(userId: string, limitCount: number = 10): Promise<Goal[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('status', '==', 'completed'),
        orderBy('completed_at', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const goals: Goal[] = [];
      
      querySnapshot.forEach((doc) => {
        const goal = convertFirestoreToGoal(doc);
        if (goal) {
          goals.push(goal);
        }
      });

      return goals;
    } catch (error) {
      console.error('Error fetching completed goals:', error);
      throw new Error('Failed to fetch completed goals. Please try again.');
    }
  }
} 