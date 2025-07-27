import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Eye, EyeOff, Palette } from 'lucide-react';
import { useSingleColorImage, useBaseImage, useMuscleGroupUtils } from '@/hooks/useMuscleGroupAPI';
import type { Exercise } from 'shared/data/exercise-types';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MuscleVisualizerCleanProps {
  selectedExercises?: Exercise[];
  onImageLoad?: (imageUrl: string) => void;
}

export const MuscleVisualizerClean: React.FC<MuscleVisualizerCleanProps> = ({
  selectedExercises = [],
  onImageLoad
}) => {
  const [useBase, setUseBase] = useState(false); // Start with muscle highlighting

  const { getMuscleGroupsFromExercises } = useMuscleGroupUtils();

  // Helper function to convert binary data to data URL
  const processImageData = (data: unknown): string | null => {
    if (typeof data === 'string' && data.startsWith('�PNG')) {
      try {
        const base64 = btoa(data);
        return `data:image/png;base64,${base64}`;
      } catch (error) {
        console.error('Failed to convert binary data to base64:', error);
        return null;
      }
    }
    
    if (data && typeof data === 'object' && 'imageUrl' in data) {
      return (data as { imageUrl: string }).imageUrl;
    }
    
    return null;
  };

  // Get muscle groups from selected exercises using the proper mapping
  const exerciseNames = selectedExercises.map(ex => ex.name);
  const muscleGroups = getMuscleGroupsFromExercises(exerciseNames).slice(0, 5); // Allow more for clean version
  const muscleGroupsString = muscleGroups.join(',');

  // API hooks
  const baseImageQuery = useBaseImage({
    transparentBackground: '0'
  });

  const singleColorQuery = useSingleColorImage({
    muscleGroups: muscleGroupsString,
    color: '220,38,38' // RGB format for red color
  });

  const currentQuery = useBase ? baseImageQuery : singleColorQuery;

  // Handle image load callback
  useEffect(() => {
    const imageUrl = processImageData(currentQuery.data);
    if (imageUrl && onImageLoad) {
      onImageLoad(imageUrl);
    }
  }, [currentQuery.data, onImageLoad]);

  const toggleMode = () => {
    setUseBase(!useBase);
  };

  const refreshImage = () => {
    currentQuery.refetch();
  };

  return (
    <div className="w-full space-y-4">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Muscle Visualization</h3>
          <p className="text-muted-foreground mt-1">
            {selectedExercises.length > 0 
              ? `Showing ${muscleGroups.length} muscle groups from ${selectedExercises.length} exercise${selectedExercises.length > 1 ? 's' : ''}`
              : 'Select exercises to see muscle group visualization'
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={toggleMode}
            variant={useBase ? "outline" : "default"}
            size="sm"
            disabled={currentQuery.isLoading || selectedExercises.length === 0}
            className="flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            {useBase ? "Show Muscles" : "Hide Muscles"}
          </Button>
          
          <Button
            onClick={refreshImage}
            variant="outline"
            size="sm"
            disabled={currentQuery.isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${currentQuery.isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Selected Exercises Summary - Streamlined */}
      {selectedExercises.length > 0 && (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-white/20 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm font-semibold text-foreground">Selected Exercises ({selectedExercises.length})</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedExercises.slice(0, 3).map(exercise => (
                  <Badge key={exercise.name} variant="secondary" className="text-xs font-medium">
                    {exercise.name}
                  </Badge>
                ))}
                {selectedExercises.length > 3 && (
                  <Badge variant="secondary" className="text-xs font-medium opacity-75">
                    +{selectedExercises.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            
            {muscleGroups.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <p className="text-sm font-semibold text-foreground">Target Muscles ({muscleGroups.length})</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {muscleGroups.slice(0, 5).map((muscle, index) => (
                    <Badge key={`${muscle}-${index}`} className="text-xs font-medium bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-200 dark:border-red-800">
                      {muscle}
                    </Badge>
                  ))}
                  {muscleGroups.length > 5 && (
                    <Badge className="text-xs font-medium bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-200 dark:border-red-800 opacity-75">
                      +{muscleGroups.length - 5}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Visualization - Large and Prominent */}
      <div className="relative bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm rounded-2xl min-h-[600px] flex items-center justify-center overflow-hidden border border-white/20 shadow-2xl">
            {/* Loading State */}
            {currentQuery.isLoading && (
              <div className="flex flex-col items-center gap-6">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">Generating Visualization</p>
                  <p className="text-muted-foreground">This may take a few seconds...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {currentQuery.error && !currentQuery.isLoading && (
              <div className="text-center py-12">
                <div className="text-red-500 mb-6">
                  <EyeOff className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Visualization Error</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Unable to generate muscle visualization. Please try again.
                </p>
                <Button onClick={refreshImage} variant="outline" size="lg">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {/* No Exercises Selected */}
            {selectedExercises.length === 0 && !currentQuery.isLoading && !currentQuery.error && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-6">
                  <Eye className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Select Exercises</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Choose exercises from the library to see which muscles they target with our interactive visualization
                </p>
              </div>
            )}

            {/* Success State - Show Image */}
            {currentQuery.data && !currentQuery.isLoading && (() => {
              const imageUrl = processImageData(currentQuery.data);
              return imageUrl ? (
                <div className="w-full max-w-2xl mx-auto">
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Muscle group visualization"
                      className="w-full h-auto rounded-lg shadow-lg"
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                      }}
                      onLoad={() => {
                        // Image loaded successfully
                      }}
                    />
                    
                    {/* Image Overlay Info */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              {useBase ? 'Base Anatomy' : `${muscleGroups.length} Muscle Groups Highlighted`}
                            </p>
                            <p className="text-xs opacity-80">
                              {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''} selected
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs opacity-80">Real-time visualization</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
        </div>
    </div>
  );
}; 