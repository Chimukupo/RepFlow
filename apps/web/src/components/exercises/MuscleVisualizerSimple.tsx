import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useSingleColorImage, useBaseImage, useMuscleGroupUtils } from '@/hooks/useMuscleGroupAPI';
import type { Exercise } from 'shared/data/exercise-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MuscleVisualizerSimpleProps {
  selectedExercises?: Exercise[];
  onImageLoad?: (imageUrl: string) => void;
}

export const MuscleVisualizerSimple: React.FC<MuscleVisualizerSimpleProps> = ({
  selectedExercises = [],
  onImageLoad
}) => {
  const [showDebug, setShowDebug] = useState(true);
  const [useBase, setUseBase] = useState(true);

  // Helper function to convert binary data to data URL
  const processImageData = (data: unknown): string | null => {
    if (typeof data === 'string' && data.startsWith('�PNG')) {
      // Convert binary string to base64
      try {
        const base64 = btoa(data);
        return `data:image/png;base64,${base64}`;
      } catch (error) {
        console.error('Failed to convert binary data to base64:', error);
        return null;
      }
    }
    
    // If it's already a proper response object
    if (data && typeof data === 'object' && 'imageUrl' in data) {
      return (data as { imageUrl: string }).imageUrl;
    }
    
    return null;
  };

  const { getMuscleGroupsFromExercises } = useMuscleGroupUtils();

  // Get muscle groups from selected exercises using the proper mapping
  const exerciseNames = selectedExercises.map(ex => ex.name);
  const muscleGroups = getMuscleGroupsFromExercises(exerciseNames).slice(0, 3); // Limit for testing
  const muscleGroupsString = muscleGroups.join(',');

  // API hooks - start with base image for testing
  const baseImageQuery = useBaseImage({
    transparentBackground: '0'
  });

  const singleColorQuery = useSingleColorImage({
    muscleGroups: muscleGroupsString,
    color: '220,38,38' // RGB format for red color
  });

  const currentQuery = useBase ? baseImageQuery : singleColorQuery;

  console.log('MuscleVisualizerSimple Debug:', {
    selectedExercises: selectedExercises.length,
    exerciseNames,
    muscleGroups,
    muscleGroupsString,
    queryData: currentQuery.data,
    queryError: currentQuery.error,
    useBase
  });

  // Handle image load callback
  useEffect(() => {
    if (currentQuery.data?.imageUrl && onImageLoad) {
      onImageLoad(currentQuery.data.imageUrl);
    }
  }, [currentQuery.data?.imageUrl, onImageLoad]);

  const toggleMode = () => {
    setUseBase(!useBase);
  };

  const refreshImage = () => {
    currentQuery.refetch();
  };

  return (
    <div className="w-full space-y-4">
      {/* Debug Info */}
      {showDebug && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Debug Info
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDebug(false)}
                className="ml-auto text-yellow-600 hover:text-yellow-800"
              >
                Hide
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-yellow-700">
            <div className="space-y-1">
              <p><strong>Selected Exercises:</strong> {selectedExercises.length}</p>
              <p><strong>Exercise Names:</strong> {exerciseNames.join(', ') || 'None'}</p>
              <p><strong>Muscle Groups:</strong> {muscleGroups.join(', ') || 'None'}</p>
              <p><strong>Current Mode:</strong> {useBase ? 'Base Image' : 'Single Color'}</p>
              <p><strong>Query Status:</strong> {currentQuery.isLoading ? 'Loading...' : currentQuery.error ? 'Error' : currentQuery.data ? 'Success' : 'Idle'}</p>
              {currentQuery.error && (
                <p><strong>Error:</strong> {String(currentQuery.error)}</p>
              )}
              {currentQuery.data && (
                <div>
                  <p><strong>Image URL:</strong> {currentQuery.data.imageUrl ? 'Available' : 'Missing'}</p>
                  <p><strong>Raw Response:</strong> {JSON.stringify(currentQuery.data, null, 2)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Exercises Summary */}
      {selectedExercises.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Selected Exercises ({selectedExercises.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {selectedExercises.slice(0, 5).map(exercise => (
                <Badge key={exercise.name} variant="outline" className="text-xs">
                  {exercise.name}
                </Badge>
              ))}
              {selectedExercises.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedExercises.length - 5} more
                </Badge>
              )}
            </div>
            {muscleGroups.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Mapped Muscle Groups:</p>
                <div className="flex flex-wrap gap-1">
                  {muscleGroups.map((muscle, index) => (
                    <Badge key={`${muscle}-${index}`} className="text-xs bg-red-100 text-red-800">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card className="glass-card">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={toggleMode}
              variant={useBase ? "default" : "outline"}
              size="sm"
              disabled={currentQuery.isLoading}
            >
              {useBase ? "Base Image" : "Muscle Highlight"}
            </Button>
            
            <Button
              onClick={refreshImage}
              variant="outline"
              size="sm"
              disabled={currentQuery.isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${currentQuery.isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {!showDebug && (
              <Button
                onClick={() => setShowDebug(true)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Show Debug
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Visualization */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            {useBase ? 'Base Anatomy' : 'Muscle Highlighting'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg min-h-[300px] flex items-center justify-center">
            {/* Loading State */}
            {currentQuery.isLoading && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading muscle visualization...</p>
              </div>
            )}

            {/* Error State */}
            {currentQuery.error && !currentQuery.isLoading && (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                  <EyeOff className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Failed to Load</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  {String(currentQuery.error)}
                </p>
                <Button onClick={refreshImage} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {/* No Exercises Selected */}
            {selectedExercises.length === 0 && !currentQuery.isLoading && !currentQuery.error && (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  <Eye className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Select Exercises</h3>
                <p className="text-muted-foreground">
                  Choose exercises from the library to see muscle visualization
                </p>
              </div>
            )}

            {/* Success State - Show Image */}
            {currentQuery.data && !currentQuery.isLoading && (() => {
              const imageUrl = processImageData(currentQuery.data);
              return imageUrl ? (
                <div className="w-full max-w-lg mx-auto">
                  <img
                    src={imageUrl}
                    alt="Muscle visualization"
                    className="w-full h-auto rounded-lg shadow-sm"
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', imageUrl);
                    }}
                  />
                  
                  <div className="mt-2 text-center text-xs text-muted-foreground">
                    <p>Mode: {useBase ? 'Base anatomy' : `Highlighting ${muscleGroups.length} muscle groups`}</p>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 