import React, { useState, useCallback } from 'react';
import { Calendar, Plus, Clock, Target, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Workout } from 'shared/schemas/workout';

interface WeeklyWorkoutPlannerProps {
  savedWorkouts: Workout[];
  onScheduleWorkout?: (day: string, workout: Workout) => void;
  className?: string;
}

interface ScheduledWorkout {
  id: string;
  day: string;
  workout: Workout;
  scheduledTime?: string;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

export const WeeklyWorkoutPlanner: React.FC<WeeklyWorkoutPlannerProps> = ({
  savedWorkouts,
  onScheduleWorkout,
  className
}) => {
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedWorkout, setSelectedWorkout] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('09:00');

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Get scheduled workouts for a specific day
  const getWorkoutsForDay = useCallback((day: string) => {
    return scheduledWorkouts.filter(sw => sw.day === day);
  }, [scheduledWorkouts]);

  // Handle opening schedule dialog
  const handleScheduleClick = useCallback((day: string) => {
    setSelectedDay(day);
    setSelectedWorkout('');
    setSelectedTime('09:00');
    setShowScheduleDialog(true);
  }, []);

  // Handle scheduling a workout
  const handleScheduleWorkout = useCallback(() => {
    if (!selectedDay || !selectedWorkout) return;

    const workout = savedWorkouts.find(w => w.id === selectedWorkout);
    if (!workout) return;

    const newScheduledWorkout: ScheduledWorkout = {
      id: generateId(),
      day: selectedDay,
      workout,
      scheduledTime: selectedTime,
    };

    setScheduledWorkouts(prev => [...prev, newScheduledWorkout]);
    setShowScheduleDialog(false);
    onScheduleWorkout?.(selectedDay, workout);
  }, [selectedDay, selectedWorkout, selectedTime, savedWorkouts, onScheduleWorkout]);

  // Handle removing a scheduled workout
  const handleRemoveScheduledWorkout = useCallback((scheduledWorkoutId: string) => {
    setScheduledWorkouts(prev => prev.filter(sw => sw.id !== scheduledWorkoutId));
  }, []);

  // Get total weekly stats
  const weeklyStats = {
    totalWorkouts: scheduledWorkouts.length,
    totalTime: scheduledWorkouts.reduce((total, sw) => total + (sw.workout.estimatedDuration || 0), 0),
    daysPlanned: new Set(scheduledWorkouts.map(sw => sw.day)).size,
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            Weekly Planner
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Schedule your workouts for the week ahead
          </p>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Workouts</p>
                <p className="text-2xl font-bold text-gray-900">{weeklyStats.totalWorkouts}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-gray-900">{weeklyStats.totalTime}min</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Days Planned</p>
                <p className="text-2xl font-bold text-gray-900">{weeklyStats.daysPlanned}/7</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayWorkouts = getWorkoutsForDay(day.key);
          
          return (
            <Card key={day.key} className="min-h-[200px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-center">
                  <span className="hidden lg:inline">{day.label}</span>
                  <span className="lg:hidden">{day.short}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Scheduled Workouts */}
                {dayWorkouts.map((scheduledWorkout) => (
                  <div key={scheduledWorkout.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-blue-900 text-sm truncate">
                          {scheduledWorkout.workout.name}
                        </h4>
                        {scheduledWorkout.scheduledTime && (
                          <p className="text-xs text-blue-600 mt-1">
                            {scheduledWorkout.scheduledTime}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveScheduledWorkout(scheduledWorkout.id)}
                        className="h-6 w-6 p-0 text-blue-600 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {scheduledWorkout.workout.exercises.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {scheduledWorkout.workout.estimatedDuration}min
                      </span>
                    </div>
                  </div>
                ))}

                {/* Add Workout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScheduleClick(day.key)}
                  className="w-full border-dashed border-2 h-12 text-gray-600 hover:text-blue-600 hover:border-blue-300"
                  disabled={savedWorkouts.length === 0}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Workout
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Workouts Message */}
      {savedWorkouts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Workouts Available</h3>
            <p className="text-gray-600 mb-4 text-center">
              Create some workouts first before you can schedule them
            </p>
          </CardContent>
        </Card>
      )}

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Schedule Workout for {DAYS_OF_WEEK.find(d => d.key === selectedDay)?.label}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Workout Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Select Workout
              </label>
              <Select value={selectedWorkout} onValueChange={setSelectedWorkout}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a workout..." />
                </SelectTrigger>
                <SelectContent>
                  {savedWorkouts.map((workout) => (
                    <SelectItem key={workout.id} value={workout.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{workout.name}</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500 ml-4">
                          <span>{workout.exercises.length} exercises</span>
                          <span>•</span>
                          <span>{workout.estimatedDuration}min</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Preferred Time
              </label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="06:00">6:00 AM</SelectItem>
                  <SelectItem value="07:00">7:00 AM</SelectItem>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="17:00">5:00 PM</SelectItem>
                  <SelectItem value="18:00">6:00 PM</SelectItem>
                  <SelectItem value="19:00">7:00 PM</SelectItem>
                  <SelectItem value="20:00">8:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowScheduleDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleScheduleWorkout}
                disabled={!selectedWorkout}
                className="flex-1"
              >
                Schedule Workout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 