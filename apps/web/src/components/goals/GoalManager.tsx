import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Plus, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Trophy,
  Dumbbell,
  Activity,
  Zap,
  Flag,
  Edit3,
  MoreHorizontal
} from 'lucide-react';
import { useActiveGoals, useOverdueGoals, useCompletedGoals } from '@/hooks/useGoals';
import { GoalCreateForm } from './GoalCreateForm';
import { GoalEditForm } from './GoalEditForm';
import { GoalProgressTracker } from './GoalProgressTracker';
import type { Goal, GoalCategory } from 'shared/schemas/goal';
import { isGoalOverdue, getDaysUntilDeadline } from 'shared/schemas/goal';

interface GoalManagerProps {
  className?: string;
}

export const GoalManager: React.FC<GoalManagerProps> = ({ className }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [trackingGoal, setTrackingGoal] = useState<Goal | null>(null);

  // Fetch goals data
  const { data: activeGoals = [], isLoading: activeLoading } = useActiveGoals();
  const { data: overdueGoals = [], isLoading: overdueLoading } = useOverdueGoals();
  const { data: completedGoals = [], isLoading: completedLoading } = useCompletedGoals(5);

  // Get category icon
  const getCategoryIcon = (category: GoalCategory) => {
    switch (category) {
      case 'strength': return <Dumbbell className="w-4 h-4" />;
      case 'endurance': return <Activity className="w-4 h-4" />;
      case 'weight_loss': return <TrendingUp className="w-4 h-4" />;
      case 'muscle_gain': return <Zap className="w-4 h-4" />;
      case 'flexibility': return <Target className="w-4 h-4" />;
      case 'general_fitness': return <Trophy className="w-4 h-4" />;
      case 'sport_specific': return <Flag className="w-4 h-4" />;
      case 'rehabilitation': return <Target className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Render goal card
  const renderGoalCard = (goal: Goal, showActions = true) => {
    const isOverdue = isGoalOverdue(goal);
    const daysUntilDeadline = getDaysUntilDeadline(goal);
    
    return (
      <Card key={goal.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200' : ''}`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                {getCategoryIcon(goal.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate mb-1">
                  {goal.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {goal.description || 'No description provided'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Badge className={getPriorityColor(goal.priority)}>
                {goal.priority}
              </Badge>
              {showActions && (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {goal.progress_percentage}%
              </span>
            </div>
            <Progress value={goal.progress_percentage} className="h-2" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {goal.current_value} / {goal.target_value} {goal.unit}
              </span>
              {goal.progress_percentage >= 100 ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              ) : isOverdue ? (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              ) : (
                <span className="text-gray-500">
                  {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Due today'}
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Due {formatDate(goal.target_date)}</span>
            </div>
            {showActions && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTrackingGoal(goal)}
                  className="h-8 px-2"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Update
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingGoal(goal)}
                  className="h-8 px-2"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (activeLoading || overdueLoading || completedLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" />
            Goal Management
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Set targets, track progress, and achieve your fitness goals
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Goal
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Goals</p>
                <p className="text-2xl font-bold text-gray-900">{activeGoals.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedGoals.length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{overdueGoals.length}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeGoals.length > 0 
                    ? Math.round(activeGoals.reduce((sum, goal) => sum + goal.progress_percentage, 0) / activeGoals.length)
                    : 0}%
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Active Goals</span>
            <span className="sm:hidden">Active</span>
            {activeGoals.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeGoals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Overdue</span>
            {overdueGoals.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {overdueGoals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Completed</span>
            <span className="sm:hidden">Done</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeGoals.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active goals</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first goal to start tracking your fitness progress
                  </p>
                  <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Goal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGoals.map(goal => renderGoalCard(goal))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {overdueGoals.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Great job!</h3>
                  <p className="text-gray-600">
                    You have no overdue goals. Keep up the excellent work!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overdueGoals.map(goal => renderGoalCard(goal))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedGoals.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No completed goals yet</h3>
                  <p className="text-gray-600">
                    Complete your first goal to see your achievements here
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedGoals.map(goal => renderGoalCard(goal, false))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showCreateForm && (
        <GoalCreateForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => setShowCreateForm(false)}
        />
      )}

      {editingGoal && (
        <GoalEditForm
          goal={editingGoal}
          onClose={() => setEditingGoal(null)}
          onSuccess={() => setEditingGoal(null)}
        />
      )}

      {trackingGoal && (
        <GoalProgressTracker
          goal={trackingGoal}
          onClose={() => setTrackingGoal(null)}
          onSuccess={() => setTrackingGoal(null)}
        />
      )}
    </div>
  );
}; 