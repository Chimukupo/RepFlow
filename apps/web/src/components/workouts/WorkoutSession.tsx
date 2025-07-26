import React, { useState, useCallback } from 'react';
import { CheckCircle, Circle, ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { WorkoutTimer } from './WorkoutTimer';
import type { Workout, WorkoutExercise, WorkoutSet } from 'shared/schemas/workout';

interface WorkoutSessionProps {
  workout: Workout;
  onComplete?: (sessionData: any) => void;
  onExit?: () => void;
}

export const WorkoutSession: React.FC<WorkoutSessionProps> = ({
  workout,
  onComplete,
  onExit
}) => {
  const [sessionExercises, setSessionExercises] = useState<WorkoutExercise[]>(
    workout.exercises.map(exercise => ({
      ...exercise,
      sets: exercise.sets.map(set => ({ ...set, completed: false }))
    }))
  );
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [sessionNotes, setSessionNotes] = useState('');

  const currentExercise = sessionExercises[currentExerciseIndex];
  const totalSets = sessionExercises.reduce((total, ex) => total + ex.sets.length, 0);
  const completedSets = sessionExercises.reduce((total, ex) => 
    total + ex.sets.filter(set => set.completed).length, 0
  );

  // Update set completion
  const handleSetComplete = useCallback((exerciseIndex: number, setIndex: number) => {
    setSessionExercises(prev => prev.map((exercise, exIndex) => {
      if (exIndex === exerciseIndex) {
        return {
          ...exercise,
          sets: exercise.sets.map((set, sIndex) => {
            if (sIndex === setIndex) {
              return { ...set, completed: !set.completed };
            }
            return set;
          })
        };
      }
      return exercise;
    }));
  }, []);

  // Update set values during workout
  const handleSetValueChange = useCallback((
    exerciseIndex: number, 
    setIndex: number, 
    field: keyof WorkoutSet, 
    value: any
  ) => {
    setSessionExercises(prev => prev.map((exercise, exIndex) => {
      if (exIndex === exerciseIndex) {
        return {
          ...exercise,
          sets: exercise.sets.map((set, sIndex) => {
            if (sIndex === setIndex) {
              return { ...set, [field]: value };
            }
            return set;
          })
        };
      }
      return exercise;
    }));
  }, []);

  // Navigate between exercises
  const handlePreviousExercise = useCallback(() => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  }, [currentExerciseIndex]);

  const handleNextExercise = useCallback(() => {
    if (currentExerciseIndex < sessionExercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  }, [currentExerciseIndex, sessionExercises.length]);

  // Start workout
  const handleStartWorkout = useCallback(() => {
    setIsTimerActive(true);
  }, []);

  // Complete workout
  const handleCompleteWorkout = useCallback(() => {
    const sessionData = {
      workoutId: workout.id,
      workoutName: workout.name,
      startTime: sessionStartTime,
      endTime: new Date(),
      exercises: sessionExercises,
      notes: sessionNotes,
      completed: true
    };
    
    setIsTimerActive(false);
    onComplete?.(sessionData);
  }, [workout, sessionStartTime, sessionExercises, sessionNotes, onComplete]);

  // Exit workout
  const handleExitWorkout = useCallback(() => {
    if (completedSets > 0) {
      const confirmed = confirm('You have completed some sets. Are you sure you want to exit without saving?');
      if (!confirmed) return;
    }
    
    setIsTimerActive(false);
    onExit?.();
  }, [completedSets, onExit]);

  const progressPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <Button variant="outline" onClick={handleExitWorkout} size="sm" className="self-start">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{workout.name}</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {completedSets} of {totalSets} sets completed ({Math.round(progressPercentage)}%)
            </p>
          </div>
        </div>
        
        <div className="flex justify-center lg:justify-end">
          <WorkoutTimer 
            isActive={isTimerActive}
            onStart={handleStartWorkout}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Current Exercise */}
      {currentExercise && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{currentExercise.exerciseName}</CardTitle>
                <p className="text-gray-600">
                  Exercise {currentExerciseIndex + 1} of {sessionExercises.length}
                </p>
              </div>
              <Badge variant="outline">
                {currentExercise.sets.filter(set => set.completed).length} / {currentExercise.sets.length} sets
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sets */}
            <div className="space-y-3">
              {currentExercise.sets.map((set, setIndex) => (
                <div key={set.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <button
                      onClick={() => handleSetComplete(currentExerciseIndex, setIndex)}
                      className="flex-shrink-0"
                    >
                      {set.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                    
                    <Badge variant="outline" className="text-xs">Set {setIndex + 1}</Badge>
                  </div>
                  
                  <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 sm:ml-9">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium min-w-0">Reps:</label>
                      <Input
                        type="number"
                        value={set.reps}
                        onChange={(e) => handleSetValueChange(
                          currentExerciseIndex, 
                          setIndex, 
                          'reps', 
                          parseInt(e.target.value) || 0
                        )}
                        className="w-16 text-center"
                        min="0"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium min-w-0">Weight:</label>
                      <Input
                        type="number"
                        value={set.weight || 0}
                        onChange={(e) => handleSetValueChange(
                          currentExerciseIndex, 
                          setIndex, 
                          'weight', 
                          parseFloat(e.target.value) || 0
                        )}
                        className="w-20 text-center"
                        min="0"
                        step="0.5"
                      />
                      <span className="text-sm text-gray-500">lbs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rest Timer Info */}
            {currentExercise.restBetweenSets && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                💡 Recommended rest between sets: {currentExercise.restBetweenSets} seconds
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0 pt-4">
              <Button
                variant="outline"
                onClick={handlePreviousExercise}
                disabled={currentExerciseIndex === 0}
                size="sm"
                className="w-full sm:w-auto"
              >
                Previous Exercise
              </Button>
              
              {currentExerciseIndex === sessionExercises.length - 1 ? (
                <Button
                  onClick={handleCompleteWorkout}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Complete Workout
                </Button>
              ) : (
                <Button
                  onClick={handleNextExercise}
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  Next Exercise
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            placeholder="Add notes about your workout session..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="w-full p-3 border rounded-lg resize-none"
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  );
}; 