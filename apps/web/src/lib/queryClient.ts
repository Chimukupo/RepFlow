import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized defaults for our fitness app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect by default (we'll handle this per query)
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Retry after 1 second
      retryDelay: 1000,
    },
  },
});

// Query key factory for consistent key generation
export const queryKeys = {
  // User data
  user: (userId: string) => ['user', userId] as const,
  userProfile: (userId: string) => ['user', userId, 'profile'] as const,
  
  // Workouts
  workouts: () => ['workouts'] as const,
  workout: (workoutId: string) => ['workouts', workoutId] as const,
  userWorkouts: (userId: string) => ['workouts', 'user', userId] as const,
  workoutsByDate: (userId: string, startDate: Date, endDate: Date) => 
    ['workouts', 'user', userId, 'dateRange', startDate.toISOString(), endDate.toISOString()] as const,
  workoutTemplates: (userId: string) => ['workouts', 'user', userId, 'templates'] as const,
  recentWorkouts: (userId: string, limit: number) => 
    ['workouts', 'user', userId, 'recent', limit] as const,
  
  // Goals
  goals: () => ['goals'] as const,
  goal: (goalId: string) => ['goals', goalId] as const,
  userGoals: (userId: string) => ['goals', 'user', userId] as const,
  activeGoals: (userId: string) => ['goals', 'user', userId, 'active'] as const,
  overdueGoals: (userId: string) => ['goals', 'user', userId, 'overdue'] as const,
  completedGoals: (userId: string, limit: number) => 
    ['goals', 'user', userId, 'completed', limit] as const,
  goalsByCategory: (userId: string, category: string) => 
    ['goals', 'user', userId, 'category', category] as const,
  
  // Routines
  routines: () => ['routines'] as const,
  routine: (routineId: string) => ['routines', routineId] as const,
  userRoutines: (userId: string) => ['routines', 'user', userId] as const,
  routinesForDay: (userId: string, day: string) => 
    ['routines', 'user', userId, 'day', day] as const,
  publicRoutines: (category?: string, difficulty?: string) => 
    ['routines', 'public', { category, difficulty }] as const,
  mostUsedRoutines: (userId: string, limit: number) => 
    ['routines', 'user', userId, 'mostUsed', limit] as const,
  recommendedRoutines: (difficulty: string, categories: string[]) => 
    ['routines', 'recommended', { difficulty, categories }] as const,
  
  // BMI History
  bmiHistory: () => ['bmiHistory'] as const,
  bmiEntry: (entryId: string) => ['bmiHistory', entryId] as const,
  userBmiHistory: (userId: string) => ['bmiHistory', 'user', userId] as const,
  bmiHistoryInRange: (userId: string, startDate: Date, endDate: Date) => 
    ['bmiHistory', 'user', userId, 'dateRange', startDate.toISOString(), endDate.toISOString()] as const,
  latestBmi: (userId: string) => ['bmiHistory', 'user', userId, 'latest'] as const,
  bmiStats: (userId: string, days: number) => 
    ['bmiHistory', 'user', userId, 'stats', days] as const,
  recentBmi: (userId: string, limit: number) => 
    ['bmiHistory', 'user', userId, 'recent', limit] as const,
};

// Utility function to invalidate related queries after mutations
export const invalidateQueries = {
  // Invalidate all user-related data
  user: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['user', userId] });
  },
  
  // Invalidate workout-related queries
  workouts: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['workouts'] });
    queryClient.invalidateQueries({ queryKey: ['workouts', 'user', userId] });
  },
  
  // Invalidate goal-related queries
  goals: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['goals'] });
    queryClient.invalidateQueries({ queryKey: ['goals', 'user', userId] });
  },
  
  // Invalidate routine-related queries
  routines: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['routines'] });
    queryClient.invalidateQueries({ queryKey: ['routines', 'user', userId] });
  },
  
  // Invalidate BMI history queries
  bmiHistory: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['bmiHistory'] });
    queryClient.invalidateQueries({ queryKey: ['bmiHistory', 'user', userId] });
  },
  
  // Invalidate all user data (useful after login/logout)
  allUserData: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['user', userId] });
    queryClient.invalidateQueries({ queryKey: ['workouts', 'user', userId] });
    queryClient.invalidateQueries({ queryKey: ['goals', 'user', userId] });
    queryClient.invalidateQueries({ queryKey: ['routines', 'user', userId] });
    queryClient.invalidateQueries({ queryKey: ['bmiHistory', 'user', userId] });
  },
}; 