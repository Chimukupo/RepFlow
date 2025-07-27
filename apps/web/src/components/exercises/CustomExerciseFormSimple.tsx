import React, { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CustomExerciseFormSimpleProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CustomExerciseFormSimple: React.FC<CustomExerciseFormSimpleProps> = ({
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructions: ['', '', ''],
    primaryMuscles: [] as string[],
    category: 'other',
    difficulty: 'beginner',
    equipment: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Mock submission - replace with actual API call
      console.log('Creating custom exercise:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating custom exercise:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const addInstruction = () => {
    if (formData.instructions.length < 10) {
      setFormData({ 
        ...formData, 
        instructions: [...formData.instructions, ''] 
      });
    }
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 3) {
      const newInstructions = formData.instructions.filter((_, i) => i !== index);
      setFormData({ ...formData, instructions: newInstructions });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Create Custom Exercise</CardTitle>
          <CardDescription>
            Add your own exercise to the library (Simplified Version)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Exercise Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Bulgarian Split Squat"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 rounded-md border border-gray-300 bg-background text-foreground"
                  >
                    <option value="push">Push</option>
                    <option value="pull">Pull</option>
                    <option value="legs">Legs</option>
                    <option value="core">Core</option>
                    <option value="cardio">Cardio</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the exercise and its benefits..."
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Instructions</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInstruction}
                  disabled={formData.instructions.length >= 10}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder={`Step ${index + 1}: e.g., Stand with feet hip-width apart...`}
                      />
                    </div>
                    {formData.instructions.length > 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeInstruction(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Classification</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full p-2 rounded-md border border-gray-300 bg-background text-foreground"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Creating...' : 'Create Exercise'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 