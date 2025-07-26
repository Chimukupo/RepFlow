import React, { useState, useMemo } from 'react';
import { Search, Filter, Zap, Dumbbell, Target, Users, Clock, TrendingUp, Star } from 'lucide-react';
import { 
  EXERCISES, 
  searchExercises 
} from 'shared/data/exercises';
import type { Exercise, ExerciseCategory, DifficultyLevel, EquipmentType } from 'shared/data/exercise-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMuscleGroupImages } from '@/hooks/useMuscleGroupImage';
import { ExerciseDetailModal } from './ExerciseDetailModal';

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
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState<Exercise | null>(null);

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

  // Get muscle group images for visible exercises
  const muscleImages = useMuscleGroupImages(filteredExercises, '70,130,180');

  const handleExerciseClick = (exercise: Exercise) => {
    if (onExerciseSelect) {
      onExerciseSelect(exercise);
    }
  };

  const handleExerciseDetailClick = (exercise: Exercise, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click from firing
    setSelectedExerciseForDetail(exercise);
  };

  const isSelected = (exercise: Exercise) => {
    return selectedExercises.some(selected => selected.id === exercise.id);
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
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredExercises.map((exercise) => {
          const muscleImage = muscleImages[exercise.id];
          
          // Get category icon and color
          const getCategoryIcon = (category: ExerciseCategory) => {
            switch (category) {
              case 'strength': return <Dumbbell className="w-4 h-4" />;
              case 'cardio': return <Zap className="w-4 h-4" />;
              case 'flexibility': return <Target className="w-4 h-4" />;
              case 'balance': return <TrendingUp className="w-4 h-4" />;
              case 'sports': return <Users className="w-4 h-4" />;
              default: return <Dumbbell className="w-4 h-4" />;
            }
          };

          const getCategoryColor = (category: ExerciseCategory) => {
            switch (category) {
              case 'strength': return 'text-blue-600 bg-blue-50 border-blue-200';
              case 'cardio': return 'text-red-600 bg-red-50 border-red-200';
              case 'flexibility': return 'text-green-600 bg-green-50 border-green-200';
              case 'balance': return 'text-purple-600 bg-purple-50 border-purple-200';
              case 'sports': return 'text-orange-600 bg-orange-50 border-orange-200';
              default: return 'text-gray-600 bg-gray-50 border-gray-200';
            }
          };

          const getEnhancedDifficultyColor = (difficulty: DifficultyLevel) => {
            switch (difficulty) {
              case 'beginner': return 'text-green-700 bg-green-100 border-green-300';
              case 'intermediate': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
              case 'advanced': return 'text-red-700 bg-red-100 border-red-300';
              default: return 'text-gray-700 bg-gray-100 border-gray-300';
            }
          };
          
          return (
            <Card 
              key={exercise.id} 
              className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${
                isSelected(exercise) 
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleExerciseClick(exercise)}
            >
              <CardHeader className="pb-3 relative">
                {/* Category Icon Badge */}
                <div className={`absolute top-4 right-4 p-2 rounded-full border ${getCategoryColor(exercise.category)}`}>
                  {getCategoryIcon(exercise.category)}
                </div>

                <div className="pr-12">
                  <CardTitle className="text-lg font-bold leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                    {exercise.name}
                  </CardTitle>
                  
                  {/* Difficulty and Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`text-xs font-medium border ${getEnhancedDifficultyColor(exercise.difficulty)}`}>
                      {exercise.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium text-gray-600">4.5</span>
                    </div>
                  </div>
                  
                  <CardDescription className="text-sm text-gray-600 line-clamp-2">
                    {exercise.description}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                {/* Enhanced Muscle Group Visualization */}
                <div className="flex justify-center">
                  <div className="relative w-24 h-32 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 overflow-hidden shadow-inner">
                    {muscleImage?.isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                      </div>
                    )}
                    
                    {muscleImage?.imageUrl && (
                      <img
                        src={muscleImage.imageUrl}
                        alt={`${exercise.name} muscle groups`}
                        className="w-full h-full object-contain transition-transform group-hover:scale-105"
                        onError={(e) => {
                          console.error('Failed to load muscle image:', e);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    
                    {muscleImage?.error && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-gray-400 p-2 text-center">
                        <Target className="w-6 h-6 mb-1" />
                        <span>Image unavailable</span>
                      </div>
                    )}
                    
                    {!muscleImage && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                        <div className="animate-pulse flex flex-col items-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full mb-2"></div>
                          <span>Loading...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-500 mb-1">Primary</div>
                    <div className="text-sm font-bold text-gray-900">{exercise.primaryMuscles.length}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-500 mb-1">Equipment</div>
                    <div className="text-sm font-bold text-gray-900">{exercise.equipment.length}</div>
                  </div>
                </div>

                {/* Primary Muscles - Compact */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Primary Muscles
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.primaryMuscles.slice(0, 3).map(muscle => (
                      <Badge key={muscle} variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-800 border-blue-200">
                        {muscle}
                      </Badge>
                    ))}
                    {exercise.primaryMuscles.length > 3 && (
                      <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-600">
                        +{exercise.primaryMuscles.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Equipment - Compact */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Dumbbell className="w-3 h-3" />
                    Equipment
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.equipment.slice(0, 2).map(eq => (
                      <Badge key={eq} variant="outline" className="text-xs px-2 py-1 border-gray-300 text-gray-700">
                        {eq}
                      </Badge>
                    ))}
                    {exercise.equipment.length > 2 && (
                      <Badge variant="outline" className="text-xs px-2 py-1 border-gray-300 text-gray-600">
                        +{exercise.equipment.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Target Reps with Icon */}
                {exercise.targetReps && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-800">
                      Target: {exercise.targetReps.min}-{exercise.targetReps.max} reps
                    </span>
                  </div>
                )}

                {/* Enhanced Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={(e) => handleExerciseDetailClick(exercise, e)}
                    variant="outline"
                    size="sm"
                    className="flex-1 group-hover:border-blue-300 group-hover:text-blue-600 transition-colors"
                  >
                    <Target className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                  {isSelected(exercise) && (
                    <div className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-600 rounded-md">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  )}
                </div>
              </CardContent>
           </Card>
           );
         })}
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

       {/* Exercise Detail Modal */}
       <ExerciseDetailModal
         exercise={selectedExerciseForDetail}
         isOpen={!!selectedExerciseForDetail}
         onClose={() => setSelectedExerciseForDetail(null)}
       />
     </div>
   );
}; 