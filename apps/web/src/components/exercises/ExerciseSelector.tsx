import React, { useState, useMemo } from 'react';
import { Search, Filter, Zap, Dumbbell, Target, Users } from 'lucide-react';
import { 
  EXERCISES, 
  searchExercises 
} from 'shared/data/exercises';
import type { Exercise, ExerciseCategory, DifficultyLevel, EquipmentType } from 'shared/data/exercise-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ExerciseSelectorProps {
  onExerciseSelect?: (exercise: Exercise) => void;
  selectedExercises?: Exercise[];
  multiSelect?: boolean;
  showMuscleGroups?: boolean;
}

interface FilterState {
  category: ExerciseCategory | 'all';
  difficulty: DifficultyLevel | 'all';
  equipment: EquipmentType | 'all';
  muscleGroup: string;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  onExerciseSelect,
  selectedExercises = [],
  showMuscleGroups = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    difficulty: 'all',
    equipment: 'all',
    muscleGroup: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filter dropdowns
  const categories = [...new Set(EXERCISES.map(e => e.category))] as ExerciseCategory[];
  const difficulties = [...new Set(EXERCISES.map(e => e.difficulty))] as DifficultyLevel[];
  const equipmentTypes = [...new Set(EXERCISES.flatMap(e => e.equipment))] as EquipmentType[];
  const muscleGroups = [...new Set(EXERCISES.flatMap(e => [...e.primaryMuscles, ...e.secondaryMuscles]))];

  // Filter exercises based on current filters and search
  const filteredExercises = useMemo(() => {
    let results = EXERCISES;

    // Apply search
    if (searchQuery.trim()) {
      results = searchExercises(searchQuery);
    }

    // Apply category filter
    if (filters.category !== 'all') {
      results = results.filter(exercise => exercise.category === filters.category);
    }

    // Apply difficulty filter
    if (filters.difficulty !== 'all') {
      results = results.filter(exercise => exercise.difficulty === filters.difficulty);
    }

    // Apply equipment filter
    if (filters.equipment !== 'all') {
      results = results.filter(exercise => exercise.equipment.includes(filters.equipment as EquipmentType));
    }

    // Apply muscle group filter
    if (filters.muscleGroup) {
      results = results.filter(exercise => 
        exercise.primaryMuscles.includes(filters.muscleGroup) ||
        exercise.secondaryMuscles.includes(filters.muscleGroup)
      );
    }

    return results;
  }, [searchQuery, filters]);

  const handleExerciseClick = (exercise: Exercise) => {
    if (onExerciseSelect) {
      onExerciseSelect(exercise);
    }
  };

  const isSelected = (exercise: Exercise) => {
    return selectedExercises.some(selected => selected.id === exercise.id);
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: ExerciseCategory) => {
    switch (category) {
      case 'push': return <Zap className="w-4 h-4" />;
      case 'pull': return <Target className="w-4 h-4" />;
      case 'legs': return <Dumbbell className="w-4 h-4" />;
      case 'core': return <Users className="w-4 h-4" />;
      case 'full-body': return <Users className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Exercise Library</h2>
          <p className="text-gray-600 mt-1">
            Choose from {EXERCISES.length} exercises • {filteredExercises.length} shown
          </p>
        </div>
        
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>Narrow down your exercise selection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as ExerciseCategory | 'all' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as DifficultyLevel | 'all' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipment Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment</label>
                <select
                  value={filters.equipment}
                  onChange={(e) => setFilters(prev => ({ ...prev, equipment: e.target.value as EquipmentType | 'all' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Equipment</option>
                  {equipmentTypes.map(equipment => (
                    <option key={equipment} value={equipment}>
                      {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Muscle Group Filter */}
              {showMuscleGroups && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Muscle Group</label>
                  <select
                    value={filters.muscleGroup}
                    onChange={(e) => setFilters(prev => ({ ...prev, muscleGroup: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Muscles</option>
                    {muscleGroups.sort().map(muscle => (
                      <option key={muscle} value={muscle}>
                        {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Clear Filters */}
            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={() => {
                  setFilters({
                    category: 'all',
                    difficulty: 'all',
                    equipment: 'all',
                    muscleGroup: ''
                  });
                  setSearchQuery('');
                }}
                variant="outline"
                size="sm"
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <Card 
            key={exercise.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              isSelected(exercise) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
            }`}
            onClick={() => handleExerciseClick(exercise)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(exercise.category)}
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                </div>
                <Badge className={getDifficultyColor(exercise.difficulty)}>
                  {exercise.difficulty}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {exercise.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Primary Muscles */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Primary Muscles</p>
                <div className="flex flex-wrap gap-1">
                  {exercise.primaryMuscles.map(muscle => (
                    <Badge key={muscle} variant="secondary" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Equipment</p>
                <div className="flex flex-wrap gap-1">
                  {exercise.equipment.map(eq => (
                    <Badge key={eq} variant="outline" className="text-xs">
                      {eq}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Target Reps */}
              {exercise.targetReps && (
                <div className="text-xs text-gray-500">
                  Target: {exercise.targetReps.min}-{exercise.targetReps.max} reps
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setFilters({
                category: 'all',
                difficulty: 'all',
                equipment: 'all',
                muscleGroup: ''
              });
            }}
            variant="outline"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}; 