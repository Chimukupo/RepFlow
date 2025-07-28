import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Palette, Eye, EyeOff, Download, Info } from 'lucide-react';
import { 
  useSingleColorImage, 
  useMultiColorImage, 
  useBaseImage,
  useMuscleGroupErrorHandler,
  useMuscleGroupUtils 
} from '@/hooks/useMuscleGroupAPI';
import type { Exercise } from 'shared/data/exercise-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MuscleVisualizerProps {
  selectedExercises?: Exercise[];
  visualizationMode?: 'single' | 'multi' | 'base';
  primaryColor?: string;
  secondaryColor?: string;
  showControls?: boolean;
  onImageLoad?: (imageUrl: string) => void;
}

interface ColorOption {
  name: string;
  primary: string;
  secondary?: string;
  description: string;
}

const COLOR_PRESETS: ColorOption[] = [
  { name: 'Classic Red', primary: '#DC2626', secondary: '#FCA5A5', description: 'Traditional muscle highlighting' },
  { name: 'Electric Blue', primary: '#2563EB', secondary: '#93C5FD', description: 'Modern and vibrant' },
  { name: 'Forest Green', primary: '#059669', secondary: '#6EE7B7', description: 'Natural and calming' },
  { name: 'Sunset Orange', primary: '#EA580C', secondary: '#FED7AA', description: 'Warm and energetic' },
  { name: 'Royal Purple', primary: '#7C3AED', secondary: '#C4B5FD', description: 'Premium and elegant' },
];

export const MuscleVisualizer: React.FC<MuscleVisualizerProps> = ({
  selectedExercises = [],
  visualizationMode = 'multi',
  primaryColor = '#DC2626',
  secondaryColor = '#FCA5A5',
  showControls = true,
  onImageLoad
}) => {
  const [currentMode, setCurrentMode] = useState(visualizationMode);
  const [colors, setColors] = useState({ primary: primaryColor, secondary: secondaryColor });
  const [showImageControls, setShowImageControls] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { getMuscleGroupsFromExercises } = useMuscleGroupUtils();
  const { handleError } = useMuscleGroupErrorHandler();

  // Get muscle groups from selected exercises
  const muscleGroups = getMuscleGroupsFromExercises(selectedExercises.map(ex => ex.name));
  const primaryMuscles = selectedExercises.flatMap(ex => ex.primaryMuscles);
  const secondaryMuscles = selectedExercises.flatMap(ex => ex.secondaryMuscles);

  // API hooks for different visualization modes
  const baseImageQuery = useBaseImage();
  
  const singleColorQuery = useSingleColorImage({
    muscleGroups: muscleGroups.join(','),
    color: colors.primary
  });

  const multiColorQuery = useMultiColorImage({
    primaryMuscleGroups: muscleGroups.join(','),
    secondaryMuscleGroups: muscleGroups.join(','),
    primaryColor: colors.primary,
    secondaryColor: colors.secondary
  });

  // Determine which query to use based on mode
  const getCurrentQuery = () => {
    switch (currentMode) {
      case 'single': return singleColorQuery;
      case 'multi': return multiColorQuery;
      case 'base': return baseImageQuery;
      default: return baseImageQuery;
    }
  };

  const currentQuery = getCurrentQuery();

  // Handle image load callback
  useEffect(() => {
    if (currentQuery.data?.imageUrl && onImageLoad) {
      onImageLoad(currentQuery.data.imageUrl);
    }
  }, [currentQuery.data?.imageUrl, onImageLoad]);

  // Handle errors
  useEffect(() => {
    if (currentQuery.error) {
      setError(handleError(currentQuery.error));
    } else {
      setError(null);
    }
  }, [currentQuery.error, handleError]);

  const handleColorPresetChange = (preset: ColorOption, index: number) => {
    setColors({
      primary: preset.primary,
      secondary: preset.secondary || preset.primary
    });
    setSelectedPreset(index);
  };

  const handleModeChange = (mode: 'single' | 'multi' | 'base') => {
    setCurrentMode(mode);
    setError(null);
  };

  const downloadImage = () => {
    if (currentQuery.data?.imageUrl) {
      const link = document.createElement('a');
      link.href = currentQuery.data.imageUrl;
      link.download = `muscle-visualization-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const refreshImage = () => {
    currentQuery.refetch();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Muscle Visualization</h3>
          <p className="text-gray-600 mt-1">
            {selectedExercises.length > 0 
              ? `Showing ${muscleGroups.length} muscle groups from ${selectedExercises.length} exercise${selectedExercises.length > 1 ? 's' : ''}`
              : 'Select exercises to see muscle group visualization'
            }
          </p>
        </div>

        {showControls && (
          <Button
            onClick={() => setShowImageControls(!showImageControls)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            {showImageControls ? 'Hide Controls' : 'Show Controls'}
          </Button>
        )}
      </div>

      {/* Controls Panel */}
      {showControls && showImageControls && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Visualization Controls
            </CardTitle>
            <CardDescription>Customize how your muscle groups are displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Visualization Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant={currentMode === 'base' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('base')}
                  className="flex items-center gap-2 h-auto p-4"
                >
                  <Eye className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Base</div>
                    <div className="text-xs opacity-75">Clean anatomy view</div>
                  </div>
                </Button>
                
                <Button
                  variant={currentMode === 'single' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('single')}
                  className="flex items-center gap-2 h-auto p-4"
                  disabled={muscleGroups.length === 0}
                >
                  <Palette className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Single Color</div>
                    <div className="text-xs opacity-75">Uniform highlighting</div>
                  </div>
                </Button>
                
                <Button
                  variant={currentMode === 'multi' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('multi')}
                  className="flex items-center gap-2 h-auto p-4"
                  disabled={muscleGroups.length === 0}
                >
                  <Palette className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Multi Color</div>
                    <div className="text-xs opacity-75">Primary & secondary</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Color Presets */}
            {currentMode !== 'base' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Color Presets</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {COLOR_PRESETS.map((preset, index) => (
                    <Button
                      key={preset.name}
                      variant={selectedPreset === index ? 'default' : 'outline'}
                      onClick={() => handleColorPresetChange(preset, index)}
                      className="flex items-center gap-3 h-auto p-3 justify-start"
                    >
                      <div className="flex gap-1">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: preset.primary }}
                        />
                        {preset.secondary && (
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: preset.secondary }}
                          />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{preset.name}</div>
                        <div className="text-xs opacity-75">{preset.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Muscle Groups Info */}
      {selectedExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5" />
              Targeted Muscle Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Primary Muscles</h4>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(primaryMuscles)].map(muscle => (
                    <Badge key={muscle} className="bg-red-100 text-red-800 border-red-200">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Secondary Muscles</h4>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(secondaryMuscles)].map(muscle => (
                    <Badge key={muscle} variant="outline" className="border-orange-200 text-orange-700">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Visualization */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {currentMode === 'base' ? 'Base Anatomy' : 
               currentMode === 'single' ? 'Single Color Visualization' : 
               'Multi-Color Visualization'}
            </CardTitle>
            
            {currentQuery.data && (
              <div className="flex gap-2">
                <Button
                  onClick={refreshImage}
                  variant="outline"
                  size="sm"
                  disabled={currentQuery.isFetching}
                >
                  <RefreshCw className={`w-4 h-4 ${currentQuery.isFetching ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  onClick={downloadImage}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-50 rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
            {/* Loading State */}
            {currentQuery.isFetching && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-gray-600">Generating muscle visualization...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                  <EyeOff className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Visualization Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={refreshImage} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {/* No Exercises Selected */}
            {selectedExercises.length === 0 && !currentQuery.isFetching && !error && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <Eye className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Exercises</h3>
                <p className="text-gray-600">
                  Choose exercises from the library to see muscle group visualization
                </p>
              </div>
            )}

            {/* Success State - Show Image */}
            {currentQuery.data?.imageUrl && !currentQuery.isFetching && (
              <div className="w-full max-w-2xl mx-auto">
                <img
                  src={currentQuery.data.imageUrl}
                  alt="Muscle group visualization"
                  className="w-full h-auto rounded-lg shadow-sm"
                  onError={() => setError('Failed to load muscle visualization image')}
                />
                
                {/* Image Info */}
                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>Generated with {muscleGroups.length} muscle groups</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 