// Simple achievement engine with mock data for demonstration
export interface SimpleAchievement {
  id: string;
  name: string;
  description: string;
  category: 'consistency' | 'strength' | 'volume' | 'endurance' | 'milestone' | 'exploration' | 'dedication';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  targetValue: number;
  currentValue: number;
  progressPercentage: number;
  isCompleted: boolean;
  icon: string;
  color: string;
  points: number;
  title?: string;
  isSecret?: boolean;
  completedAt?: Date;
}

export interface AchievementSummary {
  totalPoints: number;
  totalBadges: number;
  badgesByTier: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    diamond: number;
  };
  recentAchievements: SimpleAchievement[];
  currentStreak: number;
  longestStreak: number;
}

// Mock achievement definitions
export const MOCK_ACHIEVEMENTS: SimpleAchievement[] = [
  {
    id: 'first-workout',
    name: 'First Steps',
    description: 'Complete your very first workout',
    category: 'milestone',
    tier: 'bronze',
    targetValue: 1,
    currentValue: 1,
    progressPercentage: 100,
    isCompleted: true,
    icon: 'play-circle',
    color: '#CD7F32',
    points: 25,
    completedAt: new Date('2024-01-15')
  },
  {
    id: 'ten-workouts',
    name: 'Building Momentum',
    description: 'Complete 10 total workouts',
    category: 'milestone',
    tier: 'bronze',
    targetValue: 10,
    currentValue: 7,
    progressPercentage: 70,
    isCompleted: false,
    icon: 'target',
    color: '#CD7F32',
    points: 50
  },
  {
    id: 'three-day-streak',
    name: 'Getting Started',
    description: 'Work out 3 days in a row',
    category: 'consistency',
    tier: 'bronze',
    targetValue: 3,
    currentValue: 3,
    progressPercentage: 100,
    isCompleted: true,
    icon: 'calendar-check',
    color: '#CD7F32',
    points: 30,
    completedAt: new Date('2024-01-17')
  },
  {
    id: 'seven-day-streak',
    name: 'Week Warrior',
    description: 'Work out 7 days in a row',
    category: 'consistency',
    tier: 'silver',
    targetValue: 7,
    currentValue: 5,
    progressPercentage: 71,
    isCompleted: false,
    icon: 'flame',
    color: '#C0C0C0',
    points: 75
  },
  {
    id: 'first-pr',
    name: 'Personal Best',
    description: 'Set your first personal record',
    category: 'strength',
    tier: 'bronze',
    targetValue: 1,
    currentValue: 1,
    progressPercentage: 100,
    isCompleted: true,
    icon: 'trending-up',
    color: '#CD7F32',
    points: 40,
    completedAt: new Date('2024-01-20')
  },
  {
    id: 'ten-thousand-pounds',
    name: 'Heavy Lifter',
    description: 'Lift 10,000 total pounds',
    category: 'volume',
    tier: 'bronze',
    targetValue: 10000,
    currentValue: 6750,
    progressPercentage: 68,
    isCompleted: false,
    icon: 'weight',
    color: '#CD7F32',
    points: 60
  },
  {
    id: 'five-exercises',
    name: 'Exercise Explorer',
    description: 'Try 5 different exercises',
    category: 'exploration',
    tier: 'bronze',
    targetValue: 5,
    currentValue: 8,
    progressPercentage: 100,
    isCompleted: true,
    icon: 'compass',
    color: '#CD7F32',
    points: 35,
    completedAt: new Date('2024-01-18')
  },
  {
    id: 'thirty-day-streak',
    name: 'Unstoppable',
    description: 'Work out 30 days in a row',
    category: 'consistency',
    tier: 'gold',
    targetValue: 30,
    currentValue: 5,
    progressPercentage: 17,
    isCompleted: false,
    icon: 'zap',
    color: '#FFD700',
    points: 200,
    title: 'Streak Master'
  },
  {
    id: 'hundred-day-streak',
    name: 'Legendary Dedication',
    description: 'Work out 100 days in a row',
    category: 'consistency',
    tier: 'diamond',
    targetValue: 100,
    currentValue: 5,
    progressPercentage: 5,
    isCompleted: false,
    icon: 'star',
    color: '#B9F2FF',
    points: 500,
    title: 'Dedication Legend',
    isSecret: true
  }
];

export class AchievementEngine {
  private achievements: SimpleAchievement[] = [...MOCK_ACHIEVEMENTS];

  // Get all achievements
  getAchievements(): SimpleAchievement[] {
    return this.achievements;
  }

  // Get completed achievements
  getCompletedAchievements(): SimpleAchievement[] {
    return this.achievements.filter(a => a.isCompleted);
  }

  // Get in-progress achievements
  getInProgressAchievements(): SimpleAchievement[] {
    return this.achievements.filter(a => !a.isCompleted && a.currentValue > 0);
  }

  // Get achievements by category
  getAchievementsByCategory(category: string): SimpleAchievement[] {
    return this.achievements.filter(a => a.category === category);
  }

  // Get achievements by tier
  getAchievementsByTier(tier: string): SimpleAchievement[] {
    return this.achievements.filter(a => a.tier === tier);
  }

  // Get recent achievements (last 30 days)
  getRecentAchievements(): SimpleAchievement[] {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return this.achievements
      .filter(a => a.isCompleted && a.completedAt && a.completedAt >= thirtyDaysAgo)
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
  }

  // Calculate achievement summary
  getAchievementSummary(): AchievementSummary {
    const completed = this.getCompletedAchievements();
    const totalPoints = completed.reduce((sum, a) => sum + a.points, 0);
    
    const badgesByTier = {
      bronze: completed.filter(a => a.tier === 'bronze').length,
      silver: completed.filter(a => a.tier === 'silver').length,
      gold: completed.filter(a => a.tier === 'gold').length,
      platinum: completed.filter(a => a.tier === 'platinum').length,
      diamond: completed.filter(a => a.tier === 'diamond').length
    };

    return {
      totalPoints,
      totalBadges: completed.length,
      badgesByTier,
      recentAchievements: this.getRecentAchievements(),
      currentStreak: 5, // Mock current streak
      longestStreak: 12 // Mock longest streak
    };
  }

  // Simulate achievement progress update
  updateAchievementProgress(achievementId: string, newValue: number): boolean {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return false;

    achievement.currentValue = newValue;
    achievement.progressPercentage = Math.min(Math.round((newValue / achievement.targetValue) * 100), 100);
    
    // Check if achievement is now completed
    if (!achievement.isCompleted && newValue >= achievement.targetValue) {
      achievement.isCompleted = true;
      achievement.completedAt = new Date();
      return true; // Achievement unlocked!
    }

    return false;
  }

  // Get next achievements to unlock
  getNextAchievements(limit: number = 3): SimpleAchievement[] {
    return this.achievements
      .filter(a => !a.isCompleted && !a.isSecret)
      .sort((a, b) => {
        // Sort by progress percentage (closest to completion first)
        if (a.progressPercentage !== b.progressPercentage) {
          return b.progressPercentage - a.progressPercentage;
        }
        // Then by tier (easier first)
        const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };
        return tierOrder[a.tier] - tierOrder[b.tier];
      })
      .slice(0, limit);
  }

  // Check for newly unlocked achievements (mock)
  checkForNewAchievements(): SimpleAchievement[] {
    // In a real implementation, this would check user's workout data
    // For now, return empty array
    return [];
  }

  // Get badge color helper
  getBadgeColor(tier: string): string {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF'
    };
    return colors[tier as keyof typeof colors] || '#CD7F32';
  }

  // Format achievement progress text
  formatProgress(achievement: SimpleAchievement): string {
    const { currentValue, targetValue } = achievement;
    
    if (achievement.isCompleted) {
      return 'Completed!';
    }

    // Format numbers with commas for large values
    const formatNumber = (num: number) => num.toLocaleString();
    
    return `${formatNumber(currentValue)} / ${formatNumber(targetValue)}`;
  }

  // Get achievement icon color based on completion status
  getAchievementIconColor(achievement: SimpleAchievement): string {
    if (achievement.isCompleted) {
      return achievement.color;
    } else if (achievement.currentValue > 0) {
      return '#6B7280'; // Gray for in-progress
    } else {
      return '#D1D5DB'; // Light gray for locked
    }
  }
}

// Singleton instance
export const achievementEngine = new AchievementEngine(); 