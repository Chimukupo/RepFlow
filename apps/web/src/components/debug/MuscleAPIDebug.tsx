import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { muscleGroupAPI } from '@/lib/api/muscleGroupAPI';
import { env } from '@/env';

interface TestResult {
  test: string;
  success: boolean;
  data: unknown;
  error?: unknown;
  timestamp: string;
}

export const MuscleAPIDebug: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, success: boolean, data: unknown, error?: unknown) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      data,
      error,
      timestamp: new Date().toISOString()
    }]);
  };

  const testAPIKey = async () => {
    setIsLoading(true);
    try {
      console.log('🔑 Testing API Key...');
      console.log('🔑 API Key exists:', !!env.VITE_RAPIDAPI_KEY);
      console.log('🔑 API Key length:', env.VITE_RAPIDAPI_KEY?.length || 0);
      console.log('🔑 API Key preview:', env.VITE_RAPIDAPI_KEY?.substring(0, 10) + '...');
      
      addResult('API Key Check', true, {
        exists: !!env.VITE_RAPIDAPI_KEY,
        length: env.VITE_RAPIDAPI_KEY?.length || 0,
        preview: env.VITE_RAPIDAPI_KEY?.substring(0, 10) + '...'
      });
    } catch (error) {
      addResult('API Key Check', false, null, error);
    }
    setIsLoading(false);
  };

  const testGetMuscleGroups = async () => {
    setIsLoading(true);
    try {
      console.log('🏋️ Testing getMuscleGroups...');
      const response = await muscleGroupAPI.getMuscleGroups();
      console.log('✅ getMuscleGroups response:', response);
      addResult('Get Muscle Groups', true, response);
    } catch (error) {
      console.error('❌ getMuscleGroups error:', error);
      addResult('Get Muscle Groups', false, null, error);
    }
    setIsLoading(false);
  };

  const testSingleColorImage = async () => {
    setIsLoading(true);
    try {
      console.log('🎨 Testing getSingleColorImage...');
      const response = await muscleGroupAPI.getSingleColorImage({
        muscleGroups: 'chest,biceps',
        color: '70,130,180',
        transparentBackground: '1'
      });
      console.log('✅ getSingleColorImage response:', response);
      addResult('Single Color Image', true, response);
    } catch (error) {
      console.error('❌ getSingleColorImage error:', error);
      addResult('Single Color Image', false, null, error);
    }
    setIsLoading(false);
  };

  const testBaseImage = async () => {
    setIsLoading(true);
    try {
      console.log('👤 Testing getBaseImage...');
      const response = await muscleGroupAPI.getBaseImage({
        transparentBackground: '1'
      });
      console.log('✅ getBaseImage response:', response);
      addResult('Base Image', true, response);
    } catch (error) {
      console.error('❌ getBaseImage error:', error);
      addResult('Base Image', false, null, error);
    }
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">🔧 Muscle Group API Debug</CardTitle>
          <CardDescription className="text-muted-foreground">
            Test the RapidAPI muscle group image generator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={testAPIKey}
              disabled={isLoading}
              variant="outline"
              className="glass"
            >
              Test API Key
            </Button>
            <Button
              onClick={testGetMuscleGroups}
              disabled={isLoading}
              variant="outline"
              className="glass"
            >
              Get Muscle Groups
            </Button>
            <Button
              onClick={testSingleColorImage}
              disabled={isLoading}
              variant="outline"
              className="glass"
            >
              Test Single Color Image
            </Button>
            <Button
              onClick={testBaseImage}
              disabled={isLoading}
              variant="outline"
              className="glass"
            >
              Test Base Image
            </Button>
            <Button
              onClick={clearResults}
              disabled={isLoading}
              variant="destructive"
            >
              Clear Results
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span>Testing API...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {testResults.map((result, index) => (
          <Card key={index} className={`glass-card border-l-4 ${
            result.success ? 'border-l-green-500' : 'border-l-red-500'
          }`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                  {result.success ? '✅' : '❌'}
                </span>
                <CardTitle className="text-sm text-foreground">{result.test}</CardTitle>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {result.success ? (
                <div className="space-y-2">
                  <pre className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded overflow-auto text-green-800 dark:text-green-200">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                  {result.data && typeof result.data === 'object' && 'imageUrl' in result.data && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Generated Image:</p>
                      <img 
                        src={(result.data as { imageUrl: string }).imageUrl} 
                        alt="Muscle visualization"
                        className="max-w-32 h-auto border border-border rounded"
                        onLoad={() => console.log('✅ Image loaded successfully')}
                        onError={(e) => console.error('❌ Image failed to load:', e)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto text-red-800 dark:text-red-200">
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 