import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { WorkoutAPI } from '@/lib/api/workouts';
import { queryKeys, invalidateQueries } from '@/lib/queryClient';
import type {
  LegacyWorkout,
  WorkoutCreateData,
  WorkoutUpdateData,
  WorkoutQuery
} from 'shared/schemas/workout';

// Hook to get all workouts for a user with filtering
export const useWorkouts = (queryParams?: Partial<WorkoutQuery>) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.userWorkouts(currentUser?.uid || ''),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      
      const params: WorkoutQuery = {
        user_id: currentUser.uid,
        limit: 20,
        offset: 0,
        ...queryParams
      };
      
      return WorkoutAPI.getWorkouts(params);
    },
    enabled: !!currentUser?.uid,
    staleTime: 2 * 60 * 1000, // 2 minutes for workout data
  });
};

// Hook to get a single workout by ID
export const useWorkout = (workoutId: string) => {
  return useQuery({
    queryKey: queryKeys.workout(workoutId),
    queryFn: () => WorkoutAPI.getById(workoutId),
    enabled: !!workoutId,
  });
};

// Hook to get workouts in a date range
export const useWorkoutsByDateRange = (startDate: Date, endDate: Date) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.workoutsByDate(currentUser?.uid || '', startDate, endDate),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return WorkoutAPI.getWorkoutsInDateRange(currentUser.uid, startDate, endDate);
    },
    enabled: !!currentUser?.uid,
    staleTime: 1 * 60 * 1000, // Fresh data for date ranges
  });
};

// Hook to get workout templates
export const useWorkoutTemplates = () => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.workoutTemplates(currentUser?.uid || ''),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return WorkoutAPI.getTemplates(currentUser.uid);
    },
    enabled: !!currentUser?.uid,
    staleTime: 10 * 60 * 1000, // Templates don't change often
  });
};

// Hook to get recent workouts
export const useRecentWorkouts = (limit: number = 10) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.recentWorkouts(currentUser?.uid || '', limit),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return WorkoutAPI.getRecent(currentUser.uid, limit);
    },
    enabled: !!currentUser?.uid,
    staleTime: 1 * 60 * 1000, // Fresh recent data
  });
};

// Hook to create a new workout
export const useCreateWorkout = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (workoutData: WorkoutCreateData) => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return WorkoutAPI.create(currentUser.uid, workoutData);
    },
    onMutate: async (newWorkout) => {
      if (!currentUser?.uid) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.userWorkouts(currentUser.uid) });
      
      // Snapshot previous value
      const previousWorkouts = queryClient.getQueryData(queryKeys.userWorkouts(currentUser.uid));
      
      // Optimistically update to the new value
      const optimisticWorkout = {
        id: 'temp-' + Date.now(),
        user_id: currentUser.uid,
        ...newWorkout,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      queryClient.setQueryData(queryKeys.userWorkouts(currentUser.uid), (old: any) => {
        if (!old) return { workouts: [optimisticWorkout], hasMore: false };
        return { ...old, workouts: [optimisticWorkout, ...old.workouts] };
      });
      
      return { previousWorkouts };
    },
    onError: (_err, _newWorkout, context) => {
      // Rollback on error
      if (currentUser?.uid && context?.previousWorkouts) {
        queryClient.setQueryData(queryKeys.userWorkouts(currentUser.uid), context.previousWorkouts);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      if (currentUser?.uid) {
        invalidateQueries.workouts(currentUser.uid);
      }
    },
  });
};

// Hook to update a workout
export const useUpdateWorkout = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workoutId, updates }: { workoutId: string; updates: WorkoutUpdateData }) => 
      WorkoutAPI.update(workoutId, updates),
    onMutate: async ({ workoutId, updates }) => {
      if (!currentUser?.uid) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.workout(workoutId) });
      
      // Snapshot previous value
      const previousWorkout = queryClient.getQueryData(queryKeys.workout(workoutId));
      
             // Optimistically update
       queryClient.setQueryData(queryKeys.workout(workoutId), (old: LegacyWorkout | undefined) => {
         if (!old) return old;
         return { ...old, ...updates, updated_at: new Date() };
       });
      
      return { previousWorkout };
    },
    onError: (_err, { workoutId }, context) => {
      // Rollback on error
      if (context?.previousWorkout) {
        queryClient.setQueryData(queryKeys.workout(workoutId), context.previousWorkout);
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      if (currentUser?.uid) {
        invalidateQueries.workouts(currentUser.uid);
      }
    },
  });
};

// Hook to delete a workout
export const useDeleteWorkout = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (workoutId: string) => WorkoutAPI.delete(workoutId),
    onMutate: async (workoutId) => {
      if (!currentUser?.uid) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.userWorkouts(currentUser.uid) });
      
      // Snapshot previous value
      const previousWorkouts = queryClient.getQueryData(queryKeys.userWorkouts(currentUser.uid));
      
      // Optimistically remove from list
      queryClient.setQueryData(queryKeys.userWorkouts(currentUser.uid), (old: any) => {
        if (!old) return old;
                 return {
           ...old,
           workouts: old.workouts.filter((workout: LegacyWorkout) => workout.id !== workoutId)
         };
      });
      
      return { previousWorkouts };
    },
    onError: (_err, _workoutId, context) => {
      // Rollback on error
      if (currentUser?.uid && context?.previousWorkouts) {
        queryClient.setQueryData(queryKeys.userWorkouts(currentUser.uid), context.previousWorkouts);
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      if (currentUser?.uid) {
        invalidateQueries.workouts(currentUser.uid);
      }
    },
  });
}; 