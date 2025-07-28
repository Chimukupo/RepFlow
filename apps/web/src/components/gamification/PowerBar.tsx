import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Flame, Trophy, Star } from 'lucide-react';

interface PowerBarProps {
  weeklyWorkouts: number;
  totalWorkouts: number;
  currentStreak: number;
  bestStreak: number;
  className?: string;
}

// Power levels and nicknames
const POWER_LEVELS = [
  { level: 0, name: 'Sleeper', minWorkouts: 0, color: 'text-gray-500', bgColor: 'bg-gray-100', icon: '😴' },
  { level: 1, name: 'Starter', minWorkouts: 1, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '🌱' },
  { level: 2, name: 'Warrior', minWorkouts: 2, color: 'text-green-600', bgColor: 'bg-green-100', icon: '⚔️' },
  { level: 3, name: 'Champion', minWorkouts: 3, color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '🏆' },
  { level: 4, name: 'Elite', minWorkouts: 4, color: 'text-orange-600', bgColor: 'bg-orange-100', icon: '🔥' },
  { level: 5, name: 'Legend', minWorkouts: 5, color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '👑' }
];

export const PowerBar: React.FC<PowerBarProps> = ({
  weeklyWorkouts,
  totalWorkouts,
  currentStreak,
  bestStreak,
  className = ''
}) => {
  // Calculate current level
  const getCurrentLevel = () => {
    for (let i = POWER_LEVELS.length - 1; i >= 0; i--) {
      if (weeklyWorkouts >= POWER_LEVELS[i].minWorkouts) {
        return POWER_LEVELS[i];
      }
    }
    return POWER_LEVELS[0];
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = POWER_LEVELS[Math.min(currentLevel.level + 1, POWER_LEVELS.length - 1)];
  const isMaxLevel = currentLevel.level === POWER_LEVELS.length - 1;
  
  // Calculate progress to next level
  const progressToNext = isMaxLevel ? 100 : 
    ((weeklyWorkouts - currentLevel.minWorkouts) / (nextLevel.minWorkouts - currentLevel.minWorkouts)) * 100;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Power Bar Card */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-foreground">
            <div className="p-2 rounded-lg bg-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            Power Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Level Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${currentLevel.bgColor} flex items-center justify-center text-xl`}>
                {currentLevel.icon}
              </div>
              <div>
                <h3 className={`text-xl font-bold ${currentLevel.color}`}>
                  {currentLevel.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Level {currentLevel.level}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {weeklyWorkouts}/7 this week
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isMaxLevel ? 'Max Level Achieved!' : `Progress to ${nextLevel.name}`}
              </span>
              {!isMaxLevel && (
                <span className="font-medium text-foreground">
                  {nextLevel.minWorkouts - weeklyWorkouts} workouts to go
                </span>
              )}
            </div>
            <Progress 
              value={progressToNext} 
              className="h-3"
            />
          </div>

          {/* Weekly Workout Grid */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">This Week</h4>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                    i < weeklyWorkouts
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-muted-foreground">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{currentStreak}</div>
            <div className="text-xs text-muted-foreground">days</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-muted-foreground">Best Streak</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{bestStreak}</div>
            <div className="text-xs text-muted-foreground">days</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Total Workouts</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{totalWorkouts}</div>
            <div className="text-xs text-muted-foreground">completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Descriptions */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-foreground">Power Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {POWER_LEVELS.map((level) => (
              <div
                key={level.level}
                className={`p-3 rounded-lg border transition-all ${
                  level.level === currentLevel.level
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-muted/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{level.icon}</span>
                  <span className={`font-medium ${level.color}`}>
                    {level.name}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {level.minWorkouts}+ workouts/week
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 