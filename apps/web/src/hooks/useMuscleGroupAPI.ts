import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  muscleGroupAPI, 
  MuscleGroupAPIError,
  generateWorkoutImage,
  exerciseToMuscleGroups,
  MUSCLE_GROUPS,
  type SingleColorImageParams,
  type MultiColorImageParams,
  type IndividualColorImageParams,
  type BaseImageParams,
  type MuscleGroup
} from '@/lib/api/muscleGroupAPI';

// Query keys for muscle group API
export const muscleGroupQueryKeys = {
  all: ['muscleGroups'] as const,
  lists: () => [...muscleGroupQueryKeys.all, 'list'] as const,
  images: () => [...muscleGroupQueryKeys.all, 'images'] as const,
  image: (params: any) => [...muscleGroupQueryKeys.images(), params] as const,
  workoutImage: (exercises: string[], colors: { primary: string; secondary: string }) => 
    [...muscleGroupQueryKeys.images(), 'workout', exercises, colors] as const,
};

// Hook to get all available muscle groups
export const useMuscleGroups = () => {
  return useQuery({
    queryKey: muscleGroupQueryKeys.lists(),
    queryFn: () => muscleGroupAPI.getMuscleGroups(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - muscle groups don't change
    gcTime: 24 * 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook to generate single color muscle group image
export const useSingleColorImage = (params: SingleColorImageParams) => {
  return useQuery({
    queryKey: muscleGroupQueryKeys.image({ type: 'single', ...params }),
    queryFn: () => muscleGroupAPI.getSingleColorImage(params),
    enabled: !!params.muscleGroups && !!params.color,
    staleTime: 60 * 60 * 1000, // 1 hour - images don't change often
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error instanceof MuscleGroupAPIError && error.message.includes('Invalid')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook to generate multi-color muscle group image
export const useMultiColorImage = (params: MultiColorImageParams) => {
  return useQuery({
    queryKey: muscleGroupQueryKeys.image({ type: 'multi', ...params }),
    queryFn: () => muscleGroupAPI.getMultiColorImage(params),
    enabled: !!(params.primaryMuscleGroups && params.secondaryMuscleGroups && 
                params.primaryColor && params.secondaryColor),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: (failureCount, error) => {
      if (error instanceof MuscleGroupAPIError && error.message.includes('Invalid')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook to generate individual color muscle group image
export const useIndividualColorImage = (params: IndividualColorImageParams) => {
  return useQuery({
    queryKey: muscleGroupQueryKeys.image({ type: 'individual', ...params }),
    queryFn: () => muscleGroupAPI.getIndividualColorImage(params),
    enabled: !!(params.muscleGroups && params.colors),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: (failureCount, error) => {
      if (error instanceof MuscleGroupAPIError && error.message.includes('Invalid')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook to get base human body image
export const useBaseImage = (params: BaseImageParams = {}) => {
  return useQuery({
    queryKey: muscleGroupQueryKeys.image({ type: 'base', ...params }),
    queryFn: () => muscleGroupAPI.getBaseImage(params),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - base image never changes
    gcTime: 24 * 60 * 60 * 1000,
    retry: 3,
  });
};

// Hook to generate workout visualization image
export const useWorkoutImage = (
  exercises: string[], 
  colors: { primary?: string; secondary?: string } = {}
) => {
  const primaryColor = colors.primary || '240,100,80';
  const secondaryColor = colors.secondary || '200,100,80';
  
  return useQuery({
    queryKey: muscleGroupQueryKeys.workoutImage(exercises, { primary: primaryColor, secondary: secondaryColor }),
    queryFn: () => generateWorkoutImage(exercises, primaryColor, secondaryColor),
    enabled: exercises.length > 0,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error) => {
      if (error instanceof MuscleGroupAPIError && error.message.includes('Invalid')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook to get muscle groups for specific exercises
export const useExerciseMuscleGroups = (exerciseNames: string[]) => {
  return useQuery({
    queryKey: ['exerciseMuscleGroups', exerciseNames],
    queryFn: () => {
      const muscleGroupMap = exerciseNames.reduce((acc, exercise) => {
        acc[exercise] = exerciseToMuscleGroups(exercise);
        return acc;
      }, {} as Record<string, MuscleGroup[]>);
      
      return muscleGroupMap;
    },
    enabled: exerciseNames.length > 0,
    staleTime: Infinity, // This mapping doesn't change
    gcTime: Infinity,
  });
};

// Mutation to prefetch images for a workout
export const usePrefetchWorkoutImages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (exercises: string[]) => {
      // Prefetch workout image
      await queryClient.prefetchQuery({
        queryKey: muscleGroupQueryKeys.workoutImage(exercises, { primary: '240,100,80', secondary: '200,100,80' }),
        queryFn: () => generateWorkoutImage(exercises),
        staleTime: 30 * 60 * 1000,
      });
      
      // Prefetch base image if not already cached
      await queryClient.prefetchQuery({
        queryKey: muscleGroupQueryKeys.image({ type: 'base', transparentBackground: '0' }),
        queryFn: () => muscleGroupAPI.getBaseImage(),
        staleTime: 24 * 60 * 60 * 1000,
      });
      
      return { success: true, exercisesCount: exercises.length };
    },
  });
};

// Hook to get API cache statistics
export const useAPIStats = () => {
  return useQuery({
    queryKey: ['muscleGroupAPI', 'stats'],
    queryFn: () => muscleGroupAPI.getCacheStats(),
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
};

// Mutation to clear API cache
export const useClearAPICache = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Clear external API cache
      muscleGroupAPI.clearCache();
      
      // Clear React Query cache for muscle group data
      queryClient.removeQueries({ queryKey: muscleGroupQueryKeys.all });
      
      return { success: true, clearedAt: new Date() };
    },
  });
};

// Custom hook for handling API errors
export const useMuscleGroupErrorHandler = () => {
  return {
    handleError: (error: unknown) => {
      if (error instanceof MuscleGroupAPIError) {
        // Handle specific API errors
        switch (error.statusCode) {
          case 401:
            return 'Invalid API key. Please check your RapidAPI configuration.';
          case 403:
            return 'API quota exceeded. Please try again later.';
          case 429:
            return 'Too many requests. Please wait a moment before trying again.';
          case 500:
            return 'Server error. The muscle group service is temporarily unavailable.';
          default:
            return error.message || 'An error occurred while generating the muscle group image.';
        }
      }
      
      return 'An unexpected error occurred. Please try again.';
    },
    
    isRetryableError: (error: unknown): boolean => {
      if (error instanceof MuscleGroupAPIError) {
        // Don't retry validation errors or auth errors
        if (error.message.includes('Invalid') || error.statusCode === 401) {
          return false;
        }
        // Retry server errors and rate limits
        return [429, 500, 502, 503, 504].includes(error.statusCode || 0);
      }
      return true;
    }
  };
};

// Utility hook for common muscle group operations
export const useMuscleGroupUtils = () => {
  return {
    // Convert RGB to hex
    rgbToHex: (r: number, g: number, b: number): string => {
      return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    
    // Convert hex to RGB string for API
    hexToRgb: (hex: string): string => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) throw new Error('Invalid hex color');
      
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      
      return `${r},${g},${b}`;
    },
    
    // Get muscle groups from exercise list
    getMuscleGroupsFromExercises: (exercises: string[]): MuscleGroup[] => {
      const allGroups = exercises.flatMap(exerciseToMuscleGroups);
      return [...new Set(allGroups)]; // Remove duplicates
    },
    
    // Validate muscle group names
    isValidMuscleGroup: (group: string): group is MuscleGroup => {
      return MUSCLE_GROUPS.includes(group as MuscleGroup);
    }
  };
};