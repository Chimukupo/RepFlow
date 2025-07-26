import { z } from "zod";

// Muscle groups enum for exercise targeting
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

// Exercise type enum
export const exerciseTypeSchema = z.enum([
  "strength",
  "cardio",
  "flexibility",
  "balance",
  "sports"
]);

// Individual exercise within a workout
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
    .optional(), // Optional for cardio exercises
  weight: z.number()
    .min(0, "Weight cannot be negative")
    .max(2000, "Weight cannot exceed 2000 lbs/kg")
    .optional(), // Optional for bodyweight exercises
  duration: z.number()
    .min(1, "Duration must be at least 1 second")
    .max(86400, "Duration cannot exceed 24 hours")
    .optional(), // Optional for strength exercises
  distance: z.number()
    .min(0, "Distance cannot be negative")
    .max(1000, "Distance cannot exceed 1000 miles/km")
    .optional(), // For cardio exercises
  rest_time: z.number()
    .min(0, "Rest time cannot be negative")
    .max(3600, "Rest time cannot exceed 1 hour")
    .optional(),
  notes: z.string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
});

// Workout creation schema (for new workouts)
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
    .optional(), // Auto-calculated from exercise durations
  notes: z.string()
    .max(1000, "Workout notes cannot exceed 1000 characters")
    .optional(),
  is_template: z.boolean().default(false)
});

// Complete workout schema (from database)
export const workoutSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  date: z.date(),
  exercises: z.array(exerciseSchema),
  duration: z.number().optional(),
  notes: z.string().optional(),
  is_template: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date()
});

// Workout update schema (for editing existing workouts)
export const workoutUpdateSchema = workoutCreateSchema.partial().extend({
  updated_at: z.date().optional()
});

// Workout query filters
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

// Type exports
export type MuscleGroup = z.infer<typeof muscleGroupSchema>;
export type ExerciseType = z.infer<typeof exerciseTypeSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type WorkoutCreateData = z.infer<typeof workoutCreateSchema>;
export type Workout = z.infer<typeof workoutSchema>;
export type WorkoutUpdateData = z.infer<typeof workoutUpdateSchema>;
export type WorkoutQuery = z.infer<typeof workoutQuerySchema>;

// Helper functions
export const calculateWorkoutDuration = (exercises: Exercise[]): number => {
  return exercises.reduce((total, exercise) => {
    const exerciseDuration = exercise.duration || 0;
    const restTime = exercise.rest_time || 60; // Default 60 seconds rest
    const setTime = (exercise.sets || 1) * restTime;
    return total + exerciseDuration + setTime;
  }, 0);
};

export const getWorkoutMuscleGroups = (exercises: Exercise[]): MuscleGroup[] => {
  const muscleGroups = new Set<MuscleGroup>();
  exercises.forEach(exercise => {
    exercise.muscle_groups.forEach(group => muscleGroups.add(group));
  });
  return Array.from(muscleGroups);
};

export const calculateWorkoutVolume = (exercises: Exercise[]): number => {
  return exercises.reduce((total, exercise) => {
    if (exercise.weight && exercise.reps && exercise.sets) {
      return total + (exercise.weight * exercise.reps * exercise.sets);
    }
    return total;
  }, 0);
}; 