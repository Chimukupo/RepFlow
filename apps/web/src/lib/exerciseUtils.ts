import type { Exercise } from 'shared/data/exercise-types';
import { EXERCISES } from 'shared/data/exercises';

// Custom exercise type compatible with built-in exercises
export interface UnifiedExercise extends Exercise {
  isCustom?: boolean;
  createdBy?: string;
  personalNotes?: string;
  isPublic?: boolean;
}

// Mock custom exercise type (will be replaced with proper import)
interface CustomExerciseDocument {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  category: string;
  difficulty: string;
  equipment: string[];
  mechanic: string;
  tips: string[];
  variations: string[];
  commonMistakes: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
  personalNotes?: string;
  estimatedDuration?: number;
  isValidated: boolean;
}

/**
 * Convert a custom exercise to the unified exercise format
 */
export const convertCustomExerciseToUnified = (customExercise: CustomExerciseDocument): UnifiedExercise => {
  return {
    id: customExercise.id,
    name: customExercise.name,
    slug: customExercise.name.toLowerCase().replace(/\s+/g, '-'),
    description: customExercise.description,
    instructions: customExercise.instructions,
    primaryMuscles: customExercise.primaryMuscles,
    secondaryMuscles: customExercise.secondaryMuscles,
    category: customExercise.category as any,
    difficulty: customExercise.difficulty as any,
    equipment: customExercise.equipment as any,
    force: 'push', // Default value
    mechanic: customExercise.mechanic as any,
    tips: customExercise.tips,
    variations: customExercise.variations,
    commonMistakes: customExercise.commonMistakes,
    
    // Custom exercise specific fields
    isCustom: true,
    createdBy: customExercise.createdBy,
    personalNotes: customExercise.personalNotes,
    isPublic: customExercise.isPublic,
  };
};

/**
 * Convert built-in exercise to unified format
 */
export const convertBuiltInExerciseToUnified = (exercise: Exercise): UnifiedExercise => {
  return {
    ...exercise,
    isCustom: false,
  };
};

/**
 * Combine built-in exercises with custom exercises
 */
export const combineExercises = (customExercises: CustomExerciseDocument[] = []): UnifiedExercise[] => {
  // Convert built-in exercises
  const builtInExercises = EXERCISES.map(convertBuiltInExerciseToUnified);
  
  // Convert custom exercises
  const unifiedCustomExercises = customExercises.map(convertCustomExerciseToUnified);
  
  // Combine and sort by name
  const allExercises = [...builtInExercises, ...unifiedCustomExercises];
  
  return allExercises.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Filter exercises by search term
 */
export const filterExercisesBySearch = (
  exercises: UnifiedExercise[], 
  searchTerm: string
): UnifiedExercise[] => {
  if (!searchTerm.trim()) return exercises;
  
  const searchLower = searchTerm.toLowerCase();
  
  return exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(searchLower) ||
    exercise.description.toLowerCase().includes(searchLower) ||
    exercise.primaryMuscles.some(muscle => muscle.toLowerCase().includes(searchLower)) ||
    exercise.secondaryMuscles.some(muscle => muscle.toLowerCase().includes(searchLower)) ||
    exercise.category.toLowerCase().includes(searchLower) ||
    (exercise.isCustom && exercise.personalNotes?.toLowerCase().includes(searchLower))
  );
};

/**
 * Filter exercises by muscle group
 */
export const filterExercisesByMuscleGroup = (
  exercises: UnifiedExercise[], 
  muscleGroup: string
): UnifiedExercise[] => {
  if (!muscleGroup) return exercises;
  
  return exercises.filter(exercise => 
    exercise.primaryMuscles.includes(muscleGroup) ||
    exercise.secondaryMuscles.includes(muscleGroup)
  );
};

/**
 * Filter exercises by category
 */
export const filterExercisesByCategory = (
  exercises: UnifiedExercise[], 
  category: string
): UnifiedExercise[] => {
  if (!category) return exercises;
  
  return exercises.filter(exercise => exercise.category === category);
};

/**
 * Filter exercises by difficulty
 */
export const filterExercisesByDifficulty = (
  exercises: UnifiedExercise[], 
  difficulty: string
): UnifiedExercise[] => {
  if (!difficulty) return exercises;
  
  return exercises.filter(exercise => exercise.difficulty === difficulty);
};

/**
 * Filter exercises by equipment
 */
export const filterExercisesByEquipment = (
  exercises: UnifiedExercise[], 
  equipment: string
): UnifiedExercise[] => {
  if (!equipment) return exercises;
  
  return exercises.filter(exercise => 
    exercise.equipment.includes(equipment as any)
  );
};

/**
 * Get unique categories from exercises
 */
export const getUniqueCategories = (exercises: UnifiedExercise[]): string[] => {
  const categories = exercises.map(exercise => exercise.category);
  return [...new Set(categories)].sort();
};

/**
 * Get unique muscle groups from exercises
 */
export const getUniqueMuscleGroups = (exercises: UnifiedExercise[]): string[] => {
  const allMuscles = exercises.flatMap(exercise => [
    ...exercise.primaryMuscles,
    ...exercise.secondaryMuscles
  ]);
  return [...new Set(allMuscles)].sort();
};

/**
 * Get unique equipment types from exercises
 */
export const getUniqueEquipment = (exercises: UnifiedExercise[]): string[] => {
  const allEquipment = exercises.flatMap(exercise => exercise.equipment);
  return [...new Set(allEquipment)].sort();
};

/**
 * Get unique difficulty levels from exercises
 */
export const getUniqueDifficulties = (exercises: UnifiedExercise[]): string[] => {
  const difficulties = exercises.map(exercise => exercise.difficulty);
  return [...new Set(difficulties)].sort();
}; 