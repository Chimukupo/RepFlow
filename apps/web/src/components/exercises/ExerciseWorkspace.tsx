import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { ExerciseSelector } from './ExerciseSelector';
import { MuscleVisualizerClean } from './MuscleVisualizerClean';
import type { Exercise } from 'shared/data/exercise-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ExerciseWorkspace: React.FC = () => {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  // Handle exercise selection with multi-select support
  const handleExerciseSelect = useCallback((exercise: Exercise) => {
    setSelectedExercises(prev => {
      const isAlreadySelected = prev.some(ex => ex.id === exercise.id);
      
      if (isAlreadySelected) {
        // Remove if already selected
        return prev.filter(ex => ex.id !== exercise.id);
      } else {
        // Add to selection (max 5 exercises for performance)
        if (prev.length >= 5) {
          // Replace oldest selection
          return [...prev.slice(1), exercise];
        }
        return [...prev, exercise];
      }
    });
  }, []);

  const clearSelection = () => {
    setSelectedExercises([]);
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  return (
    <div className="space-y-6">
      {/* Exercise Selector */}
      <div>
        <ExerciseSelector
          onExerciseSelect={handleExerciseSelect}
          selectedExercises={selectedExercises}
          multiSelect={true}
          showMuscleGroups={true}
        />
      </div>

      {/* Selected Exercises Summary */}
      {selectedExercises.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">
                Selected Exercises ({selectedExercises.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedExercises.map((exercise) => (
                <Badge
                  key={exercise.id}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1 text-sm"
                >
                  {exercise.name}
                  <button
                    onClick={() => removeExercise(exercise.id)}
                    className="ml-1 hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Muscle Visualization */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            Muscle Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MuscleVisualizerClean selectedExercises={selectedExercises} />
        </CardContent>
      </Card>
    </div>
  );
}; 