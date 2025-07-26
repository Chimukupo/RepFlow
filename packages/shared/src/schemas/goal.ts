import { z } from "zod";
import { muscleGroupSchema } from "./workout";

// Goal categories
export const goalCategorySchema = z.enum([
  "strength",
  "endurance", 
  "weight_loss",
  "muscle_gain",
  "flexibility",
  "general_fitness",
  "sport_specific",
  "rehabilitation"
]);

// Goal types
export const goalTypeSchema = z.enum([
  "weight_target", // Target weight for exercises
  "rep_target", // Target repetitions
  "duration_target", // Target time duration
  "frequency_target", // Workout frequency per week
  "body_weight", // Body weight goal
  "body_fat", // Body fat percentage
  "distance", // Running/cycling distance
  "custom" // Custom measurable goal
]);

// Goal status
export const goalStatusSchema = z.enum([
  "active",
  "completed",
  "paused",
  "cancelled"
]);

// Goal priority levels
export const goalPrioritySchema = z.enum([
  "low",
  "medium", 
  "high",
  "critical"
]);

// Goal milestone for tracking progress
export const goalMilestoneSchema = z.object({
  id: z.string(),
  description: z.string()
    .min(2, "Milestone description must be at least 2 characters")
    .max(200, "Milestone description cannot exceed 200 characters"),
  target_value: z.number()
    .min(0, "Target value cannot be negative"),
  achieved_value: z.number()
    .min(0, "Achieved value cannot be negative")
    .default(0),
  is_completed: z.boolean().default(false),
  completed_at: z.date().optional(),
  created_at: z.date()
});

// Goal creation schema
export const goalCreateSchema = z.object({
  title: z.string()
    .min(2, "Goal title must be at least 2 characters")
    .max(100, "Goal title cannot exceed 100 characters"),
  description: z.string()
    .max(500, "Goal description cannot exceed 500 characters")
    .optional(),
  category: goalCategorySchema,
  type: goalTypeSchema,
  priority: goalPrioritySchema.default("medium"),
  target_value: z.number()
    .min(0, "Target value cannot be negative"),
  current_value: z.number()
    .min(0, "Current value cannot be negative")
    .default(0),
  unit: z.string()
    .min(1, "Unit must be specified")
    .max(20, "Unit cannot exceed 20 characters"), // e.g., "lbs", "kg", "minutes", "times/week"
  target_date: z.date()
    .min(new Date(), "Target date must be in the future"),
  related_exercise: z.string()
    .max(100, "Exercise name cannot exceed 100 characters")
    .optional(),
  related_muscle_groups: z.array(muscleGroupSchema)
    .optional(),
  milestones: z.array(goalMilestoneSchema)
    .max(10, "Cannot have more than 10 milestones")
    .optional(),
  is_public: z.boolean().default(false),
  reminder_frequency: z.enum(["daily", "weekly", "monthly", "none"]).default("weekly")
});

// Complete goal schema (from database)
export const goalSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: goalCategorySchema,
  type: goalTypeSchema,
  priority: goalPrioritySchema,
  status: goalStatusSchema.default("active"),
  target_value: z.number(),
  current_value: z.number(),
  unit: z.string(),
  target_date: z.date(),
  related_exercise: z.string().optional(),
  related_muscle_groups: z.array(muscleGroupSchema).optional(),
  milestones: z.array(goalMilestoneSchema).optional(),
  is_public: z.boolean().default(false),
  reminder_frequency: z.enum(["daily", "weekly", "monthly", "none"]),
  progress_percentage: z.number().min(0).max(100).default(0),
  last_updated: z.date().optional(),
  completed_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

// Goal update schema
export const goalUpdateSchema = goalCreateSchema.partial().extend({
  status: goalStatusSchema.optional(),
  current_value: z.number().min(0).optional(),
  progress_percentage: z.number().min(0).max(100).optional(),
  last_updated: z.date().optional(),
  completed_at: z.date().optional(),
  updated_at: z.date().optional()
});

// Goal query filters
export const goalQuerySchema = z.object({
  user_id: z.string(),
  category: goalCategorySchema.optional(),
  type: goalTypeSchema.optional(),
  status: goalStatusSchema.optional(),
  priority: goalPrioritySchema.optional(),
  is_public: z.boolean().optional(),
  target_date_before: z.date().optional(),
  target_date_after: z.date().optional(),
  search: z.string().max(100).optional(),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0)
});

// Goal progress entry for tracking updates
export const goalProgressEntrySchema = z.object({
  id: z.string(),
  goal_id: z.string(),
  previous_value: z.number().min(0),
  new_value: z.number().min(0),
  notes: z.string()
    .max(300, "Progress notes cannot exceed 300 characters")
    .optional(),
  recorded_at: z.date()
});

// Type exports
export type GoalCategory = z.infer<typeof goalCategorySchema>;
export type GoalType = z.infer<typeof goalTypeSchema>;
export type GoalStatus = z.infer<typeof goalStatusSchema>;
export type GoalPriority = z.infer<typeof goalPrioritySchema>;
export type GoalMilestone = z.infer<typeof goalMilestoneSchema>;
export type GoalCreateData = z.infer<typeof goalCreateSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type GoalUpdateData = z.infer<typeof goalUpdateSchema>;
export type GoalQuery = z.infer<typeof goalQuerySchema>;
export type GoalProgressEntry = z.infer<typeof goalProgressEntrySchema>;

// Helper functions
export const calculateGoalProgress = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

export const isGoalCompleted = (goal: Goal): boolean => {
  return goal.status === "completed" || goal.progress_percentage >= 100;
};

export const isGoalOverdue = (goal: Goal): boolean => {
  return new Date() > goal.target_date && !isGoalCompleted(goal);
};

export const getDaysUntilDeadline = (goal: Goal): number => {
  const today = new Date();
  const deadline = new Date(goal.target_date);
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getGoalsByStatus = (goals: Goal[], status: GoalStatus): Goal[] => {
  return goals.filter(goal => goal.status === status);
};

export const getGoalsByCategory = (goals: Goal[], category: GoalCategory): Goal[] => {
  return goals.filter(goal => goal.category === category);
};

export const updateGoalProgress = (goal: Goal, newValue: number): Goal => {
  const progress = calculateGoalProgress(newValue, goal.target_value);
  const isCompleted = progress >= 100;
  
  return {
    ...goal,
    current_value: newValue,
    progress_percentage: progress,
    status: isCompleted ? "completed" : goal.status,
    completed_at: isCompleted && !goal.completed_at ? new Date() : goal.completed_at,
    last_updated: new Date(),
    updated_at: new Date()
  };
}; 