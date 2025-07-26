import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { AuthPage } from './pages/AuthPage';
import { ProfileUpdateForm } from './components/profile/ProfileUpdateForm';
import { ExerciseSelector } from './components/exercises/ExerciseSelector';
import { WorkoutManager } from './components/workouts/WorkoutManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Target, LogOut } from 'lucide-react';

// Main dashboard component
const Dashboard: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">RepFlow</h1>
              <span className="ml-2 text-sm text-gray-500">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.photoURL || undefined} alt="Profile picture" />
                  <AvatarFallback className="text-sm">
                    {userProfile?.displayName?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700">
                  Welcome, {userProfile?.displayName || currentUser?.email}!
                </span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="exercises">Exercises</TabsTrigger>
              <TabsTrigger value="workouts">Workouts</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to RepFlow!</CardTitle>
                  <CardDescription>Your comprehensive fitness tracking platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold">💪 Exercise Database & Muscle Visualization</h3>
                      <p className="text-sm text-gray-600">
                        Browse our comprehensive exercise library with real-time muscle group visualization
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">🎯 Custom Workout Builder</h3>
                      <p className="text-sm text-gray-600">
                        Create personalized workout routines tailored to your fitness goals
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">📊 Workout Logging & Progress Tracking</h3>
                      <p className="text-sm text-gray-600">
                        Log your workouts and track your progress over time
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">📅 Weekly Planning & Calendar</h3>
                      <p className="text-sm text-gray-600">
                        Plan your workouts for the week with our calendar interface
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">🏆 Gamification & Achievements</h3>
                      <p className="text-sm text-gray-600">
                        Earn badges and level up your fitness journey
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exercises" className="space-y-6">
              <ExerciseSelector 
                onExerciseSelect={(exercise) => {
                  console.log('Selected exercise:', exercise);
                  // TODO: Add muscle visualization integration
                }}
                showMuscleGroups={true}
              />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <ProfileUpdateForm onSuccess={() => {
                // Optionally switch back to overview or show success message
              }} />
            </TabsContent>

            <TabsContent value="workouts" className="space-y-6">
              <WorkoutManager
                onStartWorkout={(workout) => {
                  console.log('Starting workout:', workout);
                  // TODO: Implement workout session
                  alert(`Starting workout: ${workout.name}`);
                }}
              />
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Tracking</CardTitle>
                  <CardDescription>Monitor your fitness journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No progress data yet</h3>
                    <p className="text-gray-600 mb-4">
                      Complete some workouts to see your progress charts here
                    </p>
                    <Button disabled>
                      <Target className="mr-2 h-4 w-4" />
                      View Analytics (Coming Soon)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

// Main App component with authentication
const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <AuthGuard
      requireAuth={false}
      fallback={<AuthPage />}
    >
      {currentUser ? <Dashboard /> : <AuthPage />}
    </AuthGuard>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;