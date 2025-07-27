import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Trophy, 
  TrendingUp, 
  Dumbbell, 
  Target,
  Award,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { WorkoutAPIv2 } from '@/lib/api/workouts-v2';
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PersonalRecordsProps {
  className?: string;
}

interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  reps: number;
  date: Date;
  sessionId: string;
  workoutName: string;
  volume: number; // weight * reps
  oneRepMax: number; // Estimated 1RM using Brzycki formula
}

interface PRFilters {
  search: string;
  dateRange: 'all' | 'week' | 'month' | '3months' | 'year';
  sortBy: 'weight' | 'date' | 'volume' | '1rm';
  sortOrder: 'asc' | 'desc';
}

interface ExerciseProgression {
  exerciseName: string;
  records: Array<{
    date: Date;
    weight: number;
    reps: number;
    volume: number;
    oneRepMax: number;
  }>;
  currentPR: PersonalRecord;
  improvement: {
    weightGain: number;
    volumeGain: number;
    timeSpan: number; // days
  };
}

export const PersonalRecords: React.FC<PersonalRecordsProps> = ({ className }) => {
  const { currentUser } = useAuth();
  const [filters, setFilters] = useState<PRFilters>({
    search: '',
    dateRange: 'all',
    sortBy: 'weight',
    sortOrder: 'desc'
  });
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Fetch user's workout sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['user-workout-sessions', currentUser?.uid],
    queryFn: () => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      return WorkoutAPIv2.getUserWorkoutSessions(currentUser.uid);
    },
    enabled: !!currentUser?.uid,
  });

  // Calculate Brzycki 1RM formula: weight / (1.0278 - 0.0278 × reps)
  const calculateOneRepMax = (weight: number, reps: number): number => {
    if (reps === 1) return weight;
    if (reps > 10) return weight; // Formula less accurate for high reps
    return Math.round(weight / (1.0278 - 0.0278 * reps));
  };

  // Extract all personal records from workout sessions
  const personalRecords = useMemo((): PersonalRecord[] => {
    const records: Record<string, PersonalRecord> = {};

    sessions
      .filter(session => session.completed)
      .forEach(session => {
        session.exercises.forEach(exercise => {
          exercise.sets.forEach(set => {
            if (set.completed && set.weight && set.reps && set.weight > 0 && set.reps > 0) {
              const volume = set.weight * set.reps;
              const oneRepMax = calculateOneRepMax(set.weight, set.reps);
              const key = exercise.exerciseName;

              // Check if this is a new PR for this exercise
              if (!records[key] || set.weight > records[key].maxWeight) {
                records[key] = {
                  exerciseName: exercise.exerciseName,
                  maxWeight: set.weight,
                  reps: set.reps,
                  date: new Date(session.startTime),
                  sessionId: session.id,
                  workoutName: session.workoutName,
                  volume,
                  oneRepMax
                };
              }
            }
          });
        });
      });

    return Object.values(records);
  }, [sessions]);

  // Calculate exercise progressions for chart display
  const exerciseProgressions = useMemo((): Record<string, ExerciseProgression> => {
    const progressions: Record<string, ExerciseProgression> = {};

    sessions
      .filter(session => session.completed)
      .forEach(session => {
        session.exercises.forEach(exercise => {
          const exerciseName = exercise.exerciseName;
          
          if (!progressions[exerciseName]) {
            progressions[exerciseName] = {
              exerciseName,
              records: [],
              currentPR: personalRecords.find(pr => pr.exerciseName === exerciseName)!,
              improvement: { weightGain: 0, volumeGain: 0, timeSpan: 0 }
            };
          }

          exercise.sets.forEach(set => {
            if (set.completed && set.weight && set.reps && set.weight > 0 && set.reps > 0) {
              const volume = set.weight * set.reps;
              const oneRepMax = calculateOneRepMax(set.weight, set.reps);
              
              progressions[exerciseName].records.push({
                date: new Date(session.startTime),
                weight: set.weight,
                reps: set.reps,
                volume,
                oneRepMax
              });
            }
          });
        });
      });

    // Calculate improvements and sort records by date
    Object.values(progressions).forEach(progression => {
      progression.records.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      if (progression.records.length >= 2) {
        const first = progression.records[0];
        const last = progression.records[progression.records.length - 1];
        
        progression.improvement = {
          weightGain: last.weight - first.weight,
          volumeGain: last.volume - first.volume,
          timeSpan: Math.floor((last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24))
        };
      }
    });

    return progressions;
  }, [sessions, personalRecords]);

  // Filter and sort personal records
  const filteredRecords = useMemo(() => {
    let filtered = [...personalRecords];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(record => 
        record.exerciseName.toLowerCase().includes(searchLower) ||
        record.workoutName.toLowerCase().includes(searchLower)
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
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }
      
      filtered = filtered.filter(record => record.date >= cutoffDate);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'weight':
          aValue = a.maxWeight;
          bValue = b.maxWeight;
          break;
        case 'date':
          aValue = a.date.getTime();
          bValue = b.date.getTime();
          break;
        case 'volume':
          aValue = a.volume;
          bValue = b.volume;
          break;
        case '1rm':
          aValue = a.oneRepMax;
          bValue = b.oneRepMax;
          break;
        default:
          aValue = a.maxWeight;
          bValue = b.maxWeight;
      }
      
      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [personalRecords, filters]);

  // Update filter
  const updateFilter = (key: keyof PRFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Get progression chart data for selected exercise
  const getProgressionChartData = (exerciseName: string) => {
    const progression = exerciseProgressions[exerciseName];
    if (!progression) return null;

    // Get unique dates and their max weights
    const dataPoints = progression.records
      .reduce((acc, record) => {
        const dateKey = record.date.toISOString().split('T')[0];
        if (!acc[dateKey] || record.weight > acc[dateKey].weight) {
          acc[dateKey] = record;
        }
        return acc;
      }, {} as Record<string, typeof progression.records[0]>);

    const sortedData = Object.values(dataPoints).sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      labels: sortedData.map(d => formatDate(d.date)),
      datasets: [
        {
          label: 'Max Weight (lbs)',
          data: sortedData.map(d => d.weight),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Personal Records
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Track your strength gains and celebrate your achievements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            {filteredRecords.length} PRs
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total PRs</p>
                <p className="text-2xl font-bold text-gray-900">{personalRecords.length}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Heaviest Lift</p>
                <p className="text-2xl font-bold text-gray-900">
                  {personalRecords.length > 0 ? Math.max(...personalRecords.map(pr => pr.maxWeight)) : 0} lbs
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <Dumbbell className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Best 1RM</p>
                <p className="text-2xl font-bold text-gray-900">
                  {personalRecords.length > 0 ? Math.max(...personalRecords.map(pr => pr.oneRepMax)) : 0} lbs
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {personalRecords.filter(pr => {
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return pr.date >= monthAgo;
                  }).length}
                </p>
                <p className="text-xs text-gray-500">new PRs</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">All Records</span>
            <span className="sm:hidden">Records</span>
          </TabsTrigger>
          <TabsTrigger value="progression" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Progression</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search exercises..."
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
                    <SelectItem value="year">Last year</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort By */}
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">Max Weight</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="1rm">1RM</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort Order */}
                <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Highest first</SelectItem>
                    <SelectItem value="asc">Lowest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Personal Records List */}
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No personal records found</h3>
                  <p className="text-gray-600 mb-4">
                    Complete workouts with weights to start tracking your personal records
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map((record) => (
                <Card key={`${record.exerciseName}-${record.date.getTime()}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate mb-1">
                          {record.exerciseName}
                        </h3>
                        <p className="text-sm text-gray-600">{formatDate(record.date)}</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 ml-2">
                        <Star className="w-3 h-3 mr-1" />
                        PR
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Max Weight:</span>
                        <span className="font-bold text-lg text-gray-900">{record.maxWeight} lbs</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Reps:</span>
                        <span className="font-medium text-gray-900">{record.reps}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Volume:</span>
                        <span className="font-medium text-gray-900">{record.volume} lbs</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Est. 1RM:</span>
                        <span className="font-medium text-gray-900">{record.oneRepMax} lbs</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 truncate">
                        From: {record.workoutName}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progression" className="space-y-4">
          {/* Exercise Selection */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Select 
                  value={selectedExercise || ''} 
                  onValueChange={(value) => setSelectedExercise(value || null)}
                >
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue placeholder="Select exercise to view progression" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(exerciseProgressions).map(exerciseName => (
                      <SelectItem key={exerciseName} value={exerciseName}>
                        {exerciseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Progression Chart */}
          {selectedExercise && exerciseProgressions[selectedExercise] && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {selectedExercise} Progression
                </CardTitle>
                <CardDescription>
                  Track your strength gains over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80 mb-4">
                  <Line 
                    data={getProgressionChartData(selectedExercise)!} 
                    options={{
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
                          title: {
                            display: true,
                            text: 'Weight (lbs)'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Date'
                          }
                        }
                      },
                    }}
                  />
                </div>

                {/* Progression Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Weight Gain</p>
                    <p className="text-lg font-bold text-green-900">
                      +{exerciseProgressions[selectedExercise].improvement.weightGain} lbs
                    </p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Volume Gain</p>
                    <p className="text-lg font-bold text-blue-900">
                      +{exerciseProgressions[selectedExercise].improvement.volumeGain} lbs
                    </p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Time Span</p>
                    <p className="text-lg font-bold text-purple-900">
                      {exerciseProgressions[selectedExercise].improvement.timeSpan} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedExercise && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select an exercise</h3>
                  <p className="text-gray-600">
                    Choose an exercise from the dropdown above to view your progression over time
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}; 