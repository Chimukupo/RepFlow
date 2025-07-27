import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Power, Dumbbell, Target, TrendingUp, Trophy, Eye, BarChart3, Activity } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { ExerciseWorkspace } from './components/exercises/ExerciseWorkspace';
import { WorkoutManager } from './components/workouts/WorkoutManager';
import { GoalManager } from './components/goals/GoalManager';
import { BMICalculator } from './components/health/BMICalculator';
import { ProgressDashboard } from './components/analytics/ProgressDashboard';
import { ProfileUpdateForm } from './components/profile/ProfileUpdateForm';
import { AchievementDashboard } from './components/achievements/AchievementDashboard';
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
              <TabsTrigger value="workouts" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state-active]:shadow-sm font-medium">Workouts</TabsTrigger>
              <TabsTrigger value="goals" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:shadow-sm font-medium">Goals</TabsTrigger>
              <TabsTrigger value="achievements" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:shadow-sm font-medium">Achievements</TabsTrigger>
              <TabsTrigger value="health" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:shadow-sm font-medium">Health</TabsTrigger>
              <TabsTrigger value="progress" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:shadow-sm font-medium">Progress</TabsTrigger>
              <TabsTrigger value="profile" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:shadow-sm font-medium">Profile</TabsTrigger>

            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Hero Section */}
              <div className="relative overflow-hidden rounded-3xl glass-card p-8 md:p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-primary/20 backdrop-blur-sm">
                      <Dumbbell className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Welcome to RepFlow
                      </h1>
                      <p className="text-lg text-muted-foreground">
                        Breathe, Train, Conquer - Your AI-powered fitness companion
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">500+</div>
                      <div className="text-sm text-muted-foreground">Exercises Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">AI</div>
                      <div className="text-sm text-muted-foreground">Muscle Visualization</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                      <div className="text-sm text-muted-foreground">Progress Tracking</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card 
                  className="glass-card hover:scale-105 transition-all duration-300 cursor-pointer group"
                  onClick={() => setActiveTab('exercises')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <Target className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Explore Exercises</h3>
                    <p className="text-sm text-muted-foreground">Browse our AI-powered exercise library</p>
                  </CardContent>
                </Card>

                <Card 
                  className="glass-card hover:scale-105 transition-all duration-300 cursor-pointer group"
                  onClick={() => setActiveTab('workouts')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                      <Dumbbell className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Start Workout</h3>
                    <p className="text-sm text-muted-foreground">Create and log your training sessions</p>
                  </CardContent>
                </Card>

                <Card 
                  className="glass-card hover:scale-105 transition-all duration-300 cursor-pointer group"
                  onClick={() => setActiveTab('progress')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">View Progress</h3>
                    <p className="text-sm text-muted-foreground">Track your fitness journey</p>
                  </CardContent>
                </Card>

                <Card 
                  className="glass-card hover:scale-105 transition-all duration-300 cursor-pointer group"
                  onClick={() => setActiveTab('achievements')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                      <Trophy className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Achievements</h3>
                    <p className="text-sm text-muted-foreground">Unlock badges and milestones</p>
                  </CardContent>
                </Card>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Eye className="w-5 h-5 text-primary" />
                      </div>
                      AI Muscle Visualization
                    </CardTitle>
                    <CardDescription>Revolutionary real-time muscle group highlighting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      See exactly which muscles you're targeting with our AI-powered visualization system. 
                      Select any exercise and watch as the corresponding muscle groups light up in real-time.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('exercises')}
                      className="w-full"
                    >
                      Try Visualization →
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                      Smart Progress Tracking
                    </CardTitle>
                    <CardDescription>Comprehensive analytics for your fitness journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Track your workouts, monitor your progress, and achieve your goals with detailed 
                      analytics, personal records, and intelligent insights.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('progress')}
                      className="w-full"
                    >
                      View Analytics →
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Placeholder */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Activity</CardTitle>
                  <CardDescription>Your latest fitness achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                      <Activity className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-foreground mb-2">Start Your Fitness Journey</h3>
                    <p className="text-muted-foreground mb-4">
                      Complete your first workout to see your activity here
                    </p>
                    <Button onClick={() => setActiveTab('workouts')}>
                      Create First Workout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exercises" className="space-y-6">
              <ExerciseWorkspace />
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

            <TabsContent value="achievements" className="space-y-6">
              <AchievementDashboard />
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