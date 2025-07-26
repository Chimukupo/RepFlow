import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkoutTimerProps {
  isActive?: boolean;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onReset?: () => void;
}

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  isActive = false,
  onStart,
  onPause,
  onStop,
  onReset
}) => {
  const [time, setTime] = useState(0); // Time in seconds
  const [isRunning, setIsRunning] = useState(false);

  // Format time as MM:SS or HH:MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && isActive) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isActive]);

  // Handle start/resume
  const handleStart = useCallback(() => {
    setIsRunning(true);
    onStart?.();
  }, [onStart]);

  // Handle pause
  const handlePause = useCallback(() => {
    setIsRunning(false);
    onPause?.();
  }, [onPause]);

  // Handle stop
  const handleStop = useCallback(() => {
    setIsRunning(false);
    onStop?.();
  }, [onStop]);

  // Handle reset
  const handleReset = useCallback(() => {
    setTime(0);
    setIsRunning(false);
    onReset?.();
  }, [onReset]);

  // Get timer display color based on state
  const getTimerColor = () => {
    if (!isActive) return 'text-gray-400';
    if (isRunning) return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-center text-sm sm:text-base">Workout Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className={`text-2xl sm:text-4xl font-mono font-bold ${getTimerColor()}`}>
            {formatTime(time)}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">
            {!isActive ? 'Inactive' : isRunning ? 'Running' : 'Paused'}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-1 sm:gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              disabled={!isActive}
              className="flex items-center gap-2"
              size="sm"
            >
              <Play className="w-4 h-4" />
              {time > 0 ? 'Resume' : 'Start'}
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              variant="outline"
              className="flex items-center gap-2"
              size="sm"
            >
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}

          <Button
            onClick={handleStop}
            variant="outline"
            disabled={!isActive || time === 0}
            className="flex items-center gap-2"
            size="sm"
          >
            <Square className="w-4 h-4" />
            Stop
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            disabled={time === 0}
            className="flex items-center gap-2"
            size="sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Workout Stats */}
        {time > 0 && (
          <div className="text-center text-sm text-gray-600 pt-2 border-t">
            <div>Total Duration: {formatTime(time)}</div>
            {time >= 3600 && (
              <div className="text-xs text-orange-600 mt-1">
                Long workout! Consider taking breaks.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 