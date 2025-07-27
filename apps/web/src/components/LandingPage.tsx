import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Target, 
  TrendingUp, 
  Users, 
  Calendar,
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  Dumbbell,
  Heart,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Target,
      title: "Smart Workout Builder",
      description: "AI-powered exercise recommendations tailored to your goals",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Track your progress with detailed insights and performance metrics",
      color: "from-gray-600 to-gray-700"
    },
    {
      icon: Calendar,
      title: "Weekly Planning",
      description: "Schedule and organize your fitness journey with intelligent planning",
      color: "from-green-500 to-green-600"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users", icon: Users },
    { number: "500+", label: "Exercises", icon: Dumbbell },
    { number: "95%", label: "Success Rate", icon: TrendingUp },
    { number: "24/7", label: "Support", icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-foreground overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 dark:opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gray-500/10 dark:bg-gray-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-500/10 dark:bg-green-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                RepFlow
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors duration-200">Features</a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors duration-200">About</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors duration-200">Pricing</a>
              <Button 
                onClick={onGetStarted}
                className="px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                <span className="text-foreground">
                  Breathe
                </span>
                <br />
                <span className="text-muted-foreground">
                  Train
                </span>
                <br />
                <span className="text-primary">
                  Conquer
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Transform your fitness journey with AI-powered workouts, 
                real-time progress tracking, and personalized health insights.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className="px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <Button 
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 rounded-2xl text-lg glass transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Feature Cards */}
      <section className="relative z-10 -mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={index}
                  className={`glass-card hover:shadow-lg transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                    activeFeature === index ? 'ring-2 ring-primary/50 shadow-xl' : ''
                  }`}
                >
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
                    <IconComponent className="w-8 h-8 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold text-foreground mb-2">{stat.number}</div>
                    <div className="text-muted-foreground text-sm">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section id="about" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Built for <span className="text-primary">Champions</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature designed to push your limits and unlock your potential
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Breathe</h3>
              <p className="text-muted-foreground leading-relaxed">
                Mindful preparation and mental clarity before every workout. 
                Focus your mind, center your energy.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Train</h3>
              <p className="text-muted-foreground leading-relaxed">
                Intelligent workouts that adapt to your progress. 
                Push boundaries with data-driven precision.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Conquer</h3>
              <p className="text-muted-foreground leading-relaxed">
                Achieve your goals and surpass your limits. 
                Transform challenges into victories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="glass-card rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to <span className="text-primary">Transform</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of athletes who've revolutionized their training with RepFlow
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Start Free Trial
                <CheckCircle className="ml-2 w-5 h-5" />
              </Button>
              
              <div className="flex items-center justify-center text-muted-foreground text-sm">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border glass-nav">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center subtle-glow">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                RepFlow
              </span>
            </div>
            <p className="text-muted-foreground mb-6">
              Breathe. Train. Conquer.
            </p>
            <div className="flex justify-center space-x-8 text-muted-foreground text-sm">
              <a href="#" className="hover:text-foreground transition-colors duration-200">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors duration-200">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors duration-200">Support</a>
            </div>
            <div className="mt-8 text-muted-foreground text-sm">
              © 2024 RepFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}; 