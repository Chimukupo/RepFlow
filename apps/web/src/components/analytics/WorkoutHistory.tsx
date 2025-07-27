import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Calendar, 
  Clock, 
  Dumbbell, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Target,
  BarChart3,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { WorkoutAPIv2 } from '@/lib/api/workouts-v2';
import { useQuery } from '@tanstack/react-query';
import type { WorkoutSession } from 'shared/schemas/workout';

interface WorkoutHistoryProps {
  className?: string;
}

interface WorkoutHistoryFilters {
  search: string;
  dateRange: 'all' | 'week' | 'month' | '3months';
  status: 'all' | 'completed' | 'incomplete';
  sortBy: 'date' | 'duration' | 'volume';
  sortOrder: 'asc' | 'desc';
}

interface WorkoutSessionStats {
  totalSets: number;
  completedSets: number;
  totalVolume: number;
  averageWeight: number;
  totalReps: number;
  completionRate: number;
  topExercises: Array<{ name: string; volume: number }>;
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ className }) => {
  const { currentUser } = useAuth();
  const [filters, setFilters] = useState<WorkoutHistoryFilters>({
    search: '',
    dateRange: 'all',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);

  // Fetch user's workout sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['user-workout-sessions', currentUser?.uid],
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return WorkoutAPIv2.getUserWorkoutSessions(currentUser.uid);
    },
    enabled: !!currentUser?.uid,
  });

  // Calculate individual workout session statistics
  const calculateWorkoutStats = (session: WorkoutSession): WorkoutSessionStats => {
    let totalSets = 0;
    let completedSets = 0;
    let totalVolume = 0;
    let totalWeight = 0;
    let totalReps = 0;
    let weightedSets = 0;
    const exerciseVolumes: Record<string, number> = {};

    session.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        totalSets++;
        if (set.completed) {
          completedSets++;
          if (set.weight && set.reps) {
            const volume = set.weight * set.reps;
            totalVolume += volume;
            totalWeight += set.weight;
            totalReps += set.reps;
            weightedSets++;
            
            exerciseVolumes[exercise.exerciseName] = (exerciseVolumes[exercise.exerciseName] || 0) + volume;
          }
        }
      });
    });

    const averageWeight = weightedSets > 0 ? totalWeight / weightedSets : 0;
    const completionRate = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
    const topExercises = Object.entries(exerciseVolumes)
      .map(([name, volume]) => ({ name, volume }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3);

    return {
      totalSets,
      completedSets,
      totalVolume,
      averageWeight,
      totalReps,
      completionRate,
      topExercises
    };
  };

  // Filter and sort workout sessions
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(session => 
        session.workoutName.toLowerCase().includes(searchLower) ||
        session.notes?.toLowerCase().includes(searchLower) ||
        session.exercises.some(ex => ex.exerciseName.toLowerCase().includes(searchLower))
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (filters.dateRange) {
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3months':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }
      
      filtered = filtered.filter(session => new Date(session.startTime) >= cutoffDate);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(session => {
        if (filters.status === 'completed') return session.completed;
        if (filters.status === 'incomplete') return !session.completed;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.startTime).getTime();
          bValue = new Date(b.startTime).getTime();
          break;
        case 'duration':
          aValue = a.totalDuration || 0;
          bValue = b.totalDuration || 0;
          break;
        case 'volume':
          aValue = calculateWorkoutStats(a).totalVolume;
          bValue = calculateWorkoutStats(b).totalVolume;
          break;
        default:
          aValue = new Date(a.startTime).getTime();
          bValue = new Date(b.startTime).getTime();
      }
      
      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [sessions, filters]);

  // Update filter
  const updateFilter = (key: keyof WorkoutHistoryFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Format duration
  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Workout History</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Detailed view of all your workout sessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            {filteredSessions.length} workouts
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search workouts..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date Range */}
            <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="week">Last week</SelectItem>
                <SelectItem value="month">Last month</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
              </SelectContent>
            </Select>

            {/* Status */}
            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All workouts</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workout Sessions List */}
      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workouts found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.dateRange !== 'all' || filters.status !== 'all'
                  ? 'Try adjusting your filters to see more results'
                  : 'Start your first workout to see your history here'
                }
              </p>
              {(filters.search || filters.dateRange !== 'all' || filters.status !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({
                    search: '',
                    dateRange: 'all',
                    status: 'all',
                    sortBy: 'date',
                    sortOrder: 'desc'
                  })}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const stats = calculateWorkoutStats(session);
            
            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    {/* Workout Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {session.workoutName}
                        </h3>
                        {session.completed ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            Incomplete
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.startTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(session.totalDuration)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {stats.completedSets}/{stats.totalSets} sets
                        </div>
                        <div className="flex items-center gap-1">
                          <Dumbbell className="w-4 h-4" />
                          {(stats.totalVolume / 1000).toFixed(1)}k lbs
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.completionRate}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {stats.completionRate.toFixed(1)}% completion rate
                      </p>

                      {/* Top Exercises */}
                      {stats.topExercises.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Top exercises:</p>
                          <div className="flex flex-wrap gap-1">
                            {stats.topExercises.map((exercise, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {exercise.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {session.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700 italic">"{session.notes}"</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWorkout(session)}
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="sm:hidden">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        <span className="sm:hidden">Stats</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="sm:hidden"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Workout Detail Modal - Placeholder for future implementation */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {selectedWorkout.workoutName}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWorkout(null)}
                >
                  Close
                </Button>
              </CardTitle>
              <CardDescription>
                {formatDate(selectedWorkout.startTime)} • {formatDuration(selectedWorkout.totalDuration)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Detailed workout view coming soon...
                </p>
                {/* TODO: Implement detailed workout view */}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}; 