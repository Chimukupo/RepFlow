import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Calendar, 
  Dumbbell, 
  Target, 
  Clock, 
  Trophy,
  Activity,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { WorkoutAPIv2 } from '@/lib/api/workouts-v2';
import { useQuery } from '@tanstack/react-query';
import { WorkoutHistory } from './WorkoutHistory';
import { PersonalRecords } from './PersonalRecords';
// Types are used in the component

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ProgressDashboardProps {
  className?: string;
}

interface WorkoutStats {
  totalWorkouts: number;
  totalVolume: number; // Total weight lifted
  averageDuration: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  mostFrequentMuscleGroups: Array<{ name: string; count: number }>;
  strengthProgress: Array<{ exercise: string; maxWeight: number; date: string }>;
  weeklyFrequency: Array<{ week: string; count: number }>;
  monthlyVolume: Array<{ month: string; volume: number }>;
  exerciseDistribution: Array<{ category: string; count: number }>;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ className }) => {
  const { currentUser } = useAuth();
  // Future enhancement: const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

  // Fetch user's workouts and sessions
  const { data: workouts = [], isLoading: workoutsLoading } = useQuery({
    queryKey: ['user-workouts', currentUser?.uid],
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return WorkoutAPIv2.getUserWorkouts(currentUser.uid);
    },
    enabled: !!currentUser?.uid,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['user-workout-sessions', currentUser?.uid],
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return WorkoutAPIv2.getUserWorkoutSessions(currentUser.uid);
    },
    enabled: !!currentUser?.uid,
  });

  // Calculate comprehensive workout statistics
  const workoutStats = useMemo((): WorkoutStats => {
    if (!workouts.length && !sessions.length) {
      return {
        totalWorkouts: 0,
        totalVolume: 0,
        averageDuration: 0,
        workoutsThisWeek: 0,
        workoutsThisMonth: 0,
        mostFrequentMuscleGroups: [],
        strengthProgress: [],
        weeklyFrequency: [],
        monthlyVolume: [],
        exerciseDistribution: [],
      };
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate basic stats from sessions (completed workouts)
    const completedSessions = sessions.filter(s => s.completed);
    const totalWorkouts = completedSessions.length;
    const workoutsThisWeek = completedSessions.filter(s => new Date(s.startTime) >= oneWeekAgo).length;
    const workoutsThisMonth = completedSessions.filter(s => new Date(s.startTime) >= oneMonthAgo).length;

    // Calculate total volume (weight lifted)
    let totalVolume = 0;
    let totalDuration = 0;
    const muscleGroupCount: Record<string, number> = {};
    const exerciseMaxWeights: Record<string, { weight: number; date: string }> = {};
    const categoryCount: Record<string, number> = {};

    completedSessions.forEach(session => {
      if (session.totalDuration) {
        totalDuration += session.totalDuration;
      }

      session.exercises.forEach(exercise => {
        // Count exercise categories
        const workout = workouts.find(w => w.id === session.workoutId);
        if (workout?.category) {
          categoryCount[workout.category] = (categoryCount[workout.category] || 0) + 1;
        }

        exercise.sets.forEach(set => {
          if (set.completed && set.weight && set.reps) {
            const volume = set.weight * set.reps;
            totalVolume += volume;

            // Track max weight for each exercise
            if (!exerciseMaxWeights[exercise.exerciseName] || set.weight > exerciseMaxWeights[exercise.exerciseName].weight) {
              exerciseMaxWeights[exercise.exerciseName] = {
                weight: set.weight,
                date: session.startTime.toISOString().split('T')[0]
              };
            }
          }
        });

        // Count muscle groups (simplified - would need exercise database integration)
        // For now, we'll use exercise names as a proxy
        const exerciseName = exercise.exerciseName.toLowerCase();
        if (exerciseName.includes('chest') || exerciseName.includes('bench')) {
          muscleGroupCount['Chest'] = (muscleGroupCount['Chest'] || 0) + 1;
        } else if (exerciseName.includes('back') || exerciseName.includes('row')) {
          muscleGroupCount['Back'] = (muscleGroupCount['Back'] || 0) + 1;
        } else if (exerciseName.includes('leg') || exerciseName.includes('squat')) {
          muscleGroupCount['Legs'] = (muscleGroupCount['Legs'] || 0) + 1;
        } else if (exerciseName.includes('shoulder') || exerciseName.includes('press')) {
          muscleGroupCount['Shoulders'] = (muscleGroupCount['Shoulders'] || 0) + 1;
        } else {
          muscleGroupCount['Other'] = (muscleGroupCount['Other'] || 0) + 1;
        }
      });
    });

    const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

    // Generate weekly frequency data (last 8 weeks)
    const weeklyFrequency: Array<{ week: string; count: number }> = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekLabel = `Week ${8 - i}`;
      const count = completedSessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= weekStart && sessionDate < weekEnd;
      }).length;
      weeklyFrequency.push({ week: weekLabel, count });
    }

    // Generate monthly volume data (last 6 months)
    const monthlyVolume: Array<{ month: string; volume: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      let monthVolume = 0;
      completedSessions.forEach(session => {
        const sessionDate = new Date(session.startTime);
        if (sessionDate >= monthStart && sessionDate <= monthEnd) {
          session.exercises.forEach(exercise => {
            exercise.sets.forEach(set => {
              if (set.completed && set.weight && set.reps) {
                monthVolume += set.weight * set.reps;
              }
            });
          });
        }
      });
      monthlyVolume.push({ month: monthLabel, volume: monthVolume });
    }

    return {
      totalWorkouts,
      totalVolume,
      averageDuration,
      workoutsThisWeek,
      workoutsThisMonth,
      mostFrequentMuscleGroups: Object.entries(muscleGroupCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      strengthProgress: Object.entries(exerciseMaxWeights)
        .map(([exercise, data]) => ({ exercise, maxWeight: data.weight, date: data.date }))
        .sort((a, b) => b.maxWeight - a.maxWeight)
        .slice(0, 10),
      weeklyFrequency,
      monthlyVolume,
      exerciseDistribution: Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
    };
  }, [workouts, sessions]);

  // Chart configurations
  const weeklyFrequencyChartData = {
    labels: workoutStats.weeklyFrequency.map(d => d.week),
    datasets: [
      {
        label: 'Workouts per Week',
        data: workoutStats.weeklyFrequency.map(d => d.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const monthlyVolumeChartData = {
    labels: workoutStats.monthlyVolume.map(d => d.month),
    datasets: [
      {
        label: 'Total Volume (lbs)',
        data: workoutStats.monthlyVolume.map(d => d.volume),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const muscleGroupChartData = {
    labels: workoutStats.mostFrequentMuscleGroups.map(d => d.name),
    datasets: [
      {
        data: workoutStats.mostFrequentMuscleGroups.map(d => d.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (workoutsLoading || sessionsLoading) {
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
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Progress Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track your fitness journey with detailed analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="glass">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workouts</p>
                <p className="text-2xl font-bold text-foreground">{workoutStats.totalWorkouts}</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Dumbbell className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold text-foreground">
                  {(workoutStats.totalVolume / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-muted-foreground">lbs lifted</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-foreground">{workoutStats.workoutsThisWeek}</p>
                <p className="text-xs text-muted-foreground">workouts</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(workoutStats.averageDuration)}</p>
                <p className="text-xs text-gray-500">minutes</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="frequency" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="frequency" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Frequency</span>
          </TabsTrigger>
          <TabsTrigger value="volume" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Volume</span>
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            <span className="hidden sm:inline">Distribution</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Records</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frequency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Workout Frequency
              </CardTitle>
              <CardDescription>
                Your workout consistency over the past 8 weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <Line data={weeklyFrequencyChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Training Volume
              </CardTitle>
              <CardDescription>
                Total weight lifted per month over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <Bar data={monthlyVolumeChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Muscle Group Focus
              </CardTitle>
              <CardDescription>
                Distribution of exercises by muscle group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <Doughnut data={muscleGroupChartData} options={doughnutOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <WorkoutHistory />
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <PersonalRecords />
        </TabsContent>
      </Tabs>

      {/* Personal Records */}
      {workoutStats.strengthProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Personal Records
            </CardTitle>
            <CardDescription>
              Your best lifts across different exercises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workoutStats.strengthProgress.slice(0, 5).map((record, index) => (
                <div key={record.exercise} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900">{record.exercise}</p>
                      <p className="text-sm text-gray-600">{record.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{record.maxWeight} lbs</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 