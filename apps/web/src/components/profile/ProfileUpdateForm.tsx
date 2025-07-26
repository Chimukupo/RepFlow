import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  profileUpdateSchema, 
  type ProfileUpdateFormData, 
  type FitnessLevel, 
  type Units,
  calculateBMI,
  getBMICategory,
  getBMICategoryColor
} from 'shared/schemas/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ProfilePictureUpload } from './ProfilePictureUpload';

interface ProfileUpdateFormProps {
  onSuccess?: () => void;
}

export const ProfileUpdateForm: React.FC<ProfileUpdateFormProps> = ({ onSuccess }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: userProfile?.displayName || '',
      weight: userProfile?.weight || undefined,
      height: userProfile?.height || undefined,
      age: userProfile?.age || undefined,
      fitnessLevel: userProfile?.fitnessLevel || undefined,
      fitnessGoals: userProfile?.fitnessGoals || [],
      units: userProfile?.units || 'metric',
      profileVisible: userProfile?.profileVisible ?? true,
      shareProgress: userProfile?.shareProgress ?? false,
      emailNotifications: userProfile?.emailNotifications ?? true,
      workoutReminders: userProfile?.workoutReminders ?? true,
      darkMode: userProfile?.darkMode ?? false,
    },
  });

  const watchedWeight = watch('weight');
  const watchedHeight = watch('height');
  const watchedUnits = watch('units');

  // Calculate BMI if both weight and height are available
  const bmi = watchedWeight && watchedHeight ? 
    calculateBMI(watchedWeight, watchedHeight, watchedUnits) : null;

  const onSubmit = async (data: ProfileUpdateFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      await updateUserProfile(data);
      setSuccess('Profile updated successfully!');
      onSuccess?.();
    } catch (err: unknown) {
      console.error('Profile update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fitnessLevels: { value: FitnessLevel; label: string; description: string }[] = [
    { value: 'beginner', label: 'Beginner', description: 'New to fitness or returning after a long break' },
    { value: 'intermediate', label: 'Intermediate', description: 'Regular exercise for 6+ months' },
    { value: 'advanced', label: 'Advanced', description: 'Consistent training for 2+ years' },
    { value: 'expert', label: 'Expert', description: 'Professional or competitive athlete' },
  ];

  const fitnessGoalOptions = [
    { value: 'weight_loss', label: 'Weight Loss', icon: '⚖️' },
    { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
    { value: 'strength', label: 'Strength', icon: '🏋️' },
    { value: 'endurance', label: 'Endurance', icon: '🏃' },
    { value: 'flexibility', label: 'Flexibility', icon: '🤸' },
    { value: 'general_fitness', label: 'General Fitness', icon: '🎯' },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Update Profile
        </CardTitle>
        <CardDescription>
          Customize your profile to get personalized workout recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {success}
            </div>
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="fitness">Fitness</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              {/* Profile Picture Upload */}
              <ProfilePictureUpload />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Enter your display name"
                    {...register('displayName')}
                    className={errors.displayName ? 'border-red-500' : ''}
                  />
                  {errors.displayName && (
                    <p className="text-sm text-red-600">{errors.displayName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    {...register('age', { valueAsNumber: true })}
                    className={errors.age ? 'border-red-500' : ''}
                  />
                  {errors.age && (
                    <p className="text-sm text-red-600">{errors.age.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">
                    Weight {watchedUnits === 'metric' ? '(kg)' : '(lbs)'}
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder={`Enter weight in ${watchedUnits === 'metric' ? 'kg' : 'lbs'}`}
                    {...register('weight', { valueAsNumber: true })}
                    className={errors.weight ? 'border-red-500' : ''}
                  />
                  {errors.weight && (
                    <p className="text-sm text-red-600">{errors.weight.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">
                    Height {watchedUnits === 'metric' ? '(cm)' : '(inches)'}
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    placeholder={`Enter height in ${watchedUnits === 'metric' ? 'cm' : 'inches'}`}
                    {...register('height', { valueAsNumber: true })}
                    className={errors.height ? 'border-red-500' : ''}
                  />
                  {errors.height && (
                    <p className="text-sm text-red-600">{errors.height.message}</p>
                  )}
                </div>
              </div>

              {/* BMI Display */}
              {bmi && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Body Mass Index (BMI)</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">{bmi}</span>
                    <span className={`font-medium ${getBMICategoryColor(bmi)}`}>
                      {getBMICategory(bmi)}
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="fitness" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Fitness Level</Label>
                  <Select
                    value={watch('fitnessLevel') || ''}
                    onValueChange={(value) => setValue('fitnessLevel', value as FitnessLevel)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your fitness level" />
                    </SelectTrigger>
                    <SelectContent>
                      {fitnessLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-sm text-gray-600">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              <div className="space-y-4">
                <Label>Fitness Goals (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {fitnessGoalOptions.map((goal) => (
                    <div key={goal.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal.value}
                        checked={watch('fitnessGoals')?.includes(goal.value as any) || false}
                        onCheckedChange={(checked) => {
                          const currentGoals = watch('fitnessGoals') || [];
                          if (checked) {
                            setValue('fitnessGoals', [...currentGoals, goal.value as any]);
                          } else {
                            setValue('fitnessGoals', currentGoals.filter(g => g !== goal.value));
                          }
                        }}
                      />
                      <Label htmlFor={goal.value} className="flex items-center gap-2 cursor-pointer">
                        <span>{goal.icon}</span>
                        {goal.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Units</Label>
                  <Select
                    value={watchedUnits || 'metric'}
                    onValueChange={(value) => setValue('units', value as Units)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (lbs, inches)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Privacy Settings</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="profileVisible"
                      checked={watch('profileVisible') ?? true}
                      onCheckedChange={(checked) => setValue('profileVisible', !!checked)}
                    />
                    <Label htmlFor="profileVisible" className="cursor-pointer">
                      Make my profile visible to other users
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shareProgress"
                      checked={watch('shareProgress') ?? false}
                      onCheckedChange={(checked) => setValue('shareProgress', !!checked)}
                    />
                    <Label htmlFor="shareProgress" className="cursor-pointer">
                      Share my progress with other users
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailNotifications"
                      checked={watch('emailNotifications') ?? true}
                      onCheckedChange={(checked) => setValue('emailNotifications', !!checked)}
                    />
                    <Label htmlFor="emailNotifications" className="cursor-pointer">
                      Receive email notifications
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="workoutReminders"
                      checked={watch('workoutReminders') ?? true}
                      onCheckedChange={(checked) => setValue('workoutReminders', !!checked)}
                    />
                    <Label htmlFor="workoutReminders" className="cursor-pointer">
                      Receive workout reminders
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Appearance</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="darkMode"
                      checked={watch('darkMode') ?? false}
                      onCheckedChange={(checked) => setValue('darkMode', !!checked)}
                    />
                    <Label htmlFor="darkMode" className="cursor-pointer">
                      Enable dark mode (coming soon)
                    </Label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 