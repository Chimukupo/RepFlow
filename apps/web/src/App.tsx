import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { AuthPage } from './pages/AuthPage';
import { ProfileUpdateForm } from './components/profile/ProfileUpdateForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Activity, Target, Settings, LogOut, Edit } from 'lucide-react';
import { calculateBMI, getBMICategory, getBMICategoryColor } from 'shared/schemas/profile';

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

  const bmi = userProfile?.weight && userProfile?.height ? 
    calculateBMI(userProfile.weight, userProfile.height, userProfile.units) : null;

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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="workouts">Workouts</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to RepFlow!
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Your fitness journey starts here. Breathe, Train, Conquer.
                </p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userProfile ? 
                        Math.round((Object.values(userProfile).filter(v => v !== undefined && v !== null).length / 12) * 100) 
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Complete your profile for better recommendations
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">BMI</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {bmi || 'N/A'}
                    </div>
                    <p className={`text-xs ${bmi ? getBMICategoryColor(bmi) : 'text-muted-foreground'}`}>
                      {bmi ? getBMICategory(bmi) : 'Add weight & height'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fitness Level</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">
                      {userProfile?.fitnessLevel || 'Not Set'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userProfile?.fitnessLevel ? 'Keep pushing!' : 'Set your fitness level'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Goals</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userProfile?.fitnessGoals?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userProfile?.fitnessGoals?.length ? 'Goals set' : 'Set your goals'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Get started with RepFlow</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab('profile')}
                    >
                      <Edit className="h-6 w-6" />
                      <span>Complete Profile</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      disabled
                    >
                      <Activity className="h-6 w-6" />
                      <span>Start Workout</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      disabled
                    >
                      <Target className="h-6 w-6" />
                      <span>Set Goals</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Coming Soon */}
              <Card>
                <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
                  <CardDescription>Features we're working on</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">🏋️ Exercise Selection & Muscle Visualization</h3>
                      <p className="text-sm text-gray-600">
                        Choose exercises and see which muscles you're targeting with visual feedback
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

            <TabsContent value="profile" className="space-y-6">
              <ProfileUpdateForm onSuccess={() => {
                // Optionally switch back to overview or show success message
              }} />
            </TabsContent>

            <TabsContent value="workouts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workouts</CardTitle>
                  <CardDescription>Your workout history and routines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start your first workout to see your progress here
                    </p>
                    <Button disabled>
                      <Activity className="mr-2 h-4 w-4" />
                      Start Workout (Coming Soon)
                    </Button>
                  </div>
                </CardContent>
              </Card>
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