import React, { useState } from 'react';
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Award,
  Crown,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AchievementBadge } from './AchievementBadge';
import { achievementEngine } from '@/lib/achievements/achievementEngine';

export const AchievementDashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  // Get achievement data
  const allAchievements = achievementEngine.getAchievements();
  const completedAchievements = achievementEngine.getCompletedAchievements();
  const nextAchievements = achievementEngine.getNextAchievements(3);
  const summary = achievementEngine.getAchievementSummary();

  // Filter achievements
  const getFilteredAchievements = () => {
    let filtered = allAchievements;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    if (selectedTier !== 'all') {
      filtered = filtered.filter(a => a.tier === selectedTier);
    }

    return filtered.sort((a, b) => {
      // Completed first, then by progress, then by tier
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? -1 : 1;
      }
      if (a.progressPercentage !== b.progressPercentage) {
        return b.progressPercentage - a.progressPercentage;
      }
      const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };
      return tierOrder[a.tier] - tierOrder[b.tier];
    });
  };

  const filteredAchievements = getFilteredAchievements();

  // Calculate completion percentage
  const overallProgress = Math.round((completedAchievements.length / allAchievements.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <h2 className="text-3xl font-bold text-foreground">Achievements</h2>
            <p className="text-muted-foreground">
              Track your fitness milestones and unlock rewards
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm font-bold text-foreground">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{completedAchievements.length} of {allAchievements.length} achievements unlocked</span>
            <span>{summary.totalPoints} total points</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Badges</p>
                <p className="text-2xl font-bold text-foreground">{summary.totalBadges}</p>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold text-foreground">{summary.totalPoints}</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-foreground">{summary.currentStreak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Streak</p>
                <p className="text-2xl font-bold text-foreground">{summary.longestStreak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Tier Breakdown */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Badge Collection
          </CardTitle>
          <CardDescription>
            Your achievements organized by tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(summary.badgesByTier).map(([tier, count]) => (
              <div key={tier} className="text-center space-y-2">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                  tier === 'bronze' ? 'bg-orange-100 text-orange-600' :
                  tier === 'silver' ? 'bg-gray-100 text-gray-600' :
                  tier === 'gold' ? 'bg-yellow-100 text-yellow-600' :
                  tier === 'platinum' ? 'bg-gray-100 text-gray-700' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{tier}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next to Unlock */}
      {nextAchievements.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Next to Unlock
            </CardTitle>
            <CardDescription>
              Achievements you're closest to earning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nextAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  size="small"
                  showProgress={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Achievements */}
      {summary.recentAchievements.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Achievements
            </CardTitle>
            <CardDescription>
              Your latest accomplishments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.recentAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  size="small"
                  showProgress={false}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Achievements */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Achievements</CardTitle>
              <CardDescription>
                Browse and track all available achievements
              </CardDescription>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-sm border rounded-md bg-background text-foreground"
              >
                <option value="all">All Categories</option>
                <option value="milestone">Milestones</option>
                <option value="consistency">Consistency</option>
                <option value="strength">Strength</option>
                <option value="volume">Volume</option>
                <option value="endurance">Endurance</option>
                <option value="exploration">Exploration</option>
                <option value="dedication">Dedication</option>
              </select>
              
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="px-3 py-2 text-sm border rounded-md bg-background text-foreground"
              >
                <option value="all">All Tiers</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                size="medium"
                showProgress={true}
              />
            ))}
          </div>
          
          {filteredAchievements.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No achievements found with the current filters.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedTier('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 