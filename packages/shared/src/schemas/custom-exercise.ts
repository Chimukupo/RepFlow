import { z } from 'zod';

// Available muscle groups (from our API)
export const MUSCLE_GROUPS = [
  'abs', 'back', 'biceps', 'calfs', 'chest', 'core', 'forearms', 
  'gluteus', 'hamstring', 'latissimus', 'quadriceps', 'shoulders', 
  'triceps', 'neck', 'adductors', 'abductors'
] as const;

// Available equipment types
export const EQUIPMENT_TYPES = [
  'bodyweight', 'barbell', 'dumbbell', 'kettlebell', 'cable', 
  'machine', 'resistance-band', 'medicine-ball', 'suspension', 
  'cardio-machine', 'other'
] as const;

// Exercise categories
export const EXERCISE_CATEGORIES = [
  'push', 'pull', 'legs', 'core', 'cardio', 'flexibility', 'other'
] as const;

// Exercise difficulty levels
export const DIFFICULTY_LEVELS = [
  'beginner', 'intermediate', 'advanced', 'expert'
] as const;

// Exercise mechanics
export const EXERCISE_MECHANICS = [
  'compound', 'isolation', 'cardio', 'isometric', 'plyometric'
] as const;

// Force types
export const FORCE_TYPES = [
  'push', 'pull', 'static', 'dynamic'
] as const;

// Custom Exercise Schema
export const customExerciseSchema = z.object({
  // Basic Information
  name: z.string()
    .min(2, 'Exercise name must be at least 2 characters')
    .max(100, 'Exercise name must be less than 100 characters')
    .trim(),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .trim(),

  // Instructions
  instructions: z.array(z.string().min(5, 'Each instruction must be at least 5 characters'))
    .min(3, 'At least 3 instructions are required')
    .max(10, 'Maximum 10 instructions allowed'),

  // Muscle Groups
  primaryMuscles: z.array(z.enum(MUSCLE_GROUPS))
    .min(1, 'At least one primary muscle group is required')
    .max(3, 'Maximum 3 primary muscle groups allowed'),
  
  secondaryMuscles: z.array(z.enum(MUSCLE_GROUPS))
    .max(4, 'Maximum 4 secondary muscle groups allowed')
    .default([]),

  // Exercise Classification
  category: z.enum(EXERCISE_CATEGORIES),
  difficulty: z.enum(DIFFICULTY_LEVELS),
  equipment: z.array(z.enum(EQUIPMENT_TYPES))
    .min(1, 'At least one equipment type is required'),
  
  force: z.enum(FORCE_TYPES).optional(),
  mechanic: z.enum(EXERCISE_MECHANICS),

  // Optional Fields
  tips: z.array(z.string().min(10, 'Each tip must be at least 10 characters'))
    .max(5, 'Maximum 5 tips allowed')
    .default([]),
  
  variations: z.array(z.string().min(3, 'Each variation must be at least 3 characters'))
    .max(8, 'Maximum 8 variations allowed')
    .default([]),
  
  commonMistakes: z.array(z.string().min(10, 'Each mistake must be at least 10 characters'))
    .max(5, 'Maximum 5 common mistakes allowed')
    .default([]),

  // Metadata
  createdBy: z.string(), // User ID
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  isPublic: z.boolean().default(false), // Whether other users can see this exercise
  tags: z.array(z.string().min(2).max(20))
    .max(10, 'Maximum 10 tags allowed')
    .default([]),

  // Custom fields for user preferences
  personalNotes: z.string()
    .max(300, 'Personal notes must be less than 300 characters')
    .optional(),
  
  estimatedDuration: z.number()
    .min(30, 'Minimum duration is 30 seconds')
    .max(3600, 'Maximum duration is 1 hour')
    .optional(), // in seconds

  // Validation flags
  isValidated: z.boolean().default(false), // For admin approval if needed
});

// Firestore document schema (with ID)
export const customExerciseDocumentSchema = customExerciseSchema.extend({
  id: z.string(),
});

// Form schema (for creation - without metadata)
export const customExerciseFormSchema = customExerciseSchema.omit({
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  isValidated: true,
});

// Update schema (for editing)
export const customExerciseUpdateSchema = customExerciseFormSchema.partial().extend({
  updatedAt: z.date().default(() => new Date()),
});

// Type exports
export type CustomExercise = z.infer<typeof customExerciseSchema>;
export type CustomExerciseDocument = z.infer<typeof customExerciseDocumentSchema>;
export type CustomExerciseForm = z.infer<typeof customExerciseFormSchema>;
export type CustomExerciseUpdate = z.infer<typeof customExerciseUpdateSchema>;
export type MuscleGroup = typeof MUSCLE_GROUPS[number];
export type EquipmentType = typeof EQUIPMENT_TYPES[number];
export type ExerciseCategory = typeof EXERCISE_CATEGORIES[number];
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];
export type ExerciseMechanic = typeof EXERCISE_MECHANICS[number];
export type ForceType = typeof FORCE_TYPES[number];

// Helper functions
export const validateCustomExercise = (data: unknown): CustomExercise => {
  return customExerciseSchema.parse(data);
};

export const validateCustomExerciseForm = (data: unknown): CustomExerciseForm => {
  return customExerciseFormSchema.parse(data);
};

// Default form values
export const getDefaultCustomExerciseForm = (): Partial<CustomExerciseForm> => ({
  name: '',
  description: '',
  instructions: ['', '', ''],
  primaryMuscles: [],
  secondaryMuscles: [],
  category: 'other',
  difficulty: 'beginner',
  equipment: [],
  mechanic: 'compound',
  tips: [],
  variations: [],
  commonMistakes: [],
  isPublic: false,
  tags: [],
  personalNotes: '',
}); 