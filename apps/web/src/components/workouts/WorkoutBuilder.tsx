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

  // Calculate estimated workout duration
  const calculateDuration = useCallback(() => {
    return workoutExercises.reduce((total, exercise) => {
      const setTime = exercise.sets.length * 30; // Assume 30 seconds per set
      const restTime = (exercise.sets.length - 1) * (exercise.restBetweenSets || 60);
      return total + setTime + restTime;
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
      createdBy: initialWorkout?.createdBy, // Preserve existing createdBy for updates
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
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {workoutExercises.length} exercises
            </span>
            <span className="flex items-center gap-1">
              <Dumbbell className="w-3 h-3" />
              {workoutExercises.reduce((total, ex) => total + ex.sets.length, 0)} sets
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ~{Math.ceil(calculateDuration())} min
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <div className="space-y-4">
        {workoutExercises.map((exercise) => (
          <Card key={exercise.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex items-center gap-3 min-w-0">
                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg truncate">{exercise.exerciseName}</CardTitle>
                    <p className="text-sm text-gray-600">{exercise.sets.length} sets</p>
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
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-600 px-2">
                  <span>Set</span>
                  <span>Reps</span>
                  <span>Weight (lbs)</span>
                  <span>Actions</span>
                </div>
                {exercise.sets.map((set, setIndex) => (
                  <div key={set.id} className="grid grid-cols-4 gap-2 items-center">
                    <Badge variant="outline" className="justify-center w-fit">
                      {setIndex + 1}
                    </Badge>
                    <Input
                      type="number"
                      min="1"
                      max="999"
                      value={set.reps}
                      onChange={(e) => handleUpdateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 1)}
                      className="text-center"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="9999"
                      step="0.5"
                      value={set.weight || 0}
                      onChange={(e) => handleUpdateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                      className="text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveSet(exercise.id, set.id)}
                      disabled={exercise.sets.length <= 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Rest Time */}
              <div className="mt-4 flex items-center gap-2">
                <Label className="text-sm">Rest between sets:</Label>
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
                  className="w-20 text-center"
                />
                <span className="text-sm text-gray-600">seconds</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Exercise Button */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
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