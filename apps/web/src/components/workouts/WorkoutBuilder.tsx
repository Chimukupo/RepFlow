import React, { useState, useCallback } from 'react';
import { Plus, Save, Play, Trash2, GripVertical, Target, Dumbbell, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { ExerciseSelector } from '../exercises/ExerciseSelector';
import type { Exercise } from 'shared/data/exercise-types';
import type { Workout, WorkoutExercise, WorkoutSet } from 'shared/schemas/workout';

interface WorkoutBuilderProps {
  onSaveWorkout?: (workout: Workout) => void;
  onStartWorkout?: (workout: Workout) => void;
  initialWorkout?: Workout;
}

export const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({
  onSaveWorkout,
  onStartWorkout,
  initialWorkout
}) => {
  const [workoutName, setWorkoutName] = useState(initialWorkout?.name || '');
  const [workoutDescription, setWorkoutDescription] = useState(initialWorkout?.description || '');
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(initialWorkout?.exercises || []);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);


  // Generate unique IDs
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Add exercise to workout
  const handleAddExercise = useCallback((exercise: Exercise) => {
    const workoutExercise: WorkoutExercise = {
      id: generateId(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [
        {
          id: generateId(),
          reps: exercise.targetReps?.min || 10,
          weight: 0,
          completed: false,
        }
      ],
      order: workoutExercises.length,
      restBetweenSets: exercise.restTime?.min || 60,
    };

    setWorkoutExercises(prev => [...prev, workoutExercise]);
    setShowExerciseSelector(false);
  }, [workoutExercises.length]);

  // Remove exercise from workout
  const handleRemoveExercise = useCallback((exerciseId: string) => {
    setWorkoutExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  }, []);

  // Add set to exercise
  const handleAddSet = useCallback((exerciseId: string) => {
    setWorkoutExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        const lastSet = exercise.sets[exercise.sets.length - 1];
        const newSet: WorkoutSet = {
          id: generateId(),
          reps: lastSet?.reps || 10,
          weight: lastSet?.weight || 0,
          completed: false,
        };
        return {
          ...exercise,
          sets: [...exercise.sets, newSet]
        };
      }
      return exercise;
    }));
  }, []);

  // Remove set from exercise
  const handleRemoveSet = useCallback((exerciseId: string, setId: string) => {
    setWorkoutExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: exercise.sets.filter(set => set.id !== setId)
        };
      }
      return exercise;
    }));
  }, []);

  // Update set values
  const handleUpdateSet = useCallback((exerciseId: string, setId: string, field: keyof WorkoutSet, value: any) => {
    setWorkoutExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: exercise.sets.map(set => {
            if (set.id === setId) {
              return { ...set, [field]: value };
            }
            return set;
          })
        };
      }
      return exercise;
    }));
  }, []);

  // Calculate estimated workout duration with realistic timing
  const calculateDuration = useCallback(() => {
    return workoutExercises.reduce((total, exercise) => {
      // Calculate time per set based on exercise type and reps
      const avgReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0) / exercise.sets.length;
      
      // Different exercises have different time per rep
      let timePerRep = 3; // Default 3 seconds per rep
      const exerciseName = exercise.exerciseName.toLowerCase();
      
      if (exerciseName.includes('plank') || exerciseName.includes('hold')) {
        timePerRep = avgReps; // For holds, reps usually represent seconds
      } else if (exerciseName.includes('deadlift') || exerciseName.includes('squat')) {
        timePerRep = 4; // Compound movements take longer
      } else if (exerciseName.includes('curl') || exerciseName.includes('extension')) {
        timePerRep = 2.5; // Isolation exercises are faster
      } else if (exerciseName.includes('push up') || exerciseName.includes('pull up')) {
        timePerRep = 2; // Bodyweight exercises
      } else if (exerciseName.includes('running') || exerciseName.includes('cardio')) {
        timePerRep = 60; // Cardio reps usually represent minutes
      }
      
      const setTime = exercise.sets.reduce((setTotal, set) => {
        return setTotal + (set.reps * timePerRep);
      }, 0);
      
      const restTime = (exercise.sets.length - 1) * (exercise.restBetweenSets || 60);
      const setupTime = 30; // 30 seconds setup time per exercise
      
      return total + setTime + restTime + setupTime;
    }, 0) / 60; // Convert to minutes
  }, [workoutExercises]);

  // Save workout
  const handleSaveWorkout = useCallback(() => {
    if (!workoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    if (workoutExercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    const workout: Workout = {
      id: initialWorkout?.id || generateId(),
      name: workoutName.trim(),
      description: workoutDescription.trim() || undefined,
      exercises: workoutExercises,
      estimatedDuration: Math.ceil(calculateDuration()),
      isTemplate: true,
      createdAt: initialWorkout?.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: initialWorkout?.createdBy || '', // This will be set by WorkoutManager
    };

    onSaveWorkout?.(workout);
  }, [workoutName, workoutDescription, workoutExercises, calculateDuration, initialWorkout, onSaveWorkout]);

  // Start workout
  const handleStartWorkout = useCallback(() => {
    if (workoutExercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    const workout: Workout = {
      id: initialWorkout?.id || generateId(),
      name: workoutName.trim() || 'Untitled Workout',
      description: workoutDescription.trim() || undefined,
      exercises: workoutExercises,
      estimatedDuration: Math.ceil(calculateDuration()),
      isTemplate: false,
      createdAt: initialWorkout?.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: initialWorkout?.createdBy || '', // This will be set by WorkoutManager
    };

    onStartWorkout?.(workout);
  }, [workoutName, workoutDescription, workoutExercises, calculateDuration, initialWorkout, onStartWorkout]);

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Builder</CardTitle>
          <CardDescription>Create your custom workout routine</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workout-name">Workout Name *</Label>
              <Input
                id="workout-name"
                placeholder="Enter workout name..."
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="workout-description">Description</Label>
              <Input
                id="workout-description"
                placeholder="Optional description..."
                value={workoutDescription}
                onChange={(e) => setWorkoutDescription(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

                     {/* Workout Stats */}
           <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
             <div className="text-center">
               <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                 <Target className="w-4 h-4" />
               </div>
               <div className="text-2xl font-bold text-gray-900">{workoutExercises.length}</div>
               <div className="text-xs text-gray-600">Exercises</div>
             </div>
             <div className="text-center">
               <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                 <Dumbbell className="w-4 h-4" />
               </div>
               <div className="text-2xl font-bold text-gray-900">
                 {workoutExercises.reduce((total, ex) => total + ex.sets.length, 0)}
               </div>
               <div className="text-xs text-gray-600">Total Sets</div>
             </div>
             <div className="text-center">
               <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                 <Clock className="w-4 h-4" />
               </div>
               <div className="text-2xl font-bold text-gray-900">{Math.ceil(calculateDuration())}</div>
               <div className="text-xs text-gray-600">Est. Minutes</div>
             </div>
           </div>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <div className="space-y-4">
        {workoutExercises.map((exercise) => (
          <Card key={exercise.id} className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex items-center gap-3 min-w-0">
                  <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg truncate text-foreground">{exercise.exerciseName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{exercise.sets.length} sets</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSet(exercise.id)}
                    className="flex-1 sm:flex-none"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Set
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveExercise(exercise.id)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="ml-1 sm:hidden">Remove</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                             {/* Sets Table */}
               <div className="space-y-3">
                 <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground px-3 py-2 glass rounded-md">
                   <span>Set</span>
                   <span>Reps</span>
                   <span>Weight (lbs)</span>
                   <span>Actions</span>
                 </div>
                                 {exercise.sets.map((set, setIndex) => (
                   <div key={set.id} className="grid grid-cols-4 gap-2 items-center p-2 hover:bg-accent/50 rounded-md transition-colors duration-200">
                     <Badge variant="outline" className="justify-center w-fit text-xs">
                       {setIndex + 1}
                     </Badge>
                     <Input
                       type="number"
                       min="1"
                       max="999"
                       value={set.reps}
                       onChange={(e) => handleUpdateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 1)}
                       className="text-center h-9"
                     />
                     <Input
                       type="number"
                       min="0"
                       max="9999"
                       step="0.5"
                       value={set.weight || 0}
                       onChange={(e) => handleUpdateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                       className="text-center h-9"
                     />
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleRemoveSet(exercise.id, set.id)}
                       disabled={exercise.sets.length <= 1}
                       className="h-9"
                     >
                       <Trash2 className="w-3 h-3" />
                     </Button>
                   </div>
                 ))}
              </div>

                             {/* Rest Time */}
               <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                 <div className="flex items-center justify-between">
                   <Label className="text-sm font-medium text-blue-900">Rest between sets:</Label>
                   <div className="flex items-center gap-2">
                     <Input
                       type="number"
                       min="0"
                       max="600"
                       value={exercise.restBetweenSets || 60}
                       onChange={(e) => {
                         const value = parseInt(e.target.value) || 60;
                         setWorkoutExercises(prev => prev.map(ex => 
                           ex.id === exercise.id ? { ...ex, restBetweenSets: value } : ex
                         ));
                       }}
                       className="w-20 text-center h-8"
                     />
                     <span className="text-sm text-blue-700 font-medium">seconds</span>
                   </div>
                 </div>
                 <div className="text-xs text-blue-600 mt-1">
                   Recommended: 60-120s for strength, 30-60s for endurance
                 </div>
               </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Exercise Button */}
        <Card className="glass-card border-dashed border-2 border-slate-600/50 hover:border-slate-500/70 transition-colors">
          <CardContent className="flex items-center justify-center py-8">
            <Button
              variant="ghost"
              onClick={() => setShowExerciseSelector(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Exercise
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:gap-3 sm:justify-end">
        <Button variant="outline" onClick={handleSaveWorkout} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          Save Workout
        </Button>
        <Button onClick={handleStartWorkout} className="w-full sm:w-auto">
          <Play className="w-4 h-4 mr-2" />
          Start Workout
        </Button>
      </div>

      {/* Exercise Selector Modal */}
      <Dialog open={showExerciseSelector} onOpenChange={setShowExerciseSelector}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Exercise to Workout</DialogTitle>
            <DialogDescription>
              Select an exercise from the library to add to your workout
            </DialogDescription>
          </DialogHeader>
          <ExerciseSelector
            onExerciseSelect={handleAddExercise}
            showMuscleGroups={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}; 