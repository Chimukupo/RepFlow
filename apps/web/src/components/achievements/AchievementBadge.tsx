import React from 'react';
import { 
  Trophy, 
  Target, 
  Flame, 
  TrendingUp, 
  Weight, 
  Compass, 
  Zap, 
  Star, 
  PlayCircle, 
  CalendarCheck,
  Award,
  Crown,
  Zap as Muscle,
  Dumbbell,
  Clock,
  Repeat,
  Map,
  User,
  Calendar,
  Gift
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { SimpleAchievement } from '@/lib/achievements/achievementEngine';

interface AchievementBadgeProps {
  achievement: SimpleAchievement;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  onClick?: () => void;
}

// Icon mapping
const iconMap = {
  'trophy': Trophy,
  'target': Target,
  'flame': Flame,
  'trending-up': TrendingUp,
  'weight': Weight,
  'compass': Compass,
  'zap': Zap,
  'star': Star,
  'play-circle': PlayCircle,
  'calendar-check': CalendarCheck,
  'award': Award,
  'crown': Crown,
  'muscle': Muscle,
  'dumbbell': Dumbbell,
  'clock': Clock,
  'repeat': Repeat,
  'map': Map,
  'user': User,
  'calendar': Calendar,
  'gift': Gift
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'medium',
  showProgress = true,
  onClick
}) => {
  const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Trophy;
  
  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const iconSizes = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };



  const getStatusOpacity = () => {
    if (achievement.isCompleted) return 'opacity-100';
    if (achievement.currentValue > 0) return 'opacity-80';
    return 'opacity-50';
  };

  const getTierGradient = () => {
    const gradients = {
      bronze: 'from-orange-400 to-orange-600',
      silver: 'from-gray-300 to-gray-500',
      gold: 'from-yellow-300 to-yellow-500',
      platinum: 'from-gray-200 to-gray-400',
      diamond: 'from-blue-200 to-blue-400'
    };
    return gradients[achievement.tier];
  };

  return (
    <Card 
      className={`glass-card ${sizeClasses[size]} ${getStatusOpacity()} transition-all duration-300 hover:scale-105 cursor-pointer group`}
      onClick={onClick}
    >
      <CardContent className="p-0 space-y-3">
        {/* Badge Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Achievement Icon */}
            <div 
              className={`p-2 rounded-full bg-gradient-to-br ${getTierGradient()} shadow-lg`}
              style={{ 
                backgroundColor: achievement.isCompleted ? achievement.color : '#E5E7EB',
                opacity: achievement.isCompleted ? 1 : 0.6
              }}
            >
              <IconComponent 
                className={`${iconSizes[size]} text-white`}
                style={{ color: achievement.isCompleted ? 'white' : '#9CA3AF' }}
              />
            </div>

            {/* Achievement Info */}
            <div className="flex-1">
              <h3 className={`font-bold text-foreground ${size === 'large' ? 'text-lg' : 'text-sm'} group-hover:text-primary transition-colors`}>
                {achievement.name}
              </h3>
              <p className={`text-muted-foreground ${size === 'large' ? 'text-sm' : 'text-xs'} line-clamp-2`}>
                {achievement.description}
              </p>
            </div>
          </div>

          {/* Tier Badge */}
          <Badge 
            variant="secondary" 
            className={`capitalize text-xs font-semibold ${size === 'small' ? 'px-2 py-1' : 'px-3 py-1'}`}
            style={{ 
              backgroundColor: achievement.color + '20',
              color: achievement.isCompleted ? achievement.color : '#6B7280',
              borderColor: achievement.color + '40'
            }}
          >
            {achievement.tier}
          </Badge>
        </div>

        {/* Progress Section */}
        {showProgress && !achievement.isCompleted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">
                {achievement.progressPercentage}%
              </span>
            </div>
            <Progress 
              value={achievement.progressPercentage} 
              className="h-2"
              style={{
                backgroundColor: '#E5E7EB'
              }}
            />
            <div className="text-xs text-muted-foreground text-center">
              {achievement.currentValue.toLocaleString()} / {achievement.targetValue.toLocaleString()}
            </div>
          </div>
        )}

        {/* Completion Status */}
        {achievement.isCompleted && (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg py-2">
            <Trophy className="w-4 h-4" />
            <span>Completed!</span>
            {achievement.completedAt && (
              <span className="text-xs text-muted-foreground ml-1">
                {achievement.completedAt.toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Points */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Reward</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            <span className="font-medium text-foreground">{achievement.points} pts</span>
          </div>
        </div>

        {/* Special Title */}
        {achievement.title && achievement.isCompleted && (
          <div className="text-center">
            <Badge variant="outline" className="text-xs font-semibold border-yellow-400 text-yellow-600 bg-yellow-50">
              🏆 {achievement.title}
            </Badge>
          </div>
        )}

        {/* Secret Badge Indicator */}
        {achievement.isSecret && !achievement.isCompleted && (
          <div className="text-center">
            <Badge variant="outline" className="text-xs font-semibold border-purple-400 text-purple-600 bg-purple-50">
              🔒 Secret Achievement
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 