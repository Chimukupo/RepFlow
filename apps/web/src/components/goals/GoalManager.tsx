import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Plus, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Trophy,
  Dumbbell,
  Activity,
  Zap,
  Flag,
  Edit3
} from 'lucide-react';

// Demo goal type
interface DemoGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  priority: string;
  status: string;
  target_value: number;
  current_value: number;
  unit: string;
  target_date: Date;
  progress: number;
  daysRemaining?: number;
  completedDate?: Date;
}

// Mock data for demo
const MOCK_GOALS: DemoGoal[] = [
  {
    id: '1',
    title: 'Bench Press 100kg',
    description: 'Reach a 100kg bench press personal record',
    category: 'strength',
    type: 'performance',
    priority: 'high',
    status: 'active',
    target_value: 100,
    current_value: 85,
    unit: 'kg',
    target_date: new Date('2024-03-15'),
    progress: 85,
    daysRemaining: 45
  },
  {
    id: '2',
    title: 'Run 5K in 25 minutes',
    description: 'Improve cardiovascular endurance',
    category: 'endurance',
    type: 'performance',
    priority: 'medium',
    status: 'active',
    target_value: 25,
    current_value: 28,
    unit: 'minutes',
    target_date: new Date('2024-04-01'),
    progress: 75,
    daysRemaining: 62
  },
  {
    id: '3',
    title: 'Lose 5kg',
    description: 'Reach target weight for summer',
    category: 'weight_loss',
    type: 'body_composition',
    priority: 'high',
    status: 'active',
    target_value: 5,
    current_value: 3,
    unit: 'kg',
    target_date: new Date('2024-05-01'),
    progress: 60,
    daysRemaining: 92
  }
];

const COMPLETED_GOALS: DemoGoal[] = [
  {
    id: '4',
    title: 'Complete 30-day workout streak',
    description: 'Build consistent workout habit',
    category: 'general_fitness',
    type: 'habit',
    priority: 'medium',
    status: 'completed',
    target_value: 30,
    current_value: 30,
    unit: 'days',
    target_date: new Date('2024-01-31'),
    progress: 100,
    completedDate: new Date('2024-01-30')
  }
];

interface GoalManagerProps {
  className?: string;
}

export const GoalManager: React.FC<GoalManagerProps> = ({ className }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength': return <Dumbbell className="w-4 h-4" />;
      case 'endurance': return <Activity className="w-4 h-4" />;
      case 'weight_loss': return <TrendingUp className="w-4 h-4" />;
      case 'muscle_gain': return <Zap className="w-4 h-4" />;
      case 'flexibility': return <Target className="w-4 h-4" />;
      case 'general_fitness': return <Trophy className="w-4 h-4" />;
      case 'sport_specific': return <Flag className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const renderGoalCard = (goal: DemoGoal, showActions = true) => (
    <Card key={goal.id} className="glass-card hover:scale-105 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(goal.category)}
            <div>
              <CardTitle className="text-lg text-foreground">{goal.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
            </div>
          </div>
          <Badge className={getPriorityColor(goal.priority)}>
            {goal.priority}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {goal.current_value}/{goal.target_value} {goal.unit}
            </span>
          </div>
          <Progress value={goal.progress} className="h-2" />
          <div className="text-center text-sm text-muted-foreground">
            {goal.progress}% Complete
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {goal.status === 'completed' && goal.completedDate ? (
              <span>Completed {formatDate(goal.completedDate)}</span>
            ) : (
              <span>Due {formatDate(goal.target_date)}</span>
            )}
          </div>
          {goal.status === 'active' && (
            <Badge variant="outline" className="text-xs">
              {goal.daysRemaining} days left
            </Badge>
          )}
        </div>

        {/* Actions */}
        {showActions && goal.status === 'active' && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1">
              Update Progress
            </Button>
            <Button size="sm" variant="ghost">
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {goal.status === 'completed' && (
          <div className="flex items-center justify-center gap-2 text-green-600 pt-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Goal Achieved!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Goal Manager
          </h1>
          <p className="text-muted-foreground mt-2">
            Set, track, and achieve your fitness goals
          </p>
        </div>
        
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          {showCreateForm ? 'Cancel' : 'New Goal'}
        </Button>
      </div>

      {/* Create Goal Form */}
      {showCreateForm && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground">Create New Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground mb-2">Goal Creation Form</h3>
              <p className="text-muted-foreground mb-4">
                This feature will be fully implemented in the next version
              </p>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">{MOCK_GOALS.length}</div>
            <div className="text-sm text-muted-foreground">Active Goals</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">{COMPLETED_GOALS.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">73%</div>
            <div className="text-sm text-muted-foreground">Avg Progress</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">66</div>
            <div className="text-sm text-muted-foreground">Days Avg</div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'active' ? 'default' : 'outline'}
          onClick={() => setActiveTab('active')}
          className="gap-2"
        >
          <Clock className="w-4 h-4" />
          Active Goals ({MOCK_GOALS.length})
        </Button>
        <Button
          variant={activeTab === 'completed' ? 'default' : 'outline'}
          onClick={() => setActiveTab('completed')}
          className="gap-2"
        >
          <Trophy className="w-4 h-4" />
          Completed ({COMPLETED_GOALS.length})
        </Button>
      </div>

      {/* Goals Grid */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_GOALS.map(goal => renderGoalCard(goal))}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMPLETED_GOALS.map(goal => renderGoalCard(goal, false))}
        </div>
      )}
    </div>
  );
}; 