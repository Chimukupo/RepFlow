import { z } from 'zod';

// Muscle groups enum for exercise targeting (for backward compatibility)
export const muscleGroupSchema = z.enum([
  "chest",
  "back", 
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "obliques",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "traps",
  "lats",
  "delts"
]);

// Exercise type enum (for backward compatibility)
export const exerciseTypeSchema = z.enum([
  "strength",
  "cardio",
  "flexibility",
  "balance",
  "sports"
]);

// Legacy exports for backward compatibility
export type MuscleGroup = z.infer<typeof muscleGroupSchema>;
export type ExerciseType = z.infer<typeof exerciseTypeSchema>;

// Workout exercise set schema
export const workoutSetSchema = z.object({
  id: z.string(),
  reps: z.number().min(1).max(999),
  weight: z.number().min(0).max(9999).optional(), // in lbs or kg
  duration: z.number().min(0).optional(), // in seconds for time-based exercises
  distance: z.number().min(0).optional(), // in meters/miles for cardio
  restTime: z.number().min(0).max(3600).optional(), // in seconds
  completed: z.boolean().default(false),
  notes: z.string().optional(),
});

export type WorkoutSet = z.infer<typeof workoutSetSchema>;

// Workout exercise schema (exercise + sets configuration)
export const workoutExerciseSchema = z.object({
  id: z.string(),
  exerciseId: z.string(), // Reference to exercise from exercise database
  exerciseName: z.string(),
  sets: z.array(workoutSetSchema),
  notes: z.string().optional(),
  restBetweenSets: z.number().min(0).max(600).optional(), // in seconds
  order: z.number().min(0), // Order in the workout
});

export type WorkoutExercise = z.infer<typeof workoutExerciseSchema>;

// Workout schema
export const workoutSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  exercises: z.array(workoutExerciseSchema),
  tags: z.array(z.string()).optional(),
  estimatedDuration: z.number().min(0).optional(), // in minutes
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  category: z.enum(['strength', 'cardio', 'flexibility', 'mixed']).optional(),
  isTemplate: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(), // User ID
});

export type Workout = z.infer<typeof workoutSchema>;

// Workout session schema (for tracking actual workout performance)
export const workoutSessionSchema = z.object({
  id: z.string(),
  workoutId: z.string(),
  workoutName: z.string(),
  startTime: z.date(),
  endTime: z.date().optional(),
  exercises: z.array(workoutExerciseSchema),
  totalDuration: z.number().min(0).optional(), // in minutes
  notes: z.string().optional(),
  completed: z.boolean().default(false),
  userId: z.string().optional(),
});

export type WorkoutSession = z.infer<typeof workoutSessionSchema>;

// Workout template schema
export const workoutTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  exercises: z.array(z.object({
    exerciseId: z.string(),
    exerciseName: z.string(),
    defaultSets: z.number().min(1).max(20),
    defaultReps: z.number().min(1).max(999),
    defaultWeight: z.number().min(0).optional(),
    defaultRestTime: z.number().min(0).max(600).optional(),
    order: z.number().min(0),
  })),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  category: z.enum(['strength', 'cardio', 'flexibility', 'mixed']).optional(),
  isPublic: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
});

export type WorkoutTemplate = z.infer<typeof workoutTemplateSchema>;

// Legacy schemas for backward compatibility with existing API/hooks
export const exerciseSchema = z.object({
  name: z.string()
    .min(2, "Exercise name must be at least 2 characters")
    .max(100, "Exercise name must be less than 100 characters"),
  type: exerciseTypeSchema,
  muscle_groups: z.array(muscleGroupSchema)
    .min(1, "At least one muscle group must be specified"),
  sets: z.number()
    .int("Sets must be a whole number")
    .min(1, "Must have at least 1 set")
    .max(50, "Cannot exceed 50 sets"),
  reps: z.number()
    .int("Reps must be a whole number") 
    .min(1, "Must have at least 1 rep")
    .max(1000, "Cannot exceed 1000 reps")
    .optional(),
  weight: z.number()
    .min(0, "Weight cannot be negative")
    .max(2000, "Weight cannot exceed 2000 lbs/kg")
    .optional(),
  duration: z.number()
    .min(1, "Duration must be at least 1 second")
    .max(86400, "Duration cannot exceed 24 hours")
    .optional(),
  distance: z.number()
    .min(0, "Distance cannot be negative")
    .max(1000, "Distance cannot exceed 1000 miles/km")
    .optional(),
  rest_time: z.number()
    .min(0, "Rest time cannot be negative")
    .max(3600, "Rest time cannot exceed 1 hour")
    .optional(),
  notes: z.string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
});

export const workoutCreateSchema = z.object({
  name: z.string()
    .min(2, "Workout name must be at least 2 characters")
    .max(100, "Workout name must be less than 100 characters"),
  date: z.date(),
  exercises: z.array(exerciseSchema)
    .min(1, "Workout must contain at least one exercise"),
  duration: z.number()
    .min(1, "Workout duration must be at least 1 minute")
    .max(480, "Workout duration cannot exceed 8 hours")
    .optional(),
  notes: z.string()
    .max(1000, "Workout notes cannot exceed 1000 characters")
    .optional(),
  is_template: z.boolean().default(false)
});

export const workoutUpdateSchema = workoutCreateSchema.partial().extend({
  updated_at: z.date().optional()
});

export const workoutQuerySchema = z.object({
  user_id: z.string(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  exercise_name: z.string().optional(),
  muscle_groups: z.array(muscleGroupSchema).optional(),
  is_template: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

// Legacy workout type for backward compatibility
export const legacyWorkoutSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  date: z.date(),
  exercises: z.array(exerciseSchema),
  notes: z.string().optional(),
  is_template: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date()
});

// Legacy type exports
export type Exercise = z.infer<typeof exerciseSchema>;
export type LegacyWorkout = z.infer<typeof legacyWorkoutSchema>;
export type WorkoutCreateData = z.infer<typeof workoutCreateSchema>;
export type WorkoutUpdateData = z.infer<typeof workoutUpdateSchema>;
export type WorkoutQuery = z.infer<typeof workoutQuerySchema>; 