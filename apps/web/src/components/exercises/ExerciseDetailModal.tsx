import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dumbbell, 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  Users, 
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';
import type { Exercise } from 'shared/data/exercise-types';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  isOpen,
  onClose
}) => {
  if (!exercise) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'push': return <Zap className="w-4 h-4" />;
      case 'pull': return <Target className="w-4 h-4" />;
      case 'legs': return <Dumbbell className="w-4 h-4" />;
      case 'core': return <Users className="w-4 h-4" />;
      case 'full-body': return <Users className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getCategoryIcon(exercise.category)}
              <div>
                <DialogTitle className="text-2xl font-bold text-left">
                  {exercise.name}
                </DialogTitle>
                <DialogDescription className="text-left mt-1">
                  {exercise.description}
                </DialogDescription>
              </div>
            </div>
            <Badge className={getDifficultyColor(exercise.difficulty)}>
              {exercise.difficulty}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  How to Perform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {exercise.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Tips */}
            {exercise.tips && exercise.tips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {exercise.tips.map((tip, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-yellow-500 mt-1">💡</span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Common Mistakes */}
            {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Common Mistakes to Avoid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {exercise.commonMistakes.map((mistake, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-red-500 mt-1">⚠️</span>
                        <span className="text-gray-700">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Variations */}
            {exercise.variations && exercise.variations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Variations & Progressions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {exercise.variations.map((variation, index) => (
                      <Badge key={index} variant="outline" className="justify-start p-2">
                        {variation}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Muscle Groups */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Muscle Groups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Primary Muscles</h4>
                  <div className="flex flex-wrap gap-1">
                    {exercise.primaryMuscles.map(muscle => (
                      <Badge key={muscle} className="bg-blue-100 text-blue-800 border-blue-200">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {exercise.secondaryMuscles.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Secondary Muscles</h4>
                    <div className="flex flex-wrap gap-1">
                      {exercise.secondaryMuscles.map(muscle => (
                        <Badge key={muscle} variant="outline" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Equipment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  Equipment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {exercise.equipment.map(eq => (
                    <Badge key={eq} variant="secondary" className="text-xs">
                      {eq.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Exercise Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Exercise Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Category</span>
                  <Badge variant="outline" className="capitalize">
                    {exercise.category}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Type</span>
                  <Badge variant="outline" className="capitalize">
                    {exercise.mechanic || 'compound'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Force</span>
                  <Badge variant="outline" className="capitalize">
                    {exercise.force || 'dynamic'}
                  </Badge>
                </div>

                {exercise.targetReps && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Target Reps</span>
                    <span className="text-sm font-medium">
                      {exercise.targetReps.min}-{exercise.targetReps.max}
                    </span>
                  </div>
                )}

                {exercise.targetSets && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Target Sets</span>
                    <span className="text-sm font-medium">
                      {exercise.targetSets.min}-{exercise.targetSets.max}
                    </span>
                  </div>
                )}

                {exercise.restTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Rest Time
                    </span>
                    <span className="text-sm font-medium">
                      {exercise.restTime.min}-{exercise.restTime.max}s
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {exercise.tags && exercise.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {exercise.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 