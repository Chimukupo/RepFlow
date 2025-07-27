import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { muscleGroupAPI } from '@/lib/api/muscleGroupAPI';
import type { Exercise } from 'shared/data/exercise-types';
import { muscleGroupQueryKeys } from './useMuscleGroupAPI';
import { env } from '@/env';

interface MuscleImageState {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

// Map exercise muscle names to API muscle groups
const mapMuscleToAPIGroup = (muscle: string): string => {
  const muscleMapping: Record<string, string> = {
    // Common mappings from exercise data to API muscle groups
    'chest': 'chest',
    'triceps': 'triceps',
    'shoulders': 'shoulders',
    'biceps': 'biceps',
    'back': 'back',
    'lats': 'latissimus',
    'latissimus dorsi': 'latissimus',
    'quadriceps': 'quadriceps',
    'quads': 'quadriceps',
    'hamstrings': 'hamstring',
    'glutes': 'gluteus',
    'gluteus': 'gluteus',
    'calves': 'calfs',
    'abs': 'abs',
    'abdominals': 'abs',
    'core': 'core',
    'forearms': 'forearms',
    'traps': 'back_upper',
    'trapezius': 'back_upper',
    'lower back': 'back_lower',
    'upper back': 'back_upper',
    'neck': 'neck',
    'adductors': 'adductors',
    'abductors': 'abductors',
    'hip flexors': 'core_lower',
    'obliques': 'core',
    'serratus anterior': 'core_upper',
    'rhomboids': 'back_upper',
    'rear delts': 'shoulders_back',
    'front delts': 'shoulders_front',
    'side delts': 'shoulders',
    'middle delts': 'shoulders'
  };

  const normalized = muscle.toLowerCase().trim();
  return muscleMapping[normalized] || 'all';
};

// Hook for single exercise muscle image
export const useMuscleGroupImage = (exercise: Exercise | null, color: string = '70,130,180') => {
  const apiMuscleGroups = exercise?.primaryMuscles
    .map(mapMuscleToAPIGroup)
    .filter((group, index, self) => self.indexOf(group) === index) // Remove duplicates
    .join(',') || '';

  return useQuery({
    queryKey: muscleGroupQueryKeys.image({ 
      muscleGroups: apiMuscleGroups, 
      color, 
      exerciseId: exercise?.id 
    }),
    queryFn: async () => {
      if (!exercise || !apiMuscleGroups) {
        return null;
      }

      console.log('🔍 Generating muscle image for:', exercise.name);
      console.log('🎯 API muscle groups:', apiMuscleGroups);
      console.log('🎨 Color:', color);
      console.log('🔑 API Key configured:', !!env.VITE_RAPIDAPI_KEY);
      console.log('🔑 API Key length:', env.VITE_RAPIDAPI_KEY?.length || 0);

      try {
        const response = await muscleGroupAPI.getSingleColorImage({
          muscleGroups: apiMuscleGroups,
          color: color,
          transparentBackground: '1'
        });

        console.log('✅ API Response:', response);
        return response.imageUrl;
      } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
      }
    },
    enabled: !!exercise && !!apiMuscleGroups,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

// Hook for multiple exercises (optimized for batch processing)
export const useMuscleGroupImages = (exercises: Exercise[], color: string = '70,130,180') => {
  const [imageStates, setImageStates] = useState<Record<string, MuscleImageState>>({});

  const generateImage = useCallback(async (exercise: Exercise) => {
    const exerciseId = exercise.id;
    
    // Set loading state
    setImageStates(prev => ({
      ...prev,
      [exerciseId]: { imageUrl: null, isLoading: true, error: null }
    }));

    try {
      const apiMuscleGroups = exercise.primaryMuscles
        .map(mapMuscleToAPIGroup)
        .filter((group, index, self) => self.indexOf(group) === index)
        .join(',');

      if (!apiMuscleGroups) {
        setImageStates(prev => ({
          ...prev,
          [exerciseId]: { imageUrl: null, isLoading: false, error: 'No muscle groups found' }
        }));
        return;
      }

      console.log(`🔍 Generating batch image for: ${exercise.name}`);
      console.log(`🎯 API muscle groups: ${apiMuscleGroups}`);
      console.log(`🎨 Color: ${color}`);

      const response = await muscleGroupAPI.getSingleColorImage({
        muscleGroups: apiMuscleGroups,
        color: color,
        transparentBackground: '1'
      });

      console.log(`✅ Batch API Response for ${exercise.name}:`, response);

      setImageStates(prev => ({
        ...prev,
        [exerciseId]: {
          imageUrl: response.imageUrl,
          isLoading: false,
          error: null
        }
      }));
    } catch (error) {
      console.error(`❌ Failed to generate muscle group image for ${exercise.name}:`, error);
      setImageStates(prev => ({
        ...prev,
        [exerciseId]: {
          imageUrl: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load muscle image'
        }
      }));
    }
  }, [color]);

  useEffect(() => {
    // Generate images for new exercises
    exercises.forEach(exercise => {
      if (!imageStates[exercise.id]) {
        generateImage(exercise);
      }
    });
  }, [exercises, generateImage, imageStates]);

  return imageStates;
}; 