import { z } from 'zod';

// Achievement categories
export const achievementCategorySchema = z.enum([
  'consistency',    // Workout streaks, frequency goals
  'strength',       // Personal records, weight milestones
  'volume',         // Total weight lifted, reps completed
  'endurance',      // Workout duration, cardio achievements
  'milestone',      // Special milestones (1st workout, 100th workout)
  'exploration',    // Trying new exercises, muscle groups
  'dedication'      // Long-term commitment, yearly goals
]);

// Badge tiers/levels
export const badgeTierSchema = z.enum([
  'bronze',
  'silver', 
  'gold',
  'platinum',
  'diamond'
]);

// Achievement types
export const achievementTypeSchema = z.enum([
  'streak',         // Consecutive days/weeks
  'count',          // Total number of something
  'threshold',      // Reach a specific value
  'percentage',     // Percentage of goal achieved
  'first_time',     // First time doing something
  'improvement'     // Personal improvement over time
]);

// Achievement status
export const achievementStatusSchema = z.enum([
  'locked',         // Not yet achievable
  'available',      // Can be earned
  'in_progress',    // Currently working towards
  'completed',      // Achieved
  'expired'         // Time-limited achievement that expired
]);

// Base achievement definition schema
export const achievementDefinitionSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category: achievementCategorySchema,
  type: achievementTypeSchema,
  tier: badgeTierSchema,
  
  // Achievement criteria
  targetValue: z.number().min(0),
  targetUnit: z.string().optional(), // 'workouts', 'lbs', 'days', 'exercises'
  timeframe: z.number().optional(), // in days, null for lifetime achievements
  
  // Rewards
  points: z.number().min(0).default(0),
  title: z.string().optional(), // Special title unlocked
  
  // Display
  icon: z.string().default('trophy'), // Lucide icon name
  color: z.string().default('#FFD700'), // Hex color for badge
  
  // Metadata
  isSecret: z.boolean().default(false), // Hidden until unlocked
  isLimited: z.boolean().default(false), // Limited time achievement
  sortOrder: z.number().default(0),
  
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date())
});

// User achievement progress schema
export const userAchievementSchema = z.object({
  id: z.string(),
  userId: z.string(),
  achievementId: z.string(),
  
  status: achievementStatusSchema,
  currentValue: z.number().default(0),
  targetValue: z.number(),
  progressPercentage: z.number().min(0).max(100).default(0),
  
  // Timestamps
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  lastUpdatedAt: z.date().default(new Date()),
  
  // Additional context
  metadata: z.record(z.unknown()).optional(), // Extra data for complex achievements
  notificationSent: z.boolean().default(false)
});

// Achievement notification schema
export const achievementNotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  achievementId: z.string(),
  
  type: z.enum(['earned', 'progress', 'milestone']),
  title: z.string(),
  message: z.string(),
  
  isRead: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  expiresAt: z.date().optional()
});

// Leaderboard entry schema
export const leaderboardEntrySchema = z.object({
  userId: z.string(),
  username: z.string(),
  totalPoints: z.number().default(0),
  totalBadges: z.number().default(0),
  
  // Badge breakdown
  bronzeBadges: z.number().default(0),
  silverBadges: z.number().default(0),
  goldBadges: z.number().default(0),
  platinumBadges: z.number().default(0),
  diamondBadges: z.number().default(0),
  
  // Recent achievements
  recentAchievements: z.array(z.string()).default([]),
  
  lastActive: z.date().default(() => new Date()),
  rank: z.number().optional()
});

// User achievement summary schema
export const userAchievementSummarySchema = z.object({
  userId: z.string(),
  
  // Overall stats
  totalPoints: z.number().default(0),
  totalBadgesEarned: z.number().default(0),
  completionPercentage: z.number().min(0).max(100).default(0),
  
  // Badge breakdown by tier
  badgesByTier: z.object({
    bronze: z.number().default(0),
    silver: z.number().default(0),
    gold: z.number().default(0),
    platinum: z.number().default(0),
    diamond: z.number().default(0)
  }).optional(),
  
  // Badge breakdown by category
  badgesByCategory: z.object({
    consistency: z.number().default(0),
    strength: z.number().default(0),
    volume: z.number().default(0),
    endurance: z.number().default(0),
    milestone: z.number().default(0),
    exploration: z.number().default(0),
    dedication: z.number().default(0)
  }).optional(),
  
  // Recent achievements (last 30 days)
  recentAchievements: z.array(z.string()).default([]),
  
  // Current streaks
  currentWorkoutStreak: z.number().default(0),
  longestWorkoutStreak: z.number().default(0),
  
  // Titles unlocked
  unlockedTitles: z.array(z.string()).default([]),
  activeTitle: z.string().optional(),
  
  lastUpdated: z.date().default(new Date())
});

// Query schemas
export const achievementQuerySchema = z.object({
  category: achievementCategorySchema.optional(),
  tier: badgeTierSchema.optional(),
  status: achievementStatusSchema.optional(),
  isSecret: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
});

export const leaderboardQuerySchema = z.object({
  timeframe: z.enum(['daily', 'weekly', 'monthly', 'all_time']).default('all_time'),
  category: achievementCategorySchema.optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
});

// Type exports
export type AchievementCategory = z.infer<typeof achievementCategorySchema>;
export type BadgeTier = z.infer<typeof badgeTierSchema>;
export type AchievementType = z.infer<typeof achievementTypeSchema>;
export type AchievementStatus = z.infer<typeof achievementStatusSchema>;
export type AchievementDefinition = z.infer<typeof achievementDefinitionSchema>;
export type UserAchievement = z.infer<typeof userAchievementSchema>;
export type AchievementNotification = z.infer<typeof achievementNotificationSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type UserAchievementSummary = z.infer<typeof userAchievementSummarySchema>;
export type AchievementQuery = z.infer<typeof achievementQuerySchema>;
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;

// Helper functions
export const calculateProgressPercentage = (current: number, target: number): number => {
  if (target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

export const getBadgeColor = (tier: BadgeTier): string => {
  const colors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0', 
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF'
  };
  return colors[tier];
};

export const getBadgePoints = (tier: BadgeTier): number => {
  const points = {
    bronze: 10,
    silver: 25,
    gold: 50,
    platinum: 100,
    diamond: 250
  };
  return points[tier];
};

export const getNextTier = (currentTier: BadgeTier): BadgeTier | null => {
  const tiers: BadgeTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}; 