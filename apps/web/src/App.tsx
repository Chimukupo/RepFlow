import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Power, Dumbbell } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { ExerciseWorkspace } from './components/exercises/ExerciseWorkspace';
import { WorkoutManager } from './components/workouts/WorkoutManager';
import { GoalManager } from './components/goals/GoalManager';
import { BMICalculator } from './components/health/BMICalculator';
import { ProgressDashboard } from './components/analytics/ProgressDashboard';
import { ProfileUpdateForm } from './components/profile/ProfileUpdateForm';
import { LandingPage } from './components/LandingPage';
import { AuthGuard } from './components/auth/AuthGuard';

import './App.css';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-md sticky top-0 z-50 border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">RepFlow</h1>
                <span className="text-xs text-muted-foreground/80 font-medium">Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-muted/30 rounded-full border border-border/40">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Welcome, {userProfile?.displayName || currentUser?.email?.split('@')[0] || 'User'}!
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-background border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
              >
                <Power className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="glass-card grid w-full grid-cols-8 p-1.5 mb-8 shadow-sm">
              <TabsTrigger value="overview" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:shadow-sm font-medium">Overview</TabsTrigger>
              <TabsTrigger value="exercises" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:shadow-sm font-medium">Exercises</TabsTrigger>
              <TabsTrigger value="workouts" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:shadow-sm font-medium">Workouts</TabsTrigger>
              <TabsTrigger value="goals" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:shadow-sm font-medium">Goals</TabsTrigger>
              <TabsTrigger value="health" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:shadow-sm font-medium">Health</TabsTrigger>
              <TabsTrigger value="progress" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:shadow-sm font-medium">Progress</TabsTrigger>
              <TabsTrigger value="profile" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:shadow-sm font-medium">Profile</TabsTrigger>

            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-foreground text-2xl">Welcome to RepFlow!</CardTitle>
                  <CardDescription className="text-muted-foreground">Your comprehensive fitness tracking platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">💪 Exercise Database & Muscle Visualization</h3>
                      <p className="text-sm text-muted-foreground">
                        Browse our comprehensive exercise library with real-time muscle group visualization powered by AI
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">🎯 Custom Workout Builder</h3>
                      <p className="text-sm text-muted-foreground">
                        Create personalized workout routines tailored to your fitness goals
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">📊 Workout Logging & Progress Tracking</h3>
                      <p className="text-sm text-muted-foreground">
                        Log your workouts and track your progress over time
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">📅 Weekly Planning & Calendar</h3>
                      <p className="text-sm text-muted-foreground">
                        Plan your workouts for the week with our calendar interface
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">🏆 Gamification & Achievements</h3>
                      <p className="text-sm text-muted-foreground">
                        Earn badges and level up your fitness journey
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exercises" className="space-y-6">
              <ExerciseWorkspace 
                initialLayout="side-by-side"
                showLayoutControls={true}
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

            <TabsContent value="goals" className="space-y-6">
              <GoalManager />
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              <BMICalculator />
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <ProgressDashboard />
            </TabsContent>


          </Tabs>
        </div>
      </main>
    </div>
  );
};

// Main App component
const App: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [showLanding, setShowLanding] = useState(!currentUser);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <span className="text-lg font-medium text-foreground">Loading RepFlow...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!currentUser) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    } else {
      return <AuthPage onAuthSuccess={() => setShowLanding(false)} />;
    }
  }

  // Show dashboard for authenticated users
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
};

export default App;