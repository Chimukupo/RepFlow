import React, { useState, useEffect } from 'react';
import { Plus, Play, Edit, Trash2, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkoutBuilder } from './WorkoutBuilder';
import { WorkoutSession } from './WorkoutSession';
import { WeeklyWorkoutPlanner } from './WeeklyWorkoutPlanner';
import { WorkoutAPIv2 } from '@/lib/api/workouts-v2';
import { useAuth } from '@/contexts/AuthContext';
import type { Workout } from 'shared/schemas/workout';

interface WorkoutManagerProps {
  onStartWorkout?: (workout: Workout) => void;
}

export const WorkoutManager: React.FC<WorkoutManagerProps> = ({
  onStartWorkout
}) => {
  const { currentUser } = useAuth();
  const [savedWorkouts, setSavedWorkouts] = useState<Workout[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [activeTab, setActiveTab] = useState('saved');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved workouts from Firebase on component mount
  useEffect(() => {
    const loadWorkouts = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading workouts for user:', currentUser.uid);
        const workouts = await WorkoutAPIv2.getUserWorkouts(currentUser.uid);
        console.log('Loaded workouts:', workouts);
        setSavedWorkouts(workouts);
        setError(null);
      } catch (err) {
        console.error('Error loading workouts:', err);
        setError('Failed to load workouts');
        // Fallback to localStorage for now
        const saved = localStorage.getItem('repflow-workouts');
        if (saved) {
          try {
            const workouts = JSON.parse(saved);
            setSavedWorkouts(workouts);
          } catch (parseError) {
            console.error('Error parsing saved workouts:', parseError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadWorkouts();
  }, [currentUser?.uid]);

  // Also save to localStorage as backup
  useEffect(() => {
    if (savedWorkouts.length > 0) {
      localStorage.setItem('repflow-workouts', JSON.stringify(savedWorkouts));
    }
  }, [savedWorkouts]);

  // Handle saving a workout
  const handleSaveWorkout = async (workout: Workout) => {
    console.log('handleSaveWorkout called with:', workout);
    console.log('Current user state:', currentUser);
    console.log('User UID:', currentUser?.uid);
    console.log('User email:', currentUser?.email);
    console.log('Auth state:', !!currentUser);
    
    if (!currentUser?.uid) {
      console.error('No authenticated user found');
      alert('Please log in to save workouts');
      return;
    }

    try {
      setLoading(true);
      console.log('Saving workout:', workout);
      console.log('Current user:', currentUser?.uid);
      
      const existingIndex = savedWorkouts.findIndex(w => w.id === workout.id);
      let savedWorkout: Workout;
      
      if (existingIndex >= 0) {
        // Update existing workout
        console.log('Updating existing workout');
        const workoutToUpdate = { ...workout, createdBy: currentUser.uid };
        savedWorkout = await WorkoutAPIv2.updateWorkout(workout.id, workoutToUpdate);
        setSavedWorkouts(prev => {
          const updated = [...prev];
          updated[existingIndex] = savedWorkout;
          return updated;
        });
      } else {
        // Create new workout
        console.log('Creating new workout');
        const workoutToCreate = { ...workout, createdBy: currentUser.uid };
        savedWorkout = await WorkoutAPIv2.createWorkout(currentUser.uid, workoutToCreate);
        console.log('Workout created successfully:', savedWorkout);
        setSavedWorkouts(prev => [...prev, savedWorkout]);
      }
      
      setShowBuilder(false);
      setEditingWorkout(null);
      alert('Workout saved successfully!');
    } catch (err) {
      console.error('Error saving workout:', err);
      console.error('Workout data:', workout);
      console.error('User ID:', currentUser?.uid);
      alert(`Failed to save workout: ${err instanceof Error ? err.message : 'Unknown error'}. Saved locally instead.`);
      
      // Fallback to localStorage
      const workoutWithUser = { ...workout, createdBy: currentUser.uid };
      setSavedWorkouts(prev => {
        const existingIndex = prev.findIndex(w => w.id === workout.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = workoutWithUser;
          return updated;
        } else {
          return [...prev, workoutWithUser];
        }
      });
      setShowBuilder(false);
      setEditingWorkout(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a workout
  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      setLoading(true);
      await WorkoutAPIv2.deleteWorkout(workoutId);
      setSavedWorkouts(prev => prev.filter(w => w.id !== workoutId));
    } catch (err) {
      console.error('Error deleting workout:', err);
      alert('Failed to delete workout. Please try again.');
      // Fallback to local deletion
      setSavedWorkouts(prev => prev.filter(w => w.id !== workoutId));
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a workout
  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setShowBuilder(true);
  };

  // Handle starting a workout
  const handleStartWorkout = (workout: Workout) => {
    setActiveWorkout(workout);
    onStartWorkout?.(workout);
  };

  // Handle completing a workout session
  const handleCompleteWorkoutSession = async (sessionData: any) => {
    console.log('Workout session completed:', sessionData);
    // Here you could save the session data to the workout-sessions collection
    // await WorkoutAPIv2.createWorkoutSession(currentUser.uid, sessionData);
    
    setActiveWorkout(null);
    alert('Workout completed! Great job! 🎉');
  };

  // Handle exiting a workout session
  const handleExitWorkoutSession = () => {
    setActiveWorkout(null);
  };

  // Get workout difficulty color
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Sample workout templates
  const workoutTemplates: Workout[] = [
    {
      id: 'template-push',
      name: 'Push Day',
      description: 'Chest, shoulders, and triceps workout',
      exercises: [],
      difficulty: 'intermediate',
      category: 'strength',
      estimatedDuration: 60,
      isTemplate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'template-pull',
      name: 'Pull Day',
      description: 'Back and biceps workout',
      exercises: [],
      difficulty: 'intermediate',
      category: 'strength',
      estimatedDuration: 60,
      isTemplate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'template-legs',
      name: 'Leg Day',
      description: 'Lower body strength training',
      exercises: [],
      difficulty: 'advanced',
      category: 'strength',
      estimatedDuration: 75,
      isTemplate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  // Show active workout session
  if (activeWorkout) {
    return (
      <WorkoutSession
        workout={activeWorkout}
        onComplete={handleCompleteWorkoutSession}
        onExit={handleExitWorkoutSession}
      />
    );
  }

  // Show workout builder
  if (showBuilder) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {editingWorkout ? 'Edit Workout' : 'Create New Workout'}
          </h2>
          <Button
            variant="outline"
            onClick={() => {
              setShowBuilder(false);
              setEditingWorkout(null);
            }}
          >
            Back to Workouts
          </Button>
        </div>
        <WorkoutBuilder
          initialWorkout={editingWorkout || undefined}
          onSaveWorkout={handleSaveWorkout}
          onStartWorkout={handleStartWorkout}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Workouts</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Create, manage, and start your workout routines
          </p>
        </div>
        <Button onClick={() => setShowBuilder(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Workout
        </Button>
      </div>

             {/* Tabs */}
       <Tabs value={activeTab} onValueChange={setActiveTab}>
         <TabsList>
           <TabsTrigger value="saved">My Workouts ({savedWorkouts.length})</TabsTrigger>
           <TabsTrigger value="templates">Templates</TabsTrigger>
           <TabsTrigger value="planner">Weekly Planner</TabsTrigger>
         </TabsList>

        {/* Saved Workouts */}
        <TabsContent value="saved" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3">Loading workouts...</span>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : savedWorkouts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No saved workouts</h3>
                <p className="text-gray-600 mb-4 text-center">
                  Create your first custom workout to get started
                </p>
                <Button onClick={() => setShowBuilder(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Workout
                </Button>
              </CardContent>
            </Card>
                     ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {savedWorkouts.map((workout) => (
                <Card key={workout.id} className="glass-card hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-foreground">{workout.name}</CardTitle>
                        {workout.description && (
                          <p className="text-sm text-muted-foreground mt-1">{workout.description}</p>
                        )}
                      </div>
                      {workout.difficulty && (
                        <Badge className={getDifficultyColor(workout.difficulty)}>
                          {workout.difficulty}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                                         {/* Workout Stats */}
                     <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                       <span className="flex items-center gap-1">
                         <Target className="w-3 h-3" />
                         {workout.exercises.length} exercises
                       </span>
                       <span className="flex items-center gap-1">
                         <Clock className="w-3 h-3" />
                         {workout.estimatedDuration}min
                       </span>
                     </div>

                    {/* Exercise Preview */}
                    {workout.exercises.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Exercises:</p>
                        <div className="flex flex-wrap gap-1">
                          {workout.exercises.slice(0, 3).map((exercise) => (
                            <Badge key={exercise.id} variant="secondary" className="text-xs">
                              {exercise.exerciseName}
                            </Badge>
                          ))}
                          {workout.exercises.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{workout.exercises.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                                         {/* Actions */}
                     <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:gap-2">
                       <Button
                         onClick={() => handleStartWorkout(workout)}
                         className="flex-1"
                         size="sm"
                       >
                         <Play className="w-3 h-3 mr-1" />
                         Start
                       </Button>
                       <div className="flex gap-2 sm:gap-1">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleEditWorkout(workout)}
                           className="flex-1 sm:flex-none"
                         >
                           <Edit className="w-3 h-3 sm:mr-0 mr-1" />
                           <span className="sm:hidden">Edit</span>
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleDeleteWorkout(workout.id)}
                           className="flex-1 sm:flex-none"
                         >
                           <Trash2 className="w-3 h-3 sm:mr-0 mr-1" />
                           <span className="sm:hidden">Delete</span>
                         </Button>
                       </div>
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

                 {/* Workout Templates */}
         <TabsContent value="templates" className="space-y-4">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workoutTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.description && (
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      )}
                    </div>
                    {template.difficulty && (
                      <Badge className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.estimatedDuration}min
                    </span>
                    <span className="capitalize">{template.category}</span>
                  </div>

                  <Button
                    onClick={() => handleEditWorkout(template)}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
                 </TabsContent>

         {/* Weekly Planner */}
         <TabsContent value="planner" className="space-y-4">
           <WeeklyWorkoutPlanner
             savedWorkouts={savedWorkouts}
             onScheduleWorkout={(day, workout) => {
               console.log(`Scheduled ${workout.name} for ${day}`);
             }}
           />
         </TabsContent>
       </Tabs>
     </div>
   );
 }; 