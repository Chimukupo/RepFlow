import React, { useState } from 'react';
import { Download, FileText, Database, Calendar, Settings, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface ExportOption {
  id: string;
  name: string;
  description: string;
  format: 'csv' | 'json' | 'txt';
  icon: React.ReactNode;
  size: string;
  dataTypes: string[];
}

export const DataExportManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportedFiles, setExportedFiles] = useState<Set<string>>(new Set());

  const exportOptions: ExportOption[] = [
    {
      id: 'workouts-csv',
      name: 'Workout Data (CSV)',
      description: 'Complete workout history with sets, reps, and weights',
      format: 'csv',
      icon: <FileText className="w-5 h-5" />,
      size: '~2-5 MB',
      dataTypes: ['Workouts', 'Exercises', 'Sets', 'Performance']
    },
    {
      id: 'complete-json',
      name: 'Complete Data (JSON)',
      description: 'All your RepFlow data in structured format',
      format: 'json',
      icon: <Database className="w-5 h-5" />,
      size: '~1-3 MB',
      dataTypes: ['Workouts', 'Goals', 'BMI History', 'Progress']
    },
    {
      id: 'progress-report',
      name: 'Progress Report (Text)',
      description: 'Human-readable summary of your fitness journey',
      format: 'txt',
      icon: <Calendar className="w-5 h-5" />,
      size: '~50-100 KB',
      dataTypes: ['Statistics', 'Achievements', 'Trends']
    }
  ];

  const handleExport = async (option: ExportOption) => {
    if (!currentUser) return;

    setIsExporting(option.id);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data generation
      let content = '';
      let mimeType = '';
      
      switch (option.format) {
        case 'csv':
          content = generateMockCSV();
          mimeType = 'text/csv';
          break;
        case 'json':
          content = generateMockJSON();
          mimeType = 'application/json';
          break;
        case 'txt':
          content = generateMockReport();
          mimeType = 'text/plain';
          break;
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `repflow-${option.id}-${timestamp}.${option.format}`;
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Mark as exported
      setExportedFiles(prev => new Set([...prev, option.id]));
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(null);
    }
  };

  const generateMockCSV = (): string => {
    return `Date,Workout Name,Exercise,Sets,Reps,Weight (kg),Duration (min)
2024-01-15,"Push Day","Push-up",3,12,0,25
2024-01-15,"Push Day","Bench Press",4,8,80,25
2024-01-17,"Pull Day","Pull-up",3,10,0,30
2024-01-17,"Pull Day","Deadlift",4,6,120,30
2024-01-19,"Leg Day","Squat",4,10,100,35
2024-01-19,"Leg Day","Leg Press",3,12,150,35`;
  };

  const generateMockJSON = (): string => {
    const data = {
      exportInfo: {
        version: '1.0',
        application: 'RepFlow',
        userId: currentUser?.uid || 'anonymous',
        exportedAt: new Date().toISOString(),
        dataTypes: ['workouts', 'goals', 'bmiHistory']
      },
      summary: {
        totalWorkouts: 24,
        totalExercises: 156,
        totalSets: 892,
        averageWorkoutDuration: 45,
        mostFrequentExercise: 'Push-up'
      },
      workouts: [
        {
          id: '1',
          name: 'Push Day',
          date: '2024-01-15',
          duration: 45,
          exercises: [
            {
              name: 'Push-up',
              sets: [
                { reps: 12, weight: 0, restTime: 60 },
                { reps: 10, weight: 0, restTime: 60 },
                { reps: 8, weight: 0, restTime: 60 }
              ]
            }
          ]
        }
      ]
    };
    
    return JSON.stringify(data, null, 2);
  };

  const generateMockReport = (): string => {
    return `# RepFlow Fitness Report
Generated on: ${new Date().toLocaleDateString()}
 User: ${currentUser?.email || 'Anonymous'}

## Summary Statistics
- Total Workouts: 24
- Total Duration: 18 hours
- Average Workout: 45 minutes
- Total Sets: 892
- Total Reps: 10,456
- Total Weight Lifted: 28,450 kg

## Most Frequent Exercises
1. Push-up (15 workouts)
2. Squat (12 workouts)
3. Deadlift (10 workouts)
4. Bench Press (8 workouts)
5. Pull-up (7 workouts)

## Monthly Progress
Jan 2024: 8 workouts
Dec 2023: 6 workouts
Nov 2023: 5 workouts
Oct 2023: 5 workouts

## Goals Achievement
- Completed Goals: 3/5
- Active Goals: 2
- Average Goal Completion Time: 6 weeks

---
Exported from RepFlow - Your Personal Fitness Tracker`;
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Export Your Data</h2>
            <p className="text-muted-foreground">
              Download your workout data and progress in various formats
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportOptions.map((option) => (
            <Card key={option.id} className="glass-card hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <CardTitle className="text-lg text-foreground">{option.name}</CardTitle>
                  </div>
                  {exportedFiles.has(option.id) && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <CardDescription className="text-sm">
                  {option.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Est. Size:</span>
                  <Badge variant="outline">{option.size}</Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Includes:</p>
                  <div className="flex flex-wrap gap-1">
                    {option.dataTypes.map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleExport(option)}
                  disabled={isExporting === option.id}
                  className="w-full"
                  variant={exportedFiles.has(option.id) ? "outline" : "default"}
                >
                  {isExporting === option.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                      Exporting...
                    </>
                  ) : exportedFiles.has(option.id) ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Re-export
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export {option.format.toUpperCase()}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Export Tips */}
        <div className="mt-6 p-4 glass rounded-lg">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Export Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CSV files work great with Excel, Google Sheets, and other spreadsheet apps</li>
                <li>• JSON format is perfect for developers or importing into other fitness apps</li>
                <li>• Text reports provide a human-readable summary of your progress</li>
                <li>• All exports include data from the last 12 months by default</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 