import { z } from "zod";

// Fitness level enum
export const fitnessLevelSchema = z.enum([
  "beginner",
  "intermediate", 
  "advanced",
  "expert"
]);

// Fitness goals enum
export const fitnessGoalsSchema = z.array(z.enum([
  "weight_loss",
  "muscle_gain", 
  "strength",
  "endurance",
  "flexibility",
  "general_fitness"
]));

// Units preference enum
export const unitsSchema = z.enum(["metric", "imperial"]);

// User profile update schema
export const profileUpdateSchema = z.object({
  displayName: z.string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .optional(),
    
  weight: z.number()
    .min(20, "Weight must be at least 20")
    .max(500, "Weight must be less than 500")
    .optional(),
    
  height: z.number()
    .min(50, "Height must be at least 50")
    .max(300, "Height must be less than 300")
    .optional(),
    
  age: z.number()
    .min(13, "Age must be at least 13")
    .max(120, "Age must be less than 120")
    .optional(),
    
  fitnessLevel: fitnessLevelSchema.optional(),
  fitnessGoals: fitnessGoalsSchema.optional(),
  units: unitsSchema.optional(),
  
  // Privacy and notification settings
  profileVisible: z.boolean().optional(),
  shareProgress: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  workoutReminders: z.boolean().optional(),
  darkMode: z.boolean().optional(),
});

// Complete user profile schema (for database)
export const userProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  age: z.number().optional(),
  fitnessLevel: fitnessLevelSchema.optional(),
  fitnessGoals: fitnessGoalsSchema.optional(),
  units: unitsSchema.default("metric"),
  profileVisible: z.boolean().default(true),
  shareProgress: z.boolean().default(false),
  emailNotifications: z.boolean().default(true),
  workoutReminders: z.boolean().default(true),
  darkMode: z.boolean().default(false),
  photoURL: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// BMI calculation schema
export const bmiCalculationSchema = z.object({
  weight: z.number().min(20).max(500),
  height: z.number().min(50).max(300),
  units: unitsSchema,
});

// Type exports
export type FitnessLevel = z.infer<typeof fitnessLevelSchema>;
export type FitnessGoals = z.infer<typeof fitnessGoalsSchema>;
export type Units = z.infer<typeof unitsSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type BMICalculationData = z.infer<typeof bmiCalculationSchema>;

// Helper functions
export const calculateBMI = (weight: number, height: number, units: Units = "metric"): number => {
  let weightInKg = weight;
  let heightInM = height;
  
  if (units === "imperial") {
    // Convert pounds to kg and inches to meters
    weightInKg = weight * 0.453592;
    heightInM = height * 0.0254;
  } else {
    // Convert cm to meters
    heightInM = height / 100;
  }
  
  return Number((weightInKg / (heightInM * heightInM)).toFixed(1));
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

export const getBMICategoryColor = (bmi: number): string => {
  if (bmi < 18.5) return "text-blue-600";
  if (bmi < 25) return "text-green-600";
  if (bmi < 30) return "text-yellow-600";
  return "text-red-600";
}; 