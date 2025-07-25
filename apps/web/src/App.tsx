import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { AuthPage } from './pages/AuthPage';
import { Button } from '@/components/ui/button';

// Main dashboard component (placeholder for now)
const Dashboard: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();

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
              <span className="text-sm text-gray-700">
                Welcome, {userProfile?.displayName || currentUser?.email}!
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to RepFlow!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Your fitness journey starts here. Breathe, Train, Conquer.
            </p>
            
            {/* Placeholder content */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
              <p className="text-gray-600">
                🏋️ Exercise Selection & Muscle Visualization<br />
                📊 Workout Logging & Progress Tracking<br />
                📅 Weekly Planning & Calendar<br />
                🏆 Gamification & Achievements<br />
                🧮 BMI Calculator & Health Metrics
              </p>
            </div>
          </div>
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
      <AppContent />
    </AuthProvider>
  );
}

export default App;