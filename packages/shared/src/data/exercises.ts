import type { Exercise, ExerciseDatabase } from './exercise-types';

export const EXERCISES: Exercise[] = [
  // === PUSH EXERCISES ===
  {
    id: 'push-up',
    name: 'Push-Up',
    slug: 'push-up',
    description: 'Classic bodyweight exercise targeting chest, shoulders, and triceps',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulders',
      'Lower your body until chest nearly touches the floor',
      'Push back up to starting position',
      'Keep your core tight and body in a straight line'
    ],
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['shoulders', 'core'],
    category: 'push',
    difficulty: 'beginner',
    equipment: ['bodyweight'],
    force: 'push',
    mechanic: 'compound',
    tips: [
      'Keep your core engaged throughout the movement',
      'Don\'t let your hips sag or pike up',
      'Control the descent for better muscle activation'
    ],
    variations: ['Diamond Push-Up', 'Wide-Grip Push-Up', 'Incline Push-Up', 'Decline Push-Up'],
    commonMistakes: [
      'Sagging hips',
      'Not going through full range of motion',
      'Flaring elbows too wide'
    ],
    targetReps: { min: 8, max: 20 },
    targetSets: { min: 2, max: 4 },
    restTime: { min: 60, max: 120 },
    tags: ['bodyweight', 'beginner-friendly', 'no-equipment']
  },

  {
    id: 'bench-press',
    name: 'Bench Press',
    slug: 'bench-press',
    description: 'Fundamental barbell exercise for building chest, shoulder, and tricep strength',
    instructions: [
      'Lie flat on bench with eyes under the barbell',
      'Grip bar slightly wider than shoulder-width',
      'Unrack the bar and lower it to your chest',
      'Press the bar back up to starting position'
    ],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    category: 'push',
    difficulty: 'intermediate',
    equipment: ['barbell', 'bench'],
    force: 'push',
    mechanic: 'compound',
    tips: [
      'Keep your feet flat on the floor',
      'Maintain a slight arch in your back',
      'Control the weight on the way down'
    ],
    variations: ['Incline Bench Press', 'Decline Bench Press', 'Dumbbell Bench Press'],
    targetReps: { min: 6, max: 12 },
    targetSets: { min: 3, max: 5 },
    restTime: { min: 120, max: 180 },
    tags: ['compound', 'strength', 'mass-building']
  },

  {
    id: 'shoulder-press',
    name: 'Shoulder Press',
    slug: 'shoulder-press',
    description: 'Overhead pressing movement for shoulder and tricep development',
    instructions: [
      'Stand with dumbbells at shoulder height',
      'Press weights directly overhead',
      'Lower with control back to starting position',
      'Keep core engaged throughout movement'
    ],
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'core'],
    category: 'push',
    difficulty: 'intermediate',
    equipment: ['dumbbells'],
    force: 'push',
    mechanic: 'compound',
    tips: [
      'Don\'t arch your back excessively',
      'Press in a straight line overhead',
      'Keep your core tight for stability'
    ],
    variations: ['Military Press', 'Arnold Press', 'Pike Push-Up'],
    targetReps: { min: 8, max: 15 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 90, max: 150 },
    tags: ['shoulders', 'overhead', 'functional']
  },

  // === PULL EXERCISES ===
  {
    id: 'pull-up',
    name: 'Pull-Up',
    slug: 'pull-up',
    description: 'Challenging bodyweight exercise for back and bicep development',
    instructions: [
      'Hang from pull-up bar with overhand grip',
      'Pull your body up until chin clears the bar',
      'Lower yourself back down with control',
      'Keep your core engaged throughout'
    ],
    primaryMuscles: ['back', 'latissimus'],
    secondaryMuscles: ['biceps', 'shoulders'],
    category: 'pull',
    difficulty: 'intermediate',
    equipment: ['pull-up-bar'],
    force: 'pull',
    mechanic: 'compound',
    tips: [
      'Focus on pulling with your back muscles',
      'Don\'t swing or use momentum',
      'Squeeze shoulder blades together at the top'
    ],
    variations: ['Chin-Up', 'Wide-Grip Pull-Up', 'Assisted Pull-Up'],
    targetReps: { min: 3, max: 12 },
    targetSets: { min: 3, max: 5 },
    restTime: { min: 90, max: 180 },
    tags: ['bodyweight', 'challenging', 'back-focused']
  },

  {
    id: 'bent-over-row',
    name: 'Bent-Over Row',
    slug: 'bent-over-row',
    description: 'Horizontal pulling exercise for back thickness and strength',
    instructions: [
      'Hinge at hips with slight knee bend',
      'Hold barbell with overhand grip',
      'Pull bar to lower chest/upper abdomen',
      'Lower with control and repeat'
    ],
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'shoulders'],
    category: 'pull',
    difficulty: 'intermediate',
    equipment: ['barbell'],
    force: 'pull',
    mechanic: 'compound',
    tips: [
      'Keep your back straight and core tight',
      'Pull to your lower chest, not your neck',
      'Squeeze shoulder blades together at the top'
    ],
    variations: ['Dumbbell Row', 'T-Bar Row', 'Cable Row'],
    targetReps: { min: 8, max: 12 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 90, max: 150 },
    tags: ['back-thickness', 'compound', 'strength']
  },

  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    slug: 'lat-pulldown',
    description: 'Cable exercise targeting the latissimus dorsi and upper back',
    instructions: [
      'Sit at lat pulldown machine with wide grip',
      'Pull bar down to upper chest',
      'Squeeze shoulder blades together',
      'Control the weight back up'
    ],
    primaryMuscles: ['latissimus', 'back'],
    secondaryMuscles: ['biceps', 'shoulders'],
    category: 'pull',
    difficulty: 'beginner',
    equipment: ['cable-machine'],
    force: 'pull',
    mechanic: 'compound',
    tips: [
      'Lean back slightly for better lat engagement',
      'Don\'t pull behind your neck',
      'Focus on pulling with your back, not arms'
    ],
    variations: ['Close-Grip Pulldown', 'Reverse-Grip Pulldown'],
    targetReps: { min: 10, max: 15 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 60, max: 120 },
    tags: ['machine', 'lat-focused', 'beginner-friendly']
  },

  // === LEG EXERCISES ===
  {
    id: 'squat',
    name: 'Squat',
    slug: 'squat',
    description: 'King of leg exercises targeting quads, glutes, and core',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body as if sitting back into a chair',
      'Keep your chest up and knees tracking over toes',
      'Push through heels to return to starting position'
    ],
    primaryMuscles: ['quadriceps', 'gluteus'],
    secondaryMuscles: ['hamstring', 'core', 'calfs'],
    category: 'legs',
    difficulty: 'beginner',
    equipment: ['bodyweight'],
    force: 'push',
    mechanic: 'compound',
    tips: [
      'Keep your weight on your heels',
      'Don\'t let knees cave inward',
      'Go as deep as your mobility allows'
    ],
    variations: ['Goblet Squat', 'Back Squat', 'Front Squat', 'Jump Squat'],
    targetReps: { min: 10, max: 20 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 60, max: 120 },
    tags: ['compound', 'functional', 'leg-day']
  },

  {
    id: 'deadlift',
    name: 'Deadlift',
    slug: 'deadlift',
    description: 'Full-body compound movement focusing on posterior chain',
    instructions: [
      'Stand with barbell over mid-foot',
      'Hinge at hips and grab bar with mixed or double overhand grip',
      'Drive through heels and extend hips to lift the bar',
      'Keep bar close to body throughout movement'
    ],
    primaryMuscles: ['hamstring', 'gluteus', 'back'],
    secondaryMuscles: ['quadriceps', 'core', 'forearms'],
    category: 'legs',
    difficulty: 'advanced',
    equipment: ['barbell'],
    force: 'pull',
    mechanic: 'compound',
    tips: [
      'Keep the bar close to your body',
      'Drive through your heels',
      'Keep your chest up and shoulders back'
    ],
    variations: ['Romanian Deadlift', 'Sumo Deadlift', 'Trap Bar Deadlift'],
    targetReps: { min: 5, max: 8 },
    targetSets: { min: 3, max: 5 },
    restTime: { min: 180, max: 300 },
    tags: ['compound', 'strength', 'posterior-chain']
  },

  {
    id: 'lunges',
    name: 'Lunges',
    slug: 'lunges',
    description: 'Unilateral leg exercise for balance, strength, and stability',
    instructions: [
      'Step forward into a lunge position',
      'Lower back knee toward the ground',
      'Push through front heel to return to standing',
      'Alternate legs or complete all reps on one side'
    ],
    primaryMuscles: ['quadriceps', 'gluteus'],
    secondaryMuscles: ['hamstring', 'core', 'calfs'],
    category: 'legs',
    difficulty: 'beginner',
    equipment: ['bodyweight'],
    force: 'push',
    mechanic: 'compound',
    tips: [
      'Keep most weight on your front leg',
      'Don\'t let front knee go past your toes',
      'Keep your torso upright'
    ],
    variations: ['Reverse Lunges', 'Walking Lunges', 'Lateral Lunges'],
    targetReps: { min: 10, max: 15 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 60, max: 90 },
    tags: ['unilateral', 'functional', 'balance']
  },

  // === CORE EXERCISES ===
  {
    id: 'plank',
    name: 'Plank',
    slug: 'plank',
    description: 'Isometric core exercise for building stability and endurance',
    instructions: [
      'Start in push-up position on forearms',
      'Keep body in straight line from head to heels',
      'Engage core and hold position',
      'Breathe normally while maintaining form'
    ],
    primaryMuscles: ['abs', 'core'],
    secondaryMuscles: ['shoulders', 'back'],
    category: 'core',
    difficulty: 'beginner',
    equipment: ['bodyweight'],
    force: 'static',
    mechanic: 'isolation',
    tips: [
      'Don\'t let hips sag or pike up',
      'Keep your neck in neutral position',
      'Focus on breathing while holding'
    ],
    variations: ['Side Plank', 'Plank Up-Downs', 'Plank with Leg Lifts'],
    targetReps: { min: 1, max: 1 }, // Duration-based
    targetSets: { min: 3, max: 4 },
    restTime: { min: 30, max: 60 },
    tags: ['isometric', 'core-stability', 'beginner-friendly']
  },

  {
    id: 'crunches',
    name: 'Crunches',
    slug: 'crunches',
    description: 'Classic abdominal exercise targeting the rectus abdominis',
    instructions: [
      'Lie on back with knees bent and feet flat',
      'Place hands behind head or across chest',
      'Lift shoulders off ground by contracting abs',
      'Lower back down with control'
    ],
    primaryMuscles: ['abs'],
    secondaryMuscles: ['core'],
    category: 'core',
    difficulty: 'beginner',
    equipment: ['bodyweight'],
    force: 'pull',
    mechanic: 'isolation',
    tips: [
      'Don\'t pull on your neck',
      'Focus on lifting shoulders, not just head',
      'Exhale as you crunch up'
    ],
    variations: ['Bicycle Crunches', 'Reverse Crunches', 'Russian Twists'],
    targetReps: { min: 15, max: 25 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 30, max: 60 },
    tags: ['abs-focused', 'isolation', 'classic']
  },

  // === FULL BODY EXERCISES ===
  {
    id: 'burpees',
    name: 'Burpees',
    slug: 'burpees',
    description: 'High-intensity full-body exercise combining squat, plank, and jump',
    instructions: [
      'Start standing, then squat down and place hands on floor',
      'Jump feet back into plank position',
      'Do a push-up (optional)',
      'Jump feet back to squat, then jump up with arms overhead'
    ],
    primaryMuscles: ['all'],
    secondaryMuscles: ['chest', 'shoulders', 'legs', 'core'],
    category: 'full-body',
    difficulty: 'intermediate',
    equipment: ['bodyweight'],
    force: 'push',
    mechanic: 'compound',
    tips: [
      'Land softly when jumping back',
      'Keep core tight in plank position',
      'Modify by stepping instead of jumping'
    ],
    variations: ['Half Burpees', 'Burpee Box Jumps', 'Burpee Pull-Ups'],
    targetReps: { min: 8, max: 15 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 60, max: 120 },
    tags: ['cardio', 'full-body', 'high-intensity']
  },

  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    slug: 'mountain-climbers',
    description: 'Dynamic cardio exercise targeting core, shoulders, and legs',
    instructions: [
      'Start in plank position',
      'Bring one knee toward chest',
      'Quickly switch legs in running motion',
      'Keep hips level and core engaged'
    ],
    primaryMuscles: ['core', 'shoulders', 'legs'],
    secondaryMuscles: ['chest', 'abs'],
    category: 'cardio',
    difficulty: 'intermediate',
    equipment: ['bodyweight'],
    force: 'push',
    mechanic: 'compound',
    tips: [
      'Keep your hips level',
      'Don\'t let your butt pike up',
      'Maintain plank position throughout'
    ],
    variations: ['Cross-Body Mountain Climbers', 'Slow Mountain Climbers'],
    targetReps: { min: 20, max: 40 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 30, max: 60 },
    tags: ['cardio', 'dynamic', 'core-intensive']
  },

  // === ISOLATION EXERCISES ===
  {
    id: 'bicep-curls',
    name: 'Bicep Curls',
    slug: 'bicep-curls',
    description: 'Isolation exercise targeting the biceps brachii',
    instructions: [
      'Stand with dumbbells at your sides',
      'Curl weights up by flexing biceps',
      'Keep elbows stationary at your sides',
      'Lower with control to starting position'
    ],
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    category: 'isolation',
    difficulty: 'beginner',
    equipment: ['dumbbells'],
    force: 'pull',
    mechanic: 'isolation',
    tips: [
      'Don\'t swing the weights',
      'Keep elbows pinned to your sides',
      'Control the negative portion'
    ],
    variations: ['Hammer Curls', 'Concentration Curls', 'Cable Curls'],
    targetReps: { min: 10, max: 15 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 60, max: 90 },
    tags: ['isolation', 'arm-focused', 'beginner-friendly']
  },

  {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    slug: 'tricep-dips',
    description: 'Bodyweight exercise targeting the triceps',
    instructions: [
      'Sit on edge of bench with hands beside hips',
      'Slide off bench supporting weight with arms',
      'Lower body by bending elbows',
      'Push back up to starting position'
    ],
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest', 'shoulders'],
    category: 'push',
    difficulty: 'intermediate',
    equipment: ['bench'],
    force: 'push',
    mechanic: 'compound',
    tips: [
      'Keep elbows close to your body',
      'Don\'t go too low if you feel shoulder discomfort',
      'Keep your core engaged'
    ],
    variations: ['Assisted Tricep Dips', 'Feet-Elevated Dips'],
    targetReps: { min: 8, max: 15 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 60, max: 120 },
    tags: ['bodyweight', 'tricep-focused', 'functional']
  },

  {
    id: 'calf-raises',
    name: 'Calf Raises',
    slug: 'calf-raises',
    description: 'Isolation exercise for calf muscle development',
    instructions: [
      'Stand with balls of feet on elevated surface',
      'Let heels drop below the level of your toes',
      'Rise up onto toes as high as possible',
      'Lower back down with control'
    ],
    primaryMuscles: ['calfs'],
    secondaryMuscles: [],
    category: 'isolation',
    difficulty: 'beginner',
    equipment: ['bodyweight'],
    force: 'push',
    mechanic: 'isolation',
    tips: [
      'Get a full stretch at the bottom',
      'Rise up as high as possible',
      'Control the movement both ways'
    ],
    variations: ['Single-Leg Calf Raises', 'Seated Calf Raises'],
    targetReps: { min: 15, max: 25 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 30, max: 60 },
    tags: ['isolation', 'calf-focused', 'simple']
  }
];

// Exercise database with metadata
export const EXERCISE_DATABASE: ExerciseDatabase = {
  exercises: EXERCISES,
  categories: [
    {
      id: 'push',
      name: 'Push',
      description: 'Exercises that involve pushing movements',
      icon: '💪'
    },
    {
      id: 'pull', 
      name: 'Pull',
      description: 'Exercises that involve pulling movements',
      icon: '🔙'
    },
    {
      id: 'legs',
      name: 'Legs',
      description: 'Lower body exercises',
      icon: '🦵'
    },
    {
      id: 'core',
      name: 'Core',
      description: 'Abdominal and core stability exercises',
      icon: '🎯'
    },
    {
      id: 'cardio',
      name: 'Cardio',
      description: 'Cardiovascular and conditioning exercises',
      icon: '❤️'
    },
    {
      id: 'full-body',
      name: 'Full Body',
      description: 'Exercises that work multiple muscle groups',
      icon: '🏋️'
    },
    {
      id: 'isolation',
      name: 'Isolation',
      description: 'Exercises targeting specific muscles',
      icon: '🎯'
    },
    {
      id: 'compound',
      name: 'Compound',
      description: 'Multi-joint exercises working multiple muscles',
      icon: '🏋️‍♂️'
    }
  ],
  equipment: [
    {
      id: 'bodyweight',
      name: 'Bodyweight',
      description: 'No equipment needed',
      icon: '🤸'
    },
    {
      id: 'dumbbells',
      name: 'Dumbbells',
      description: 'Free weight dumbbells',
      icon: '🏋️'
    },
    {
      id: 'barbell',
      name: 'Barbell',
      description: 'Olympic barbell',
      icon: '🏋️‍♂️'
    },
    {
      id: 'bench',
      name: 'Bench',
      description: 'Weight bench',
      icon: '🪑'
    },
    {
      id: 'pull-up-bar',
      name: 'Pull-Up Bar',
      description: 'Pull-up or chin-up bar',
      icon: '🏗️'
    },
    {
      id: 'cable-machine',
      name: 'Cable Machine',
      description: 'Cable weight machine',
      icon: '🏋️‍♀️'
    }
  ],
  muscleGroups: [
    { id: 'chest', name: 'Chest', description: 'Pectoral muscles', category: 'upper' },
    { id: 'back', name: 'Back', description: 'Upper back muscles', category: 'upper' },
    { id: 'shoulders', name: 'Shoulders', description: 'Deltoid muscles', category: 'upper' },
    { id: 'biceps', name: 'Biceps', description: 'Front arm muscles', category: 'upper' },
    { id: 'triceps', name: 'Triceps', description: 'Back arm muscles', category: 'upper' },
    { id: 'forearms', name: 'Forearms', description: 'Lower arm muscles', category: 'upper' },
    { id: 'latissimus', name: 'Lats', description: 'Latissimus dorsi', category: 'upper' },
    { id: 'quadriceps', name: 'Quadriceps', description: 'Front thigh muscles', category: 'lower' },
    { id: 'hamstring', name: 'Hamstrings', description: 'Back thigh muscles', category: 'lower' },
    { id: 'gluteus', name: 'Glutes', description: 'Gluteal muscles', category: 'lower' },
    { id: 'calfs', name: 'Calves', description: 'Lower leg muscles', category: 'lower' },
    { id: 'abs', name: 'Abs', description: 'Abdominal muscles', category: 'core' },
    { id: 'core', name: 'Core', description: 'Core stabilizing muscles', category: 'core' },
    { id: 'all', name: 'Full Body', description: 'Multiple muscle groups', category: 'full' }
  ]
};

// Helper functions
export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(exercise => exercise.id === id);
}

export function getExercisesByCategory(category: string): Exercise[] {
  return EXERCISES.filter(exercise => exercise.category === category);
}

export function getExercisesByMuscleGroup(muscleGroup: string): Exercise[] {
  return EXERCISES.filter(exercise => 
    exercise.primaryMuscles.includes(muscleGroup) || 
    exercise.secondaryMuscles.includes(muscleGroup)
  );
}

export function getExercisesByEquipment(equipment: string): Exercise[] {
  return EXERCISES.filter(exercise => exercise.equipment.includes(equipment as any));
}

export function getExercisesByDifficulty(difficulty: string): Exercise[] {
  return EXERCISES.filter(exercise => exercise.difficulty === difficulty);
}

export function searchExercises(query: string): Exercise[] {
  const lowercaseQuery = query.toLowerCase();
  return EXERCISES.filter(exercise =>
    exercise.name.toLowerCase().includes(lowercaseQuery) ||
    exercise.description.toLowerCase().includes(lowercaseQuery) ||
    exercise.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

// Enhanced exercise-to-muscle mapping (replaces the one in muscleGroupAPI.ts)
export function exerciseToMuscleGroups(exerciseName: string): string[] {
  const exercise = EXERCISES.find(ex => 
    ex.name.toLowerCase() === exerciseName.toLowerCase() ||
    ex.slug === exerciseName.toLowerCase().replace(/\s+/g, '-')
  );
  
  if (exercise) {
    return [...exercise.primaryMuscles, ...exercise.secondaryMuscles];
  }
  
  // Fallback to original mapping if not found
  const exerciseMapping: Record<string, string[]> = {
    'push-up': ['chest', 'triceps', 'shoulders'],
    'bench-press': ['chest', 'triceps', 'shoulders'],
    'shoulder-press': ['shoulders', 'triceps'],
    'pull-up': ['back', 'biceps'],
    'squat': ['quadriceps', 'gluteus'],
    'deadlift': ['hamstring', 'gluteus', 'back'],
    'lunges': ['quadriceps', 'gluteus'],
    'plank': ['abs', 'core'],
    'burpees': ['all'],
    'mountain-climbers': ['core', 'shoulders', 'legs']
  };

  const normalized = exerciseName.toLowerCase().replace(/\s+/g, '-');
  return exerciseMapping[normalized] || ['all'];
}