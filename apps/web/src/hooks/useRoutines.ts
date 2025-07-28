import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { RoutineAPI } from '@/lib/api/routines';
import { queryKeys, invalidateQueries } from '@/lib/queryClient';
import type {
  Routine,
  RoutineCreateData,
  RoutineUpdateData,
  RoutineQuery,
  DayOfWeek,
  RoutineCategory,
  RoutineDifficulty
} from 'shared/schemas/routine';

// Hook to get all routines with filtering
export const useRoutines = (queryParams?: Partial<RoutineQuery>) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.userRoutines(currentUser?.uid || ''),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      
      const params: RoutineQuery = {
        user_id: currentUser.uid,
        limit: 20,
        offset: 0,
        ...queryParams
      };
      
      return RoutineAPI.getRoutines(params);
    },
    enabled: !!currentUser?.uid,
    staleTime: 5 * 60 * 1000, // 5 minutes for routine data
  });
};

// Hook to get a single routine by ID
export const useRoutine = (routineId: string) => {
  return useQuery({
    queryKey: queryKeys.routine(routineId),
    queryFn: () => RoutineAPI.getById(routineId),
    enabled: !!routineId,
  });
};

// Hook to get user's routines
export const useUserRoutines = () => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.userRoutines(currentUser?.uid || ''),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return RoutineAPI.getUserRoutines(currentUser.uid);
    },
    enabled: !!currentUser?.uid,
    staleTime: 3 * 60 * 1000,
  });
};

// Hook to get routines for a specific day
export const useRoutinesForDay = (day: DayOfWeek) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.routinesForDay(currentUser?.uid || '', day),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return RoutineAPI.getRoutinesForDay(currentUser.uid, day);
    },
    enabled: !!currentUser?.uid && !!day,
    staleTime: 2 * 60 * 1000, // Fresh data for daily routines
  });
};

// Hook to get public routines for discovery
export const usePublicRoutines = (category?: RoutineCategory, difficulty?: RoutineDifficulty, limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.publicRoutines(category, difficulty),
    queryFn: () => RoutineAPI.getPublicRoutines(category, difficulty, limit),
    staleTime: 10 * 60 * 1000, // Public routines don't change often
  });
};

// Hook to get most used routines
export const useMostUsedRoutines = (limit: number = 10) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.mostUsedRoutines(currentUser?.uid || '', limit),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return RoutineAPI.getMostUsedRoutines(currentUser.uid, limit);
    },
    enabled: !!currentUser?.uid,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to get recommended routines
export const useRecommendedRoutines = (difficulty: RoutineDifficulty, categories: RoutineCategory[], limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.recommendedRoutines(difficulty, categories),
    queryFn: () => RoutineAPI.getRecommendedRoutines(difficulty, categories, limit),
    enabled: !!difficulty && categories.length > 0,
    staleTime: 15 * 60 * 1000, // Recommendations can be cached longer
  });
};

// Hook to get routines by category
export const useRoutinesByCategory = (category: RoutineCategory) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: ['routines', 'user', currentUser?.uid || '', 'category', category],
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return RoutineAPI.getRoutinesByCategory(currentUser.uid, category);
    },
    enabled: !!currentUser?.uid && !!category,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to create a new routine
export const useCreateRoutine = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (routineData: RoutineCreateData) => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return RoutineAPI.create(currentUser.uid, routineData);
    },
    onMutate: async (newRoutine) => {
      if (!currentUser?.uid) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.userRoutines(currentUser.uid) });
      
      // Snapshot previous value
      const previousRoutines = queryClient.getQueryData(queryKeys.userRoutines(currentUser.uid));
      
      // Optimistically update to the new value
      const optimisticRoutine: Routine = {
        id: 'temp-' + Date.now(),
        user_id: currentUser.uid,
        times_used: 0,
        ...newRoutine,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      queryClient.setQueryData(queryKeys.userRoutines(currentUser.uid), (old: Routine[] | undefined) => {
        if (!old) return [optimisticRoutine];
        return [optimisticRoutine, ...old];
      });
      
      return { previousRoutines };
    },
    onError: (_err, _newRoutine, context) => {
      // Rollback on error
      if (currentUser?.uid && context?.previousRoutines) {
        queryClient.setQueryData(queryKeys.userRoutines(currentUser.uid), context.previousRoutines);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      if (currentUser?.uid) {
        invalidateQueries.routines(currentUser.uid);
      }
    },
  });
};

// Hook to update a routine
export const useUpdateRoutine = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ routineId, updates }: { routineId: string; updates: RoutineUpdateData }) => 
      RoutineAPI.update(routineId, updates),
    onMutate: async ({ routineId, updates }) => {
      if (!currentUser?.uid) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.routine(routineId) });
      
      // Snapshot previous value
      const previousRoutine = queryClient.getQueryData(queryKeys.routine(routineId));
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.routine(routineId), (old: Routine | undefined) => {
        if (!old) return old;
        return { ...old, ...updates, updated_at: new Date() };
      });
      
      return { previousRoutine };
    },
    onError: (_err, { routineId }, context) => {
      // Rollback on error
      if (context?.previousRoutine) {
        queryClient.setQueryData(queryKeys.routine(routineId), context.previousRoutine);
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      if (currentUser?.uid) {
        invalidateQueries.routines(currentUser.uid);
      }
    },
  });
};

// Hook to increment routine usage
export const useIncrementRoutineUsage = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (routineId: string) => RoutineAPI.incrementUsage(routineId),
    onMutate: async (routineId) => {
      if (!currentUser?.uid) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.routine(routineId) });
      
      // Snapshot previous value
      const previousRoutine = queryClient.getQueryData(queryKeys.routine(routineId));
      
      // Optimistically increment usage
      queryClient.setQueryData(queryKeys.routine(routineId), (old: Routine | undefined) => {
        if (!old) return old;
        return { 
          ...old, 
          times_used: old.times_used + 1,
          updated_at: new Date() 
        };
      });
      
      return { previousRoutine };
    },
    onError: (_err, _routineId, context) => {
      // Rollback on error
      if (context?.previousRoutine) {
        queryClient.setQueryData(queryKeys.routine(_routineId), context.previousRoutine);
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      if (currentUser?.uid) {
        invalidateQueries.routines(currentUser.uid);
        // Also invalidate most used routines since usage changed
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.mostUsedRoutines(currentUser.uid, 10) 
        });
      }
    },
  });
};

// Hook to delete a routine
export const useDeleteRoutine = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (routineId: string) => RoutineAPI.delete(routineId),
    onMutate: async (routineId) => {
      if (!currentUser?.uid) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.userRoutines(currentUser.uid) });
      
      // Snapshot previous value
      const previousRoutines = queryClient.getQueryData(queryKeys.userRoutines(currentUser.uid));
      
      // Optimistically remove from list
      queryClient.setQueryData(queryKeys.userRoutines(currentUser.uid), (old: Routine[] | undefined) => {
        if (!old) return old;
        return old.filter((routine: Routine) => routine.id !== routineId);
      });
      
      return { previousRoutines };
    },
    onError: (_err, _routineId, context) => {
      // Rollback on error
      if (currentUser?.uid && context?.previousRoutines) {
        queryClient.setQueryData(queryKeys.userRoutines(currentUser.uid), context.previousRoutines);
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      if (currentUser?.uid) {
        invalidateQueries.routines(currentUser.uid);
      }
    },
  });
}; 