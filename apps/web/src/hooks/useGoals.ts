import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { GoalAPI } from '@/lib/api/goals';
import { queryKeys, invalidateQueries } from '@/lib/queryClient';
import type {
  Goal,
  GoalCreateData,
  GoalUpdateData,
  GoalQuery,
  GoalCategory
} from 'shared/schemas/goal';

// Hook to get all goals for a user
export const useGoals = (queryParams?: Partial<GoalQuery>) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.userGoals(currentUser?.uid || ''),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      
      const params: GoalQuery = {
        user_id: currentUser.uid,
        limit: 20,
        offset: 0,
        ...queryParams
      };
      
      return GoalAPI.getGoals(params);
    },
    enabled: !!currentUser?.uid,
    staleTime: 3 * 60 * 1000, // 3 minutes for goal data
  });
};

// Hook to get a single goal by ID
export const useGoal = (goalId: string) => {
  return useQuery({
    queryKey: queryKeys.goal(goalId),
    queryFn: () => GoalAPI.getById(goalId),
    enabled: !!goalId,
  });
};

// Hook to get active goals
export const useActiveGoals = () => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.activeGoals(currentUser?.uid || ''),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return GoalAPI.getActiveGoals(currentUser.uid);
    },
    enabled: !!currentUser?.uid,
    staleTime: 2 * 60 * 1000, // Fresh active goals
  });
};

// Hook to get overdue goals
export const useOverdueGoals = () => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.overdueGoals(currentUser?.uid || ''),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return GoalAPI.getOverdueGoals(currentUser.uid);
    },
    enabled: !!currentUser?.uid,
    staleTime: 1 * 60 * 1000, // Fresh overdue data
    refetchInterval: 5 * 60 * 1000, // Check for overdue goals every 5 minutes
  });
};

// Hook to get completed goals
export const useCompletedGoals = (limit: number = 10) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.completedGoals(currentUser?.uid || '', limit),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return GoalAPI.getCompletedGoals(currentUser.uid, limit);
    },
    enabled: !!currentUser?.uid,
    staleTime: 10 * 60 * 1000, // Completed goals don't change often
  });
};

// Hook to get goals by category
export const useGoalsByCategory = (category: GoalCategory) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.goalsByCategory(currentUser?.uid || '', category),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return GoalAPI.getGoalsByCategory(currentUser.uid, category);
    },
    enabled: !!currentUser?.uid && !!category,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to create a new goal
export const useCreateGoal = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (goalData: GoalCreateData) => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return GoalAPI.create(currentUser.uid, goalData);
    },
    onMutate: async (newGoal) => {
      if (!currentUser?.uid) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.userGoals(currentUser.uid) });
      
      // Snapshot previous value
      const previousGoals = queryClient.getQueryData(queryKeys.userGoals(currentUser.uid));
      
      // Optimistically update to the new value
      const optimisticGoal: Goal = {
        id: 'temp-' + Date.now(),
        user_id: currentUser.uid,
        status: 'active',
        progress_percentage: 0,
        ...newGoal,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      queryClient.setQueryData(queryKeys.userGoals(currentUser.uid), (old: Goal[] | undefined) => {
        if (!old) return [optimisticGoal];
        return [optimisticGoal, ...old];
      });
      
      return { previousGoals };
    },
    onError: (_err, _newGoal, context) => {
      // Rollback on error
      if (currentUser?.uid && context?.previousGoals) {
        queryClient.setQueryData(queryKeys.userGoals(currentUser.uid), context.previousGoals);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      if (currentUser?.uid) {
        invalidateQueries.goals(currentUser.uid);
      }
    },
  });
};

// Hook to update a goal
export const useUpdateGoal = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ goalId, updates }: { goalId: string; updates: GoalUpdateData }) => 
      GoalAPI.update(goalId, updates),
    onMutate: async ({ goalId, updates }) => {
      if (!currentUser?.uid) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.goal(goalId) });
      
      // Snapshot previous value
      const previousGoal = queryClient.getQueryData(queryKeys.goal(goalId));
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.goal(goalId), (old: Goal | undefined) => {
        if (!old) return old;
        return { ...old, ...updates, updated_at: new Date() };
      });
      
      return { previousGoal };
    },
    onError: (_err, { goalId }, context) => {
      // Rollback on error
      if (context?.previousGoal) {
        queryClient.setQueryData(queryKeys.goal(goalId), context.previousGoal);
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      if (currentUser?.uid) {
        invalidateQueries.goals(currentUser.uid);
      }
    },
  });
};

// Hook to update goal progress (special case with progress calculation)
export const useUpdateGoalProgress = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ goalId, newValue }: { goalId: string; newValue: number }) => 
      GoalAPI.updateProgress(goalId, newValue),
    onMutate: async ({ goalId, newValue }) => {
      if (!currentUser?.uid) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.goal(goalId) });
      
      // Snapshot previous value
      const previousGoal = queryClient.getQueryData(queryKeys.goal(goalId)) as Goal | undefined;
      
      if (previousGoal) {
        // Calculate optimistic progress
        const progress = Math.min(Math.round((newValue / previousGoal.target_value) * 100), 100);
        const isCompleted = progress >= 100;
        
        // Optimistically update
        queryClient.setQueryData(queryKeys.goal(goalId), {
          ...previousGoal,
          current_value: newValue,
          progress_percentage: progress,
          status: isCompleted ? 'completed' : previousGoal.status,
          completed_at: isCompleted && !previousGoal.completed_at ? new Date() : previousGoal.completed_at,
          last_updated: new Date(),
          updated_at: new Date()
        });
      }
      
      return { previousGoal };
    },
    onError: (_err, { goalId }, context) => {
      // Rollback on error
      if (context?.previousGoal) {
        queryClient.setQueryData(queryKeys.goal(goalId), context.previousGoal);
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      if (currentUser?.uid) {
        invalidateQueries.goals(currentUser.uid);
      }
    },
  });
};

// Hook to delete a goal
export const useDeleteGoal = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (goalId: string) => GoalAPI.delete(goalId),
    onMutate: async (goalId) => {
      if (!currentUser?.uid) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.userGoals(currentUser.uid) });
      
      // Snapshot previous value
      const previousGoals = queryClient.getQueryData(queryKeys.userGoals(currentUser.uid));
      
      // Optimistically remove from list
      queryClient.setQueryData(queryKeys.userGoals(currentUser.uid), (old: Goal[] | undefined) => {
        if (!old) return old;
        return old.filter((goal: Goal) => goal.id !== goalId);
      });
      
      return { previousGoals };
    },
    onError: (_err, _goalId, context) => {
      // Rollback on error
      if (currentUser?.uid && context?.previousGoals) {
        queryClient.setQueryData(queryKeys.userGoals(currentUser.uid), context.previousGoals);
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      if (currentUser?.uid) {
        invalidateQueries.goals(currentUser.uid);
      }
    },
  });
}; 