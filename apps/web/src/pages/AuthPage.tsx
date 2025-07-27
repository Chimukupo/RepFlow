import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';

type AuthMode = 'login' | 'register' | 'reset';

interface AuthPageProps {
  onAuthSuccess?: () => void;
  defaultMode?: AuthMode;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  defaultMode = 'login',
}) => {
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  const handleAuthSuccess = () => {
    onAuthSuccess?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background - matching landing page */}
      <div className="fixed inset-0 opacity-20 dark:opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gray-500/10 dark:bg-gray-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-500/10 dark:bg-green-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* RepFlow Branding - matching landing page */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center subtle-glow">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">RepFlow</h1>
          </div>
          <p className="text-lg text-muted-foreground">Breathe, Train, Conquer</p>
        </div>

        {/* Authentication Forms */}
        {mode === 'login' && (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setMode('register')}
            onSwitchToReset={() => setMode('reset')}
          />
        )}

        {mode === 'register' && (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        )}

        {mode === 'reset' && (
          <ResetPasswordForm
            onSuccess={() => setMode('login')}
            onBackToLogin={() => setMode('login')}
          />
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 RepFlow. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}; 