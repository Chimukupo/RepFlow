import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { BMIHistoryAPI } from '@/lib/api/bmi-history';
import { queryKeys, invalidateQueries } from '@/lib/queryClient';
import type {
  BMIHistory,
  BMIHistoryCreateData,
  BMIHistoryUpdateData,
  BMIHistoryQuery,
  BMICategory
} from 'shared/schemas/bmi-history';
import { calculateBMI, getBMICategory } from 'shared/schemas/bmi-history';

// Hook to get BMI history for a user
export const useBMIHistory = (queryParams?: Partial<BMIHistoryQuery>) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.userBmiHistory(currentUser?.uid || ''),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      
      const params: BMIHistoryQuery = {
        user_id: currentUser.uid,
        limit: 30,
        offset: 0,
        ...queryParams
      };
      
      return BMIHistoryAPI.getBMIHistory(params);
    },
    enabled: !!currentUser?.uid,
    staleTime: 2 * 60 * 1000, // 2 minutes for BMI data
  });
};

// Hook to get a single BMI entry by ID
export const useBMIEntry = (entryId: string) => {
  return useQuery({
    queryKey: queryKeys.bmiEntry(entryId),
    queryFn: () => BMIHistoryAPI.getById(entryId),
    enabled: !!entryId,
  });
};

// Hook to get BMI history in a date range
export const useBMIHistoryInRange = (startDate: Date, endDate: Date) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.bmiHistoryInRange(currentUser?.uid || '', startDate, endDate),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return BMIHistoryAPI.getBMIHistoryInDateRange(currentUser.uid, startDate, endDate);
    },
    enabled: !!currentUser?.uid,
    staleTime: 1 * 60 * 1000, // Fresh data for date ranges
  });
};

// Hook to get latest BMI entry
export const useLatestBMI = () => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.latestBmi(currentUser?.uid || ''),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return BMIHistoryAPI.getLatest(currentUser.uid);
    },
    enabled: !!currentUser?.uid,
    staleTime: 1 * 60 * 1000, // Fresh latest BMI data
  });
};

// Hook to get BMI statistics
export const useBMIStats = (days: number = 90) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.bmiStats(currentUser?.uid || '', days),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return BMIHistoryAPI.getBMIStats(currentUser.uid, days);
    },
    enabled: !!currentUser?.uid,
    staleTime: 5 * 60 * 1000, // Stats can be cached longer
  });
};

// Hook to get recent BMI entries
export const useRecentBMI = (limit: number = 10) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.recentBmi(currentUser?.uid || '', limit),
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return BMIHistoryAPI.getRecent(currentUser.uid, limit);
    },
    enabled: !!currentUser?.uid,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook to get BMI entries by category
export const useBMIByCategory = (category: BMICategory) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: ['bmiHistory', 'user', currentUser?.uid || '', 'category', category],
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return BMIHistoryAPI.getBMIByCategory(currentUser.uid, category);
    },
    enabled: !!currentUser?.uid && !!category,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to create a new BMI history entry
export const useCreateBMIEntry = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bmiData: BMIHistoryCreateData) => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return BMIHistoryAPI.create(currentUser.uid, bmiData);
    },
    onMutate: async (newEntry) => {
      if (!currentUser?.uid) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.userBmiHistory(currentUser.uid) });
      
      // Snapshot previous value
      const previousEntries = queryClient.getQueryData(queryKeys.userBmiHistory(currentUser.uid));
      
      // Calculate BMI for optimistic update
      const { calculateBMI, getBMICategory } = await import('shared/schemas/bmi-history');
      const bmi = calculateBMI(newEntry.weight, newEntry.height, newEntry.units);
      const category = getBMICategory(bmi);
      
      // Optimistically update to the new value
      const optimisticEntry: BMIHistory = {
        id: 'temp-' + Date.now(),
        user_id: currentUser.uid,
        ...newEntry,
        bmi,
        category,
        recorded_at: newEntry.recorded_at || new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };
      
      queryClient.setQueryData(queryKeys.userBmiHistory(currentUser.uid), (old: BMIHistory[] | undefined) => {
        if (!old) return [optimisticEntry];
        return [optimisticEntry, ...old];
      });
      
      return { previousEntries };
    },
    onError: (_err, _newEntry, context) => {
      // Rollback on error
      if (currentUser?.uid && context?.previousEntries) {
        queryClient.setQueryData(queryKeys.userBmiHistory(currentUser.uid), context.previousEntries);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      if (currentUser?.uid) {
        invalidateQueries.bmiHistory(currentUser.uid);
      }
    },
  });
};

// Hook to update a BMI history entry
export const useUpdateBMIEntry = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ entryId, updates }: { entryId: string; updates: BMIHistoryUpdateData }) => 
      BMIHistoryAPI.update(entryId, updates),
    onMutate: async ({ entryId, updates }) => {
      if (!currentUser?.uid) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bmiEntry(entryId) });
      
      // Snapshot previous value
      const previousEntry = queryClient.getQueryData(queryKeys.bmiEntry(entryId));
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.bmiEntry(entryId), (old: BMIHistory | undefined) => {
        if (!old) return old;
        
        // Recalculate BMI if weight/height/units changed
        let newBMI = old.bmi;
        let newCategory = old.category;
        
        if (updates.weight || updates.height || updates.units) {

          const weight = updates.weight || old.weight;
          const height = updates.height || old.height;
          const units = updates.units || old.units;
          
          newBMI = calculateBMI(weight, height, units);
          newCategory = getBMICategory(newBMI);
        }
        
        return { 
          ...old, 
          ...updates, 
          bmi: newBMI,
          category: newCategory,
          updated_at: new Date() 
        };
      });
      
      return { previousEntry };
    },
    onError: (_err, { entryId }, context) => {
      // Rollback on error
      if (context?.previousEntry) {
        queryClient.setQueryData(queryKeys.bmiEntry(entryId), context.previousEntry);
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      if (currentUser?.uid) {
        invalidateQueries.bmiHistory(currentUser.uid);
      }
    },
  });
};

// Hook to delete a BMI history entry
export const useDeleteBMIEntry = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (entryId: string) => BMIHistoryAPI.delete(entryId),
    onMutate: async (entryId) => {
      if (!currentUser?.uid) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.userBmiHistory(currentUser.uid) });
      
      // Snapshot previous value
      const previousEntries = queryClient.getQueryData(queryKeys.userBmiHistory(currentUser.uid));
      
      // Optimistically remove from list
      queryClient.setQueryData(queryKeys.userBmiHistory(currentUser.uid), (old: BMIHistory[] | undefined) => {
        if (!old) return old;
        return old.filter((entry: BMIHistory) => entry.id !== entryId);
      });
      
      return { previousEntries };
    },
    onError: (_err, _entryId, context) => {
      // Rollback on error
      if (currentUser?.uid && context?.previousEntries) {
        queryClient.setQueryData(queryKeys.userBmiHistory(currentUser.uid), context.previousEntries);
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      if (currentUser?.uid) {
        invalidateQueries.bmiHistory(currentUser.uid);
      }
    },
  });
};

// Hook to create BMI entry from profile update
export const useCreateBMIFromProfile = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ weight, height, units }: { weight: number; height: number; units: 'metric' | 'imperial' }) => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return BMIHistoryAPI.createFromProfile(currentUser.uid, weight, height, units);
    },
    onSuccess: () => {
      // Invalidate BMI-related queries when profile is updated
      if (currentUser?.uid) {
        invalidateQueries.bmiHistory(currentUser.uid);
        // Also invalidate latest BMI since it might have changed
        queryClient.invalidateQueries({ queryKey: queryKeys.latestBmi(currentUser.uid) });
      }
    },
  });
}; 