import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  AlertCircle,
  Trophy,
  Calendar
} from 'lucide-react';
import { useUpdateGoalProgress } from '@/hooks/useGoals';
import type { Goal } from 'shared/schemas/goal';
import { calculateGoalProgress } from 'shared/schemas/goal';

interface GoalProgressTrackerProps {
  goal: Goal;
  onClose: () => void;
  onSuccess: () => void;
}

export const GoalProgressTracker: React.FC<GoalProgressTrackerProps> = ({ 
  goal, 
  onClose, 
  onSuccess 
}) => {
  const [newValue, setNewValue] = useState(goal.current_value.toString());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const updateProgressMutation = useUpdateGoalProgress();

  // Calculate progress for the new value
  const calculatedProgress = newValue ? calculateGoalProgress(Number(newValue), goal.target_value) : goal.progress_percentage;
  const progressDifference = calculatedProgress - goal.progress_percentage;
  const isImprovement = progressDifference > 0;
  const isComplete = calculatedProgress >= 100;

  // Validate input
  const validateInput = (): boolean => {
    if (!newValue.trim()) {
      setError('Please enter a value');
      return false;
    }

    const numValue = Number(newValue);
    if (isNaN(numValue) || numValue < 0) {
      setError('Value must be a non-negative number');
      return false;
    }

    if (numValue < goal.current_value) {
      setError('New value should be greater than or equal to current value');
      return false;
    }

    setError('');
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInput()) return;

    try {
      await updateProgressMutation.mutateAsync({
        goalId: goal.id,
        newValue: Number(newValue)
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating goal progress:', error);
      setError('Failed to update progress. Please try again.');
    }
  };



  // Get days until deadline
  const getDaysUntilDeadline = () => {
    const today = new Date();
    const deadline = new Date(goal.target_date);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilDeadline();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Update Progress
          </DialogTitle>
          <DialogDescription>
            Update your progress toward "{goal.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Goal Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">{goal.title}</h3>
              <Badge className={`${
                goal.priority === 'critical' ? 'bg-red-100 text-red-800' :
                goal.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                goal.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {goal.priority}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Progress</span>
                <span className="font-medium">{goal.progress_percentage}%</span>
              </div>
              <Progress value={goal.progress_percentage} className="h-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Update Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="newValue">New Value *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="newValue"
                  type="number"
                  min="0"
                  step="0.1"
                  value={newValue}
                  onChange={(e) => {
                    setNewValue(e.target.value);
                    setError('');
                  }}
                  placeholder={`Current: ${goal.current_value}`}
                  className={error ? 'border-red-500' : ''}
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {goal.unit}
                </span>
              </div>
              {error && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}
            </div>

            {/* Progress Preview */}
            {newValue && !error && Number(newValue) !== goal.current_value && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Progress Preview</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600">New Progress</span>
                    <span className="font-medium text-blue-900">{calculatedProgress}%</span>
                  </div>
                  <Progress value={calculatedProgress} className="h-2" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-600">
                      {newValue} / {goal.target_value} {goal.unit}
                    </span>
                    <div className="flex items-center gap-1">
                      {isImprovement ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +{progressDifference}%
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                          No change
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {isComplete && (
                  <div className="flex items-center gap-2 text-green-700 bg-green-100 rounded-md p-2">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Congratulations! You'll complete this goal! 🎉
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Optional Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your progress..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateProgressMutation.isPending || !newValue || !!error}
                className={`gap-2 ${isComplete ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                {updateProgressMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Updating...
                  </>
                ) : isComplete ? (
                  <>
                    <Trophy className="w-4 h-4" />
                    Complete Goal!
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    Update Progress
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 