import { z } from "zod";
import { muscleGroupSchema } from "./workout";

// Days of the week enum
export const dayOfWeekSchema = z.enum([
  "monday",
  "tuesday", 
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
]);

// Routine difficulty levels
export const routineDifficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "expert"
]);

// Routine category
export const routineCategorySchema = z.enum([
  "strength",
  "cardio",
  "flexibility",
  "hybrid",
  "sports_specific",
  "rehabilitation"
]);

// Template exercise (simplified version for routines)
export const routineExerciseSchema = z.object({
  name: z.string()
    .min(2, "Exercise name must be at least 2 characters")
    .max(100, "Exercise name must be less than 100 characters"),
  muscle_groups: z.array(muscleGroupSchema)
    .min(1, "At least one muscle group must be specified"),
  target_sets: z.number()
    .int("Sets must be a whole number")
    .min(1, "Must have at least 1 set")
    .max(50, "Cannot exceed 50 sets"),
  target_reps: z.number()
    .int("Reps must be a whole number")
    .min(1, "Must have at least 1 rep")
    .max(1000, "Cannot exceed 1000 reps")
    .optional(),
  target_weight: z.number()
    .min(0, "Weight cannot be negative")
    .max(2000, "Weight cannot exceed 2000 lbs/kg")
    .optional(),
  target_duration: z.number()
    .min(1, "Duration must be at least 1 second")
    .max(86400, "Duration cannot exceed 24 hours")
    .optional(),
  rest_time: z.number()
    .min(0, "Rest time cannot be negative")
    .max(3600, "Rest time cannot exceed 1 hour")
    .default(60),
  order: z.number()
    .int("Order must be a whole number")
    .min(1, "Order must be at least 1"),
  notes: z.string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
});

// Routine creation schema
export const routineCreateSchema = z.object({
  name: z.string()
    .min(2, "Routine name must be at least 2 characters")
    .max(100, "Routine name must be less than 100 characters"),
  description: z.string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  category: routineCategorySchema,
  difficulty: routineDifficultySchema,
  exercises: z.array(routineExerciseSchema)
    .min(1, "Routine must contain at least one exercise"),
  schedule: z.array(dayOfWeekSchema)
    .min(1, "Routine must be scheduled for at least one day"),
  estimated_duration: z.number()
    .min(5, "Routine must be at least 5 minutes")
    .max(480, "Routine cannot exceed 8 hours")
    .optional(),
  is_public: z.boolean().default(false),
  tags: z.array(z.string().max(50))
    .max(10, "Cannot have more than 10 tags")
    .optional()
});

// Complete routine schema (from database)
export const routineSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: routineCategorySchema,
  difficulty: routineDifficultySchema,
  exercises: z.array(routineExerciseSchema),
  schedule: z.array(dayOfWeekSchema),
  estimated_duration: z.number().optional(),
  is_public: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  times_used: z.number().int().min(0).default(0),
  average_rating: z.number().min(0).max(5).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

// Routine update schema
export const routineUpdateSchema = routineCreateSchema.partial().extend({
  updated_at: z.date().optional()
});

// Routine query filters
export const routineQuerySchema = z.object({
  user_id: z.string().optional(),
  category: routineCategorySchema.optional(),
  difficulty: routineDifficultySchema.optional(),
  muscle_groups: z.array(muscleGroupSchema).optional(),
  is_public: z.boolean().optional(),
  search: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  min_duration: z.number().min(1).optional(),
  max_duration: z.number().max(480).optional(),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0)
});

// Routine statistics schema
export const routineStatsSchema = z.object({
  routine_id: z.string(),
  total_workouts: z.number().int().min(0),
  last_used: z.date().optional(),
  average_duration: z.number().min(0).optional(),
  total_volume: z.number().min(0).optional(),
  muscle_group_distribution: z.record(z.string(), z.number().min(0)).optional()
});

// Type exports
export type DayOfWeek = z.infer<typeof dayOfWeekSchema>;
export type RoutineDifficulty = z.infer<typeof routineDifficultySchema>;
export type RoutineCategory = z.infer<typeof routineCategorySchema>;
export type RoutineExercise = z.infer<typeof routineExerciseSchema>;
export type RoutineCreateData = z.infer<typeof routineCreateSchema>;
export type Routine = z.infer<typeof routineSchema>;
export type RoutineUpdateData = z.infer<typeof routineUpdateSchema>;
export type RoutineQuery = z.infer<typeof routineQuerySchema>;
export type RoutineStats = z.infer<typeof routineStatsSchema>;

// Helper functions
export const calculateRoutineDuration = (exercises: RoutineExercise[]): number => {
  return exercises.reduce((total, exercise) => {
    const exerciseDuration = exercise.target_duration || 0;
    const restTime = exercise.rest_time || 60;
    const setTime = exercise.target_sets * restTime;
    return total + exerciseDuration + setTime;
  }, 0);
};

export const getRoutineMuscleGroups = (exercises: RoutineExercise[]): string[] => {
  const muscleGroups = new Set<string>();
  exercises.forEach(exercise => {
    exercise.muscle_groups.forEach(group => muscleGroups.add(group));
  });
  return Array.from(muscleGroups);
};

export const isRoutineScheduledForDay = (routine: Routine, day: DayOfWeek): boolean => {
  return routine.schedule.includes(day);
};

export const getRoutinesByDay = (routines: Routine[], day: DayOfWeek): Routine[] => {
  return routines.filter(routine => isRoutineScheduledForDay(routine, day));
}; 