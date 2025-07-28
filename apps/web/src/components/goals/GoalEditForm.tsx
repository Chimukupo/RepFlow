import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  AlertCircle,
  Save
} from 'lucide-react';
import { useUpdateGoal } from '@/hooks/useGoals';
import type { Goal, GoalPriority, GoalStatus } from 'shared/schemas/goal';

interface GoalEditFormProps {
  goal: Goal;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  priority: GoalPriority;
  status: GoalStatus;
  target_value: string;
  unit: string;
}

export const GoalEditForm: React.FC<GoalEditFormProps> = ({ goal, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    title: goal.title,
    description: goal.description || '',
    priority: goal.priority,
    status: goal.status,
    target_value: goal.target_value.toString(),
    unit: goal.unit
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateGoalMutation = useUpdateGoal();

  // Update form field
  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    } else if (formData.title.length < 2) {
      newErrors.title = 'Goal title must be at least 2 characters';
    }

    if (!formData.target_value.trim()) {
      newErrors.target_value = 'Target value is required';
    } else if (isNaN(Number(formData.target_value)) || Number(formData.target_value) <= 0) {
      newErrors.target_value = 'Target value must be a positive number';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await updateGoalMutation.mutateAsync({
        goalId: goal.id,
        updates: {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          priority: formData.priority,
          status: formData.status,
          target_value: Number(formData.target_value),
          unit: formData.unit.trim()
        }
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-blue-600" />
            Edit Goal
          </DialogTitle>
          <DialogDescription>
            Modify your goal details and settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Goal Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Bench Press 200 lbs"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your goal..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Target Value and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_value">Target Value *</Label>
              <Input
                id="target_value"
                type="number"
                min="0"
                step="0.1"
                value={formData.target_value}
                onChange={(e) => updateField('target_value', e.target.value)}
                className={errors.target_value ? 'border-red-500' : ''}
              />
              {errors.target_value && (
                <p className="text-sm text-red-600 mt-1">{errors.target_value}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => updateField('unit', e.target.value)}
                placeholder="e.g., lbs, reps"
                className={errors.unit ? 'border-red-500' : ''}
              />
              {errors.unit && (
                <p className="text-sm text-red-600 mt-1">{errors.unit}</p>
              )}
            </div>
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => updateField('priority', value)}>
                <SelectTrigger>
                  <SelectValue>
                    <Badge className={getPriorityColor(formData.priority)}>
                      {formData.priority}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <Badge className="bg-gray-100 text-gray-800">Low</Badge>
                  </SelectItem>
                  <SelectItem value="medium">
                    <Badge className="bg-blue-100 text-blue-800">Medium</Badge>
                  </SelectItem>
                  <SelectItem value="high">
                    <Badge className="bg-orange-100 text-orange-800">High</Badge>
                  </SelectItem>
                  <SelectItem value="critical">
                    <Badge className="bg-red-100 text-red-800">Critical</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
                <SelectTrigger>
                  <SelectValue>
                    <Badge className={getStatusColor(formData.status)}>
                      {formData.status}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </SelectItem>
                  <SelectItem value="paused">
                    <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
                  </SelectItem>
                  <SelectItem value="completed">
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Progress Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Current Progress</span>
              <span className="text-sm font-bold text-gray-900">{goal.progress_percentage}%</span>
            </div>
            <div className="text-sm text-gray-600">
              {goal.current_value} / {formData.target_value} {formData.unit}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use "Update Progress" to change your current value
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateGoalMutation.isPending}
              className="gap-2"
            >
              {updateGoalMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 