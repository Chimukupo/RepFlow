import React, { useState, useCallback } from 'react';
import { Dumbbell, Eye, Grid, LayoutGrid, Maximize2 } from 'lucide-react';
import { ExerciseSelector } from './ExerciseSelector';
import { MuscleVisualizerSimple } from './MuscleVisualizerSimple';
import type { Exercise } from 'shared/data/exercise-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ExerciseWorkspaceProps {
  initialLayout?: 'side-by-side' | 'stacked' | 'visualizer-focus';
  showLayoutControls?: boolean;
}

type LayoutMode = 'side-by-side' | 'stacked' | 'visualizer-focus' | 'selector-focus';

export const ExerciseWorkspace: React.FC<ExerciseWorkspaceProps> = ({
  initialLayout = 'side-by-side',
  showLayoutControls = true
}) => {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [layout, setLayout] = useState<LayoutMode>(initialLayout);

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

  // Get layout-specific classes
  const getLayoutClasses = () => {
    switch (layout) {
      case 'side-by-side':
        return {
          container: 'grid grid-cols-1 xl:grid-cols-2 gap-6',
          selectorWrapper: 'xl:max-h-[800px] xl:overflow-y-auto',
          visualizerWrapper: 'xl:sticky xl:top-6'
        };
      case 'stacked':
        return {
          container: 'space-y-6',
          selectorWrapper: '',
          visualizerWrapper: ''
        };
      case 'visualizer-focus':
        return {
          container: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
          selectorWrapper: 'lg:col-span-1 lg:max-h-[600px] lg:overflow-y-auto',
          visualizerWrapper: 'lg:col-span-2'
        };
      case 'selector-focus':
        return {
          container: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
          selectorWrapper: 'lg:col-span-2',
          visualizerWrapper: 'lg:col-span-1 lg:max-h-[600px] lg:overflow-y-auto'
        };
      default:
        return {
          container: 'grid grid-cols-1 xl:grid-cols-2 gap-6',
          selectorWrapper: '',
          visualizerWrapper: ''
        };
    }
  };

  const layoutClasses = getLayoutClasses();

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-primary" />
            Exercise & Muscle Visualization
          </h1>
          <p className="text-muted-foreground mt-2">
            Select exercises to see real-time muscle group visualization
          </p>
        </div>

        {/* Layout Controls */}
        {showLayoutControls && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Layout:</span>
            
            <Button
              variant={layout === 'side-by-side' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayout('side-by-side')}
              className="flex items-center gap-1"
            >
              <Grid className="w-4 h-4" />
              Side by Side
            </Button>
            
            <Button
              variant={layout === 'stacked' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayout('stacked')}
              className="flex items-center gap-1"
            >
              <LayoutGrid className="w-4 h-4" />
              Stacked
            </Button>
            
            <Button
              variant={layout === 'visualizer-focus' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayout('visualizer-focus')}
              className="flex items-center gap-1"
            >
              <Maximize2 className="w-4 h-4" />
              Visual Focus
            </Button>
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedExercises.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Selected Exercises ({selectedExercises.length}/5)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExercises.map(exercise => (
                    <Badge
                      key={exercise.id}
                      className="bg-blue-100 text-blue-800 border-blue-300 cursor-pointer hover:bg-blue-200"
                      onClick={() => removeExercise(exercise.id)}
                    >
                      {exercise.name} ×
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-700">
                  {selectedExercises.length === 5 && 'Max exercises reached'}
                </span>
                <Button
                  onClick={clearSelection}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className={layoutClasses.container}>
        {/* Exercise Selector */}
        <div className={layoutClasses.selectorWrapper}>
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Grid className="w-5 h-5" />
                Exercise Library
              </CardTitle>
              <CardDescription>
                Browse and select exercises to visualize targeted muscle groups
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ExerciseSelector
                onExerciseSelect={handleExerciseSelect}
                selectedExercises={selectedExercises}
                showMuscleGroups={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Muscle Visualizer */}
        <div className={layoutClasses.visualizerWrapper}>
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Muscle Visualization
              </CardTitle>
              <CardDescription>
                Real-time muscle group highlighting based on your exercise selection
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <MuscleVisualizerSimple
                selectedExercises={selectedExercises}
                onImageLoad={(imageUrl: string) => {
                  console.log('Muscle visualization loaded:', imageUrl);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats */}
      {selectedExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workout Summary</CardTitle>
            <CardDescription>Overview of your selected exercises</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{selectedExercises.length}</div>
                <div className="text-sm text-gray-600">Exercises</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {[...new Set(selectedExercises.flatMap(ex => ex.primaryMuscles))].length}
                </div>
                <div className="text-sm text-gray-600">Primary Muscles</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {[...new Set(selectedExercises.map(ex => ex.category))].length}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedExercises.filter(ex => ex.difficulty === 'beginner').length}/
                  {selectedExercises.filter(ex => ex.difficulty === 'intermediate').length}/
                  {selectedExercises.filter(ex => ex.difficulty === 'advanced').length}
                </div>
                <div className="text-sm text-gray-600">B/I/A Difficulty</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started Guide */}
      {selectedExercises.length === 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center max-w-2xl mx-auto">
              <div className="mb-4">
                <Dumbbell className="w-16 h-16 mx-auto text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to RepFlow's Exercise Visualizer!
              </h3>
              <p className="text-gray-600 mb-6">
                This is the spotlight feature of RepFlow. Select exercises from the library on the left 
                to see real-time muscle group visualization on the right. You can select up to 5 exercises 
                and customize the visualization colors and modes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Click exercises to select/deselect</span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Real-time muscle visualization</span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Customizable colors & modes</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 