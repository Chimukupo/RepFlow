import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  Target, 
  Dumbbell, 
  Activity, 
  TrendingUp, 
  Zap, 
  Trophy, 
  Flag,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useCreateGoal } from '@/hooks/useGoals';
import { EXERCISES } from 'shared/data/exercises';
import type { GoalCreateData, GoalCategory, GoalType, GoalPriority } from 'shared/schemas/goal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface GoalCreateFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  category: GoalCategory | '';
  type: GoalType | '';
  priority: GoalPriority;
  target_value: string;
  current_value: string;
  unit: string;
  target_date: Date | undefined;
  related_exercise: string;
  is_public: boolean;
  reminder_frequency: 'daily' | 'weekly' | 'monthly' | 'none';
}

const initialFormData: FormData = {
  title: '',
  description: '',
  category: '',
  type: '',
  priority: 'medium',
  target_value: '',
  current_value: '',
  unit: '',
  target_date: undefined,
  related_exercise: '',
  is_public: false,
  reminder_frequency: 'weekly'
};

export const GoalCreateForm: React.FC<GoalCreateFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const createGoalMutation = useCreateGoal();

  // Get category icon
  const getCategoryIcon = (category: GoalCategory) => {
    switch (category) {
      case 'strength': return <Dumbbell className="w-4 h-4" />;
      case 'endurance': return <Activity className="w-4 h-4" />;
      case 'weight_loss': return <TrendingUp className="w-4 h-4" />;
      case 'muscle_gain': return <Zap className="w-4 h-4" />;
      case 'flexibility': return <Target className="w-4 h-4" />;
      case 'general_fitness': return <Trophy className="w-4 h-4" />;
      case 'sport_specific': return <Flag className="w-4 h-4" />;
      case 'rehabilitation': return <Target className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  // Get suggested units based on goal type
  const getSuggestedUnits = (type: GoalType) => {
    switch (type) {
      case 'weight_target': return ['lbs', 'kg'];
      case 'rep_target': return ['reps', 'sets'];
      case 'duration_target': return ['minutes', 'hours', 'seconds'];
      case 'frequency_target': return ['times/week', 'times/month', 'days/week'];
      case 'body_weight': return ['lbs', 'kg'];
      case 'body_fat': return ['%'];
      case 'distance': return ['miles', 'km', 'meters'];
      case 'custom': return ['units', 'points', 'times'];
      default: return ['units'];
    }
  };

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

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.type) {
      newErrors.type = 'Please select a goal type';
    }

    if (!formData.target_value.trim()) {
      newErrors.target_value = 'Target value is required';
    } else if (isNaN(Number(formData.target_value)) || Number(formData.target_value) <= 0) {
      newErrors.target_value = 'Target value must be a positive number';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.target_date) {
      newErrors.target_date = 'Target date is required';
    } else if (formData.target_date <= new Date()) {
      newErrors.target_date = 'Target date must be in the future';
    }

    if (formData.current_value.trim() && (isNaN(Number(formData.current_value)) || Number(formData.current_value) < 0)) {
      newErrors.current_value = 'Current value must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const goalData: GoalCreateData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category as GoalCategory,
        type: formData.type as GoalType,
        priority: formData.priority,
        target_value: Number(formData.target_value),
        current_value: formData.current_value ? Number(formData.current_value) : 0,
        unit: formData.unit.trim(),
        target_date: formData.target_date!,
        related_exercise: formData.related_exercise || undefined,
        is_public: formData.is_public,
        reminder_frequency: formData.reminder_frequency
      };

      await createGoalMutation.mutateAsync(goalData);
      onSuccess();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Create New Goal
          </DialogTitle>
          <DialogDescription>
            Set a specific, measurable fitness goal to track your progress
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
                placeholder="Describe your goal and why it's important to you..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category">
                    {formData.category && (
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(formData.category as GoalCategory)}
                        <span className="capitalize">{formData.category.replace('_', ' ')}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4" />
                      Strength
                    </div>
                  </SelectItem>
                  <SelectItem value="endurance">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Endurance
                    </div>
                  </SelectItem>
                  <SelectItem value="weight_loss">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Weight Loss
                    </div>
                  </SelectItem>
                  <SelectItem value="muscle_gain">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Muscle Gain
                    </div>
                  </SelectItem>
                  <SelectItem value="flexibility">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Flexibility
                    </div>
                  </SelectItem>
                  <SelectItem value="general_fitness">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      General Fitness
                    </div>
                  </SelectItem>
                  <SelectItem value="sport_specific">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      Sport Specific
                    </div>
                  </SelectItem>
                  <SelectItem value="rehabilitation">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Rehabilitation
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <Label>Goal Type *</Label>
              <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_target">Weight Target</SelectItem>
                  <SelectItem value="rep_target">Rep Target</SelectItem>
                  <SelectItem value="duration_target">Duration Target</SelectItem>
                  <SelectItem value="frequency_target">Frequency Target</SelectItem>
                  <SelectItem value="body_weight">Body Weight</SelectItem>
                  <SelectItem value="body_fat">Body Fat %</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600 mt-1">{errors.type}</p>
              )}
            </div>
          </div>

          {/* Target Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="target_value">Target Value *</Label>
              <Input
                id="target_value"
                type="number"
                min="0"
                step="0.1"
                value={formData.target_value}
                onChange={(e) => updateField('target_value', e.target.value)}
                placeholder="e.g., 200"
                className={errors.target_value ? 'border-red-500' : ''}
              />
              {errors.target_value && (
                <p className="text-sm text-red-600 mt-1">{errors.target_value}</p>
              )}
            </div>

            <div>
              <Label htmlFor="current_value">Current Value</Label>
              <Input
                id="current_value"
                type="number"
                min="0"
                step="0.1"
                value={formData.current_value}
                onChange={(e) => updateField('current_value', e.target.value)}
                placeholder="e.g., 150"
                className={errors.current_value ? 'border-red-500' : ''}
              />
              {errors.current_value && (
                <p className="text-sm text-red-600 mt-1">{errors.current_value}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Select value={formData.unit} onValueChange={(value) => updateField('unit', value)}>
                <SelectTrigger className={errors.unit ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {formData.type && getSuggestedUnits(formData.type as GoalType).map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom unit...</SelectItem>
                </SelectContent>
              </Select>
              {formData.unit === 'custom' && (
                <Input
                  className="mt-2"
                  value={formData.unit === 'custom' ? '' : formData.unit}
                  onChange={(e) => updateField('unit', e.target.value)}
                  placeholder="Enter custom unit"
                />
              )}
              {errors.unit && (
                <p className="text-sm text-red-600 mt-1">{errors.unit}</p>
              )}
            </div>
          </div>

          {/* Target Date and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Target Date *</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.target_date && "text-muted-foreground",
                      errors.target_date && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.target_date ? format(formData.target_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.target_date}
                    onSelect={(date) => {
                      updateField('target_date', date);
                      setIsCalendarOpen(false);
                    }}
                    disabled={(date) => date <= new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.target_date && (
                <p className="text-sm text-red-600 mt-1">{errors.target_date}</p>
              )}
            </div>

            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => updateField('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
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
          </div>

          {/* Related Exercise */}
          <div>
            <Label htmlFor="related_exercise">Related Exercise (Optional)</Label>
            <Select value={formData.related_exercise} onValueChange={(value) => updateField('related_exercise', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent>
                                 <SelectItem value="">None</SelectItem>
                {EXERCISES.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.name}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_public">Make goal public</Label>
                <p className="text-sm text-gray-600">Allow others to see and encourage your progress</p>
              </div>
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => updateField('is_public', checked)}
              />
            </div>

            <div>
              <Label>Reminder Frequency</Label>
              <Select value={formData.reminder_frequency} onValueChange={(value) => updateField('reminder_frequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No reminders</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createGoalMutation.isPending}
              className="gap-2"
            >
              {createGoalMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Goal
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 