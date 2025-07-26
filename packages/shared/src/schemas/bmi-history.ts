import { z } from "zod";
import { unitsSchema } from "./profile";

// BMI category based on standard WHO classifications
export const bmiCategorySchema = z.enum([
  "underweight",
  "normal_weight",
  "overweight", 
  "obese_class_1",
  "obese_class_2",
  "obese_class_3"
]);

// BMI trend direction
export const bmiTrendSchema = z.enum([
  "increasing",
  "decreasing",
  "stable"
]);

// BMI history entry creation schema
export const bmiHistoryCreateSchema = z.object({
  weight: z.number()
    .min(20, "Weight must be at least 20")
    .max(1000, "Weight cannot exceed 1000"),
  height: z.number()
    .min(50, "Height must be at least 50")
    .max(300, "Height cannot exceed 300"),
  units: unitsSchema,
  recorded_at: z.date().optional(), // Defaults to current date if not provided
  notes: z.string()
    .max(300, "Notes cannot exceed 300 characters")
    .optional(),
  source: z.enum(["manual", "profile_update", "goal_tracking"]).default("manual")
});

// Complete BMI history schema (from database)
export const bmiHistorySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  weight: z.number(),
  height: z.number(),
  units: unitsSchema,
  bmi: z.number()
    .min(10, "BMI cannot be less than 10")
    .max(100, "BMI cannot exceed 100"),
  category: bmiCategorySchema,
  recorded_at: z.date(),
  notes: z.string().optional(),
  source: z.enum(["manual", "profile_update", "goal_tracking"]),
  created_at: z.date(),
  updated_at: z.date()
});

// BMI history update schema
export const bmiHistoryUpdateSchema = z.object({
  weight: z.number()
    .min(20, "Weight must be at least 20")
    .max(1000, "Weight cannot exceed 1000")
    .optional(),
  height: z.number()
    .min(50, "Height must be at least 50")
    .max(300, "Height cannot exceed 300")
    .optional(),
  units: unitsSchema.optional(),
  notes: z.string()
    .max(300, "Notes cannot exceed 300 characters")
    .optional(),
  updated_at: z.date().optional()
});

// BMI history query filters
export const bmiHistoryQuerySchema = z.object({
  user_id: z.string(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  category: bmiCategorySchema.optional(),
  source: z.enum(["manual", "profile_update", "goal_tracking"]).optional(),
  limit: z.number().int().min(1).max(365).default(30), // Default to last 30 entries
  offset: z.number().int().min(0).default(0)
});

// BMI statistics schema
export const bmiStatsSchema = z.object({
  user_id: z.string(),
  current_bmi: z.number().optional(),
  current_category: bmiCategorySchema.optional(),
  average_bmi: z.number().optional(),
  trend: bmiTrendSchema.optional(),
  weight_change: z.number().optional(), // Change from first to last entry
  bmi_change: z.number().optional(),
  total_entries: z.number().int().min(0),
  date_range: z.object({
    start: z.date(),
    end: z.date()
  }).optional(),
  category_distribution: z.record(bmiCategorySchema, z.number().int().min(0)).optional()
});

// BMI trend analysis schema
export const bmiTrendAnalysisSchema = z.object({
  user_id: z.string(),
  period_days: z.number().int().min(7).max(365),
  trend_direction: bmiTrendSchema,
  trend_strength: z.enum(["weak", "moderate", "strong"]),
  average_change_per_week: z.number(),
  projected_bmi_30_days: z.number().optional(),
  recommendations: z.array(z.string()).optional()
});

// Type exports
export type BMICategory = z.infer<typeof bmiCategorySchema>;
export type BMITrend = z.infer<typeof bmiTrendSchema>;
export type BMIHistoryCreateData = z.infer<typeof bmiHistoryCreateSchema>;
export type BMIHistory = z.infer<typeof bmiHistorySchema>;
export type BMIHistoryUpdateData = z.infer<typeof bmiHistoryUpdateSchema>;
export type BMIHistoryQuery = z.infer<typeof bmiHistoryQuerySchema>;
export type BMIStats = z.infer<typeof bmiStatsSchema>;
export type BMITrendAnalysis = z.infer<typeof bmiTrendAnalysisSchema>;

// Helper functions
export const calculateBMI = (weight: number, height: number, units: "metric" | "imperial"): number => {
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

export const getBMICategory = (bmi: number): BMICategory => {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal_weight";
  if (bmi < 30) return "overweight";
  if (bmi < 35) return "obese_class_1";
  if (bmi < 40) return "obese_class_2";
  return "obese_class_3";
};

export const getBMICategoryLabel = (category: BMICategory): string => {
  const labels: Record<BMICategory, string> = {
    underweight: "Underweight",
    normal_weight: "Normal Weight",
    overweight: "Overweight",
    obese_class_1: "Obese Class I",
    obese_class_2: "Obese Class II",
    obese_class_3: "Obese Class III"
  };
  return labels[category];
};

export const getBMICategoryColor = (category: BMICategory): string => {
  const colors: Record<BMICategory, string> = {
    underweight: "text-blue-600",
    normal_weight: "text-green-600",
    overweight: "text-yellow-600",
    obese_class_1: "text-orange-600",
    obese_class_2: "text-red-600",
    obese_class_3: "text-red-800"
  };
  return colors[category];
};

export const analyzeBMITrend = (entries: BMIHistory[]): BMITrend => {
  if (entries.length < 2) return "stable";
  
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );
  
  const first = sortedEntries[0];
  const last = sortedEntries[sortedEntries.length - 1];
  const change = last.bmi - first.bmi;
  
  if (Math.abs(change) < 0.5) return "stable";
  return change > 0 ? "increasing" : "decreasing";
};

export const calculateBMIStats = (entries: BMIHistory[]): Partial<BMIStats> => {
  if (entries.length === 0) {
    return {
      total_entries: 0
    };
  }
  
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  );
  
  const current = sortedEntries[0];
  const oldest = sortedEntries[sortedEntries.length - 1];
  const averageBMI = entries.reduce((sum, entry) => sum + entry.bmi, 0) / entries.length;
  
  return {
    current_bmi: current.bmi,
    current_category: current.category,
    average_bmi: Number(averageBMI.toFixed(1)),
    trend: analyzeBMITrend(entries),
    weight_change: Number((current.weight - oldest.weight).toFixed(1)),
    bmi_change: Number((current.bmi - oldest.bmi).toFixed(1)),
    total_entries: entries.length,
    date_range: {
      start: oldest.recorded_at,
      end: current.recorded_at
    }
  };
};

export const createBMIHistoryEntry = (data: BMIHistoryCreateData, userId: string): Omit<BMIHistory, 'id' | 'created_at' | 'updated_at'> => {
  const bmi = calculateBMI(data.weight, data.height, data.units);
  const category = getBMICategory(bmi);
  const recordedAt = data.recorded_at || new Date();
  
  return {
    user_id: userId,
    weight: data.weight,
    height: data.height,
    units: data.units,
    bmi,
    category,
    recorded_at: recordedAt,
    notes: data.notes,
    source: data.source
  };
}; 