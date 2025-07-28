import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { Textarea } from '@/components/ui/textarea';
import {
  Calculator,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Heart,
  Activity,
  Calendar,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { useBMIHistory, useCreateBMIEntry, useBMIStats } from '@/hooks/useBMIHistory';
import { useAuth } from '@/contexts/AuthContext';
import { calculateBMI, getBMICategory } from 'shared/schemas/bmi-history';
import type { BMICategory } from 'shared/schemas/bmi-history';
import type { Units } from 'shared/schemas/profile';
import { HealthRecommendations } from './HealthRecommendations';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BMICalculatorProps {
  className?: string;
}

export const BMICalculator: React.FC<BMICalculatorProps> = ({ className }) => {
  const { userProfile } = useAuth();
  const [height, setHeight] = useState(userProfile?.height?.toString() || '');
  const [weight, setWeight] = useState(userProfile?.weight?.toString() || '');
  const [units, setUnits] = useState<Units>('metric');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch BMI data
  const { data: bmiHistory = [], isLoading } = useBMIHistory();
  const { data: bmiStats } = useBMIStats();
  const createBMIEntry = useCreateBMIEntry();

  // Calculate current BMI
  const currentBMI = useMemo(() => {
    if (!height || !weight) return null;
    
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    
    if (isNaN(heightNum) || isNaN(weightNum) || heightNum <= 0 || weightNum <= 0) {
      return null;
    }
    
    return calculateBMI(weightNum, heightNum, units);
  }, [height, weight, units]);

  const currentCategory = useMemo(() => {
    if (!currentBMI) return null;
    return getBMICategory(currentBMI);
  }, [currentBMI]);

  // Get BMI category info
  const getBMICategoryInfo = (category: BMICategory) => {
    switch (category) {
      case 'underweight':
        return {
          label: 'Underweight',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          icon: TrendingDown,
          description: 'Below normal weight range',
          range: '< 18.5',
          recommendation: 'Consider consulting with a healthcare provider about healthy weight gain strategies.'
        };
      case 'normal_weight':
        return {
          label: 'Normal Weight',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          icon: CheckCircle,
          description: 'Healthy weight range',
          range: '18.5 - 24.9',
          recommendation: 'Great job! Maintain your current lifestyle with regular exercise and balanced nutrition.'
        };
      case 'overweight':
        return {
          label: 'Overweight',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          borderColor: 'border-orange-200',
          icon: TrendingUp,
          description: 'Above normal weight range',
          range: '25.0 - 29.9',
          recommendation: 'Consider incorporating more physical activity and reviewing your nutrition with a healthcare provider.'
        };
      case 'obese_class_1':
      case 'obese_class_2':
      case 'obese_class_3':
        return {
          label: 'Obese',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          icon: AlertCircle,
          description: 'Significantly above normal weight',
          range: '≥ 30.0',
          recommendation: 'Consult with a healthcare provider for a comprehensive weight management plan.'
        };
      default:
        return {
          label: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          icon: Minus,
          description: 'BMI category not determined',
          range: 'N/A',
          recommendation: 'Enter your height and weight to calculate BMI.'
        };
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!height.trim()) {
      newErrors.height = 'Height is required';
    } else if (isNaN(parseFloat(height)) || parseFloat(height) <= 0) {
      newErrors.height = 'Please enter a valid height';
    } else {
      const heightNum = parseFloat(height);
      if (units === 'metric' && (heightNum < 50 || heightNum > 300)) {
        newErrors.height = 'Height must be between 50-300 cm';
      } else if (units === 'imperial' && (heightNum < 20 || heightNum > 120)) {
        newErrors.height = 'Height must be between 20-120 inches';
      }
    }

    if (!weight.trim()) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(parseFloat(weight)) || parseFloat(weight) <= 0) {
      newErrors.weight = 'Please enter a valid weight';
    } else {
      const weightNum = parseFloat(weight);
      if (units === 'metric' && (weightNum < 20 || weightNum > 500)) {
        newErrors.weight = 'Weight must be between 20-500 kg';
      } else if (units === 'imperial' && (weightNum < 44 || weightNum > 1100)) {
        newErrors.weight = 'Weight must be between 44-1100 lbs';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle BMI entry save
  const handleSaveBMI = async () => {
    if (!validateForm() || !currentBMI) return;

    try {
      await createBMIEntry.mutateAsync({
        weight: parseFloat(weight),
        height: parseFloat(height),
        units,
        notes: notes.trim() || undefined,
        source: 'manual',
        recorded_at: new Date()
      });
      
      setNotes('');
      // Success feedback could be added here
    } catch (error) {
      console.error('Error saving BMI entry:', error);
    }
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!bmiHistory.length) return null;

    const sortedHistory = [...bmiHistory]
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .slice(-12); // Last 12 entries

    return {
      labels: sortedHistory.map(entry => 
        new Date(entry.recorded_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      ),
      datasets: [
        {
          label: 'BMI',
          data: sortedHistory.map(entry => entry.bmi),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Weight',
          data: sortedHistory.map(entry => entry.weight),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y1',
        }
      ]
    };
  }, [bmiHistory]);

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'BMI & Weight Trends'
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'BMI'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: `Weight (${units === 'metric' ? 'kg' : 'lbs'})`
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const categoryInfo = currentCategory ? getBMICategoryInfo(currentCategory) : getBMICategoryInfo('normal_weight');
  const IconComponent = categoryInfo.icon;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="w-8 h-8 text-primary" />
            BMI Calculator
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Calculate and track your Body Mass Index over time
          </p>
        </div>
      </div>

      {/* Main Content */}
             <Tabs defaultValue="calculator" className="space-y-4">
         <TabsList className="grid w-full grid-cols-4">
           <TabsTrigger value="calculator" className="flex items-center gap-2">
             <Calculator className="w-4 h-4" />
             <span className="hidden sm:inline">Calculator</span>
           </TabsTrigger>
           <TabsTrigger value="history" className="flex items-center gap-2">
             <Calendar className="w-4 h-4" />
             <span className="hidden sm:inline">History</span>
           </TabsTrigger>
           <TabsTrigger value="trends" className="flex items-center gap-2">
             <BarChart3 className="w-4 h-4" />
             <span className="hidden sm:inline">Trends</span>
           </TabsTrigger>
           <TabsTrigger value="recommendations" className="flex items-center gap-2">
             <Lightbulb className="w-4 h-4" />
             <span className="hidden sm:inline">Advice</span>
           </TabsTrigger>
         </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  Enter Your Measurements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Units Selection */}
                <div>
                  <Label>Units</Label>
                  <Select value={units} onValueChange={(value: Units) => setUnits(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                      <SelectItem value="imperial">Imperial (in, lbs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Height Input */}
                <div>
                  <Label htmlFor="height">
                    Height {units === 'metric' ? '(cm)' : '(inches)'} *
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => {
                      setHeight(e.target.value);
                      if (errors.height) setErrors(prev => ({ ...prev, height: '' }));
                    }}
                    placeholder={units === 'metric' ? 'e.g., 175' : 'e.g., 69'}
                    className={errors.height ? 'border-red-500' : ''}
                  />
                  {errors.height && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.height}
                    </p>
                  )}
                </div>

                {/* Weight Input */}
                <div>
                  <Label htmlFor="weight">
                    Weight {units === 'metric' ? '(kg)' : '(lbs)'} *
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => {
                      setWeight(e.target.value);
                      if (errors.weight) setErrors(prev => ({ ...prev, weight: '' }));
                    }}
                    placeholder={units === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                    className={errors.weight ? 'border-red-500' : ''}
                  />
                  {errors.weight && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.weight}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this measurement..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Save Button */}
                <Button 
                  onClick={handleSaveBMI}
                  disabled={!currentBMI || createBMIEntry.isPending}
                  className="w-full gap-2"
                >
                  {createBMIEntry.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      Save BMI Entry
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* BMI Result */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Your BMI Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentBMI ? (
                  <>
                    {/* BMI Value */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {currentBMI.toFixed(1)}
                      </div>
                      <Badge className={`${categoryInfo.bgColor} ${categoryInfo.color} ${categoryInfo.borderColor} text-sm px-3 py-1`}>
                        <IconComponent className="w-4 h-4 mr-1" />
                        {categoryInfo.label}
                      </Badge>
                    </div>

                    {/* Category Description */}
                    <div className={`p-4 rounded-lg ${categoryInfo.bgColor} ${categoryInfo.borderColor} border`}>
                      <h4 className={`font-semibold ${categoryInfo.color} mb-2`}>
                        {categoryInfo.description}
                      </h4>
                      <p className="text-sm text-gray-700 mb-3">
                        BMI Range: <strong>{categoryInfo.range}</strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        {categoryInfo.recommendation}
                      </p>
                    </div>

                    {/* BMI Categories Reference */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">BMI Categories</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Underweight</span>
                          <span className="text-blue-600">Below 18.5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Normal weight</span>
                          <span className="text-green-600">18.5 - 24.9</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overweight</span>
                          <span className="text-orange-600">25.0 - 29.9</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Obese</span>
                          <span className="text-red-600">30.0 and above</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Calculate Your BMI</h3>
                    <p className="text-gray-600">
                      Enter your height and weight to calculate your Body Mass Index
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {bmiHistory.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No BMI History</h3>
                  <p className="text-gray-600 mb-4">
                    Start tracking your BMI by calculating and saving your first entry
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Quick Stats */}
              {bmiStats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Current BMI</p>
                          <p className="text-2xl font-bold text-gray-900">{bmiStats.current_bmi?.toFixed(1)}</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Weight Change</p>
                          <p className={`text-2xl font-bold ${(bmiStats.weight_change || 0) >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            {(bmiStats.weight_change || 0) >= 0 ? '+' : ''}{bmiStats.weight_change?.toFixed(1)}
                          </p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Scale className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Average BMI</p>
                          <p className="text-2xl font-bold text-gray-900">{bmiStats.average_bmi?.toFixed(1)}</p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Entries</p>
                          <p className="text-2xl font-bold text-gray-900">{bmiStats.total_entries}</p>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* History List */}
              <Card>
                <CardHeader>
                  <CardTitle>BMI History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bmiHistory.slice(0, 10).map((entry) => {
                      const entryInfo = getBMICategoryInfo(entry.category);
                      const EntryIcon = entryInfo.icon;
                      
                      return (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${entryInfo.bgColor}`}>
                              <EntryIcon className={`w-4 h-4 ${entryInfo.color}`} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                BMI: {entry.bmi.toFixed(1)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {entry.weight} {entry.units === 'metric' ? 'kg' : 'lbs'} • {new Date(entry.recorded_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge className={`${entryInfo.bgColor} ${entryInfo.color} ${entryInfo.borderColor}`}>
                            {entryInfo.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

                 {/* Trends Tab */}
         <TabsContent value="trends" className="space-y-4">
           {chartData ? (
             <Card>
               <CardHeader>
                 <CardTitle>BMI & Weight Trends</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="h-64">
                   <Line data={chartData} options={chartOptions} />
                 </div>
               </CardContent>
             </Card>
           ) : (
             <Card>
               <CardContent className="p-8">
                 <div className="text-center">
                   <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                   <h3 className="text-lg font-semibold mb-2">No Data for Trends</h3>
                   <p className="text-gray-600">
                     Add more BMI entries to see your trends over time
                   </p>
                 </div>
               </CardContent>
             </Card>
           )}
         </TabsContent>

         {/* Recommendations Tab */}
         <TabsContent value="recommendations" className="space-y-4">
           <HealthRecommendations />
         </TabsContent>
       </Tabs>
     </div>
   );
}; 