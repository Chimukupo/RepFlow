import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Activity,
  Apple,
  Zap,
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BookOpen,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBMIStats } from '@/hooks/useBMIHistory';

interface HealthRecommendationsProps {
  className?: string;
}

interface Recommendation {
  id: string;
  category: 'exercise' | 'nutrition' | 'lifestyle' | 'medical';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  icon: React.ComponentType<{ className?: string }>;
  estimatedTimeframe: string;
}

export const HealthRecommendations: React.FC<HealthRecommendationsProps> = ({ className }) => {
  const { userProfile } = useAuth();
  const { data: bmiStats } = useBMIStats();

  // Get current BMI category
  const currentCategory = bmiStats?.current_category;
  const currentBMI = bmiStats?.current_bmi;

  // Generate personalized recommendations based on BMI category and user data
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    if (!currentCategory || !currentBMI) {
      return [{
        id: 'get-started',
        category: 'lifestyle',
        priority: 'high',
        title: 'Start Your Health Journey',
        description: 'Calculate your BMI first to get personalized health recommendations.',
        actionItems: [
          'Navigate to the Calculator tab',
          'Enter your height and weight',
          'Save your first BMI entry',
          'Return here for personalized advice'
        ],
        icon: Target,
        estimatedTimeframe: '2 minutes'
      }];
    }

    // BMI-specific recommendations
    switch (currentCategory) {
      case 'underweight':
        recommendations.push(
          {
            id: 'healthy-weight-gain',
            category: 'nutrition',
            priority: 'high',
            title: 'Healthy Weight Gain Strategy',
            description: 'Focus on nutrient-dense foods and strength training to build healthy muscle mass.',
            actionItems: [
              'Increase caloric intake by 300-500 calories per day',
              'Eat protein-rich foods (lean meats, eggs, legumes)',
              'Include healthy fats (nuts, avocados, olive oil)',
              'Eat frequent, smaller meals throughout the day',
              'Consider protein shakes between meals'
            ],
            icon: TrendingUp,
            estimatedTimeframe: '2-6 months'
          },
          {
            id: 'strength-training',
            category: 'exercise',
            priority: 'high',
            title: 'Build Muscle with Strength Training',
            description: 'Resistance training helps build lean muscle mass and improve overall strength.',
            actionItems: [
              'Start with 2-3 strength training sessions per week',
              'Focus on compound movements (squats, deadlifts, push-ups)',
              'Use progressive overload - gradually increase weight/reps',
              'Allow 48 hours rest between training same muscle groups',
              'Consider working with a personal trainer initially'
            ],
            icon: Activity,
            estimatedTimeframe: '4-12 weeks to see results'
          }
        );
        break;

      case 'normal_weight':
        recommendations.push(
          {
            id: 'maintain-healthy-weight',
            category: 'lifestyle',
            priority: 'medium',
            title: 'Maintain Your Healthy Weight',
            description: 'Great job! Focus on maintaining your current healthy lifestyle.',
            actionItems: [
              'Continue regular physical activity (150 min/week moderate exercise)',
              'Maintain a balanced diet with variety',
              'Monitor your weight monthly',
              'Stay hydrated (8-10 glasses of water daily)',
              'Get 7-9 hours of quality sleep'
            ],
            icon: CheckCircle,
            estimatedTimeframe: 'Ongoing'
          },
          {
            id: 'fitness-optimization',
            category: 'exercise',
            priority: 'medium',
            title: 'Optimize Your Fitness',
            description: 'Take your fitness to the next level with varied training approaches.',
            actionItems: [
              'Mix cardio and strength training',
              'Try new activities to prevent boredom',
              'Set performance-based goals (not just weight)',
              'Track your workouts for progressive improvement',
              'Consider sports or group fitness classes'
            ],
            icon: Zap,
            estimatedTimeframe: '4-8 weeks per new goal'
          }
        );
        break;

      case 'overweight':
        recommendations.push(
          {
            id: 'gradual-weight-loss',
            category: 'nutrition',
            priority: 'high',
            title: 'Sustainable Weight Loss',
            description: 'Create a moderate caloric deficit through diet and exercise for healthy weight loss.',
            actionItems: [
              'Aim for 1-2 pounds weight loss per week',
              'Create a 500-750 calorie daily deficit',
              'Focus on whole foods, limit processed foods',
              'Practice portion control',
              'Keep a food diary to track intake'
            ],
            icon: Apple,
            estimatedTimeframe: '3-6 months'
          },
          {
            id: 'cardio-strength-combo',
            category: 'exercise',
            priority: 'high',
            title: 'Cardio + Strength Training',
            description: 'Combine cardiovascular exercise with strength training for optimal results.',
            actionItems: [
              'Start with 150 minutes moderate cardio per week',
              'Add 2-3 strength training sessions',
              'Try interval training for efficiency',
              'Include daily walks or active breaks',
              'Gradually increase exercise intensity'
            ],
            icon: Heart,
            estimatedTimeframe: '6-12 weeks to establish routine'
          }
        );
        break;

      case 'obese_class_1':
      case 'obese_class_2':
      case 'obese_class_3':
        recommendations.push(
          {
            id: 'medical-consultation',
            category: 'medical',
            priority: 'high',
            title: 'Consult Healthcare Provider',
            description: 'Work with medical professionals for a comprehensive weight management plan.',
            actionItems: [
              'Schedule appointment with your doctor',
              'Discuss weight loss medications if appropriate',
              'Get blood work to check for related conditions',
              'Consider referral to registered dietitian',
              'Explore medically supervised programs'
            ],
            icon: AlertTriangle,
            estimatedTimeframe: '1-2 weeks to schedule'
          },
          {
            id: 'gentle-start',
            category: 'exercise',
            priority: 'high',
            title: 'Start with Low-Impact Exercise',
            description: 'Begin with gentle, joint-friendly activities to build fitness safely.',
            actionItems: [
              'Start with 10-15 minutes of walking daily',
              'Try swimming or water aerobics',
              'Use seated or chair exercises',
              'Focus on consistency over intensity',
              'Gradually increase duration before intensity'
            ],
            icon: Clock,
            estimatedTimeframe: '2-4 weeks to build habit'
          }
        );
        break;
    }

    // Universal recommendations based on user profile and trends
    if (bmiStats?.trend === 'increasing' && currentCategory !== 'underweight') {
      recommendations.push({
        id: 'weight-trend-alert',
        category: 'lifestyle',
        priority: 'medium',
        title: 'Address Weight Gain Trend',
        description: 'Your weight has been trending upward. Take action now to prevent further gain.',
        actionItems: [
          'Review your recent diet and activity changes',
          'Identify triggers for increased eating',
          'Increase daily physical activity',
          'Consider tracking food intake for a week',
          'Set small, achievable weekly goals'
        ],
        icon: TrendingUp,
        estimatedTimeframe: '1-2 weeks to identify patterns'
      });
    }

    // Age-specific recommendations
    if (userProfile?.age && userProfile.age >= 40) {
        recommendations.push({
          id: 'age-specific-health',
          category: 'medical',
          priority: 'medium',
          title: 'Age-Appropriate Health Screening',
          description: 'Regular health screenings become more important as we age.',
          actionItems: [
            'Annual physical examination',
            'Blood pressure and cholesterol checks',
            'Bone density screening (especially for women)',
            'Regular eye and dental checkups',
            'Consider vitamin D and B12 levels'
          ],
          icon: Heart,
          estimatedTimeframe: 'Schedule annually'
        });
    }

    // Fitness goals integration
    if (userProfile?.fitnessGoals?.includes('weight_loss') && currentCategory !== 'underweight') {
      recommendations.push({
        id: 'weight-loss-optimization',
        category: 'nutrition',
        priority: 'medium',
        title: 'Optimize for Weight Loss Goal',
        description: 'Align your nutrition strategy with your weight loss objectives.',
        actionItems: [
          'Calculate your Total Daily Energy Expenditure (TDEE)',
          'Create a sustainable 20% caloric deficit',
          'Prioritize protein (0.8-1g per pound body weight)',
          'Time your meals around workouts',
          'Consider intermittent fasting if suitable'
        ],
        icon: Target,
        estimatedTimeframe: '2-4 weeks to optimize'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const recommendations = generateRecommendations();

  const getCategoryInfo = (category: Recommendation['category']) => {
    switch (category) {
      case 'exercise':
        return { color: 'bg-blue-100 text-blue-800', label: 'Exercise' };
      case 'nutrition':
        return { color: 'bg-green-100 text-green-800', label: 'Nutrition' };
      case 'lifestyle':
        return { color: 'bg-purple-100 text-purple-800', label: 'Lifestyle' };
      case 'medical':
        return { color: 'bg-red-100 text-red-800', label: 'Medical' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'General' };
    }
  };

  const getPriorityInfo = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return { color: 'bg-red-100 text-red-800', label: 'High Priority' };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Priority' };
      case 'low':
        return { color: 'bg-gray-100 text-gray-800', label: 'Low Priority' };
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-8 h-8 text-blue-600" />
            Health Recommendations
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Personalized advice based on your BMI and health profile
          </p>
        </div>
      </div>

      {/* Current Status Summary */}
      {currentBMI && currentCategory && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Current Status</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>BMI: <strong>{currentBMI.toFixed(1)}</strong></span>
                  <span>•</span>
                  <span>Category: <strong className="capitalize">{currentCategory.replace('_', ' ')}</strong></span>
                  {bmiStats?.trend && (
                    <>
                      <span>•</span>
                      <span>Trend: <strong className="capitalize">{bmiStats.trend}</strong></span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Recommendations</p>
                <p className="text-2xl font-bold text-blue-600">{recommendations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((recommendation) => {
          const categoryInfo = getCategoryInfo(recommendation.category);
          const priorityInfo = getPriorityInfo(recommendation.priority);
          const IconComponent = recommendation.icon;

          return (
            <Card key={recommendation.id} className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {recommendation.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge className={categoryInfo.color}>
                    {categoryInfo.label}
                  </Badge>
                  <Badge className={priorityInfo.color}>
                    {priorityInfo.label}
                  </Badge>
                  <span className="text-xs text-gray-500 ml-auto">
                    {recommendation.estimatedTimeframe}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Action Steps:
                  </h4>
                  <ul className="space-y-2">
                    {recommendation.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Additional Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">📚 Educational</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• WHO BMI Classification Guidelines</li>
                <li>• Healthy Eating Plate (Harvard)</li>
                <li>• Physical Activity Guidelines</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">🏥 Professional Help</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Find a Registered Dietitian</li>
                <li>• Certified Personal Trainers</li>
                <li>• Medical Weight Management</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">📱 Tools & Apps</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• RepFlow Workout Builder</li>
                <li>• BMI Calculator & Tracker</li>
                <li>• Progress Analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Take Action Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" className="gap-2">
              <Target className="w-4 h-4" />
              Set Health Goals
            </Button>
            <Button variant="outline" className="gap-2">
              <Activity className="w-4 h-4" />
              Plan Workout
            </Button>
            <Button variant="outline" className="gap-2">
              <Apple className="w-4 h-4" />
              Track Nutrition
            </Button>
            <Button variant="outline" className="gap-2">
              <Heart className="w-4 h-4" />
              Schedule Checkup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 