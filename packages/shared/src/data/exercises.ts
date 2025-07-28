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
  },

  // === ADDITIONAL STRENGTH EXERCISES ===
  {
    id: 'incline-bench-press',
    name: 'Incline Bench Press',
    slug: 'incline-bench-press',
    description: 'Upper chest focused barbell exercise performed on an inclined bench',
    instructions: [
      'Set bench to 30-45 degree incline',
      'Lie back with eyes under the barbell',
      'Grip bar slightly wider than shoulders',
      'Lower bar to upper chest, then press up'
    ],
    primaryMuscles: ['chest', 'shoulders'],
    secondaryMuscles: ['triceps'],
    category: 'strength',
    difficulty: 'intermediate',
    equipment: ['barbell', 'bench'],
    force: 'push',
    mechanic: 'compound',
    tips: [
      'Keep your shoulder blades retracted',
      'Touch the bar to your upper chest',
      'Drive through your heels for stability'
    ],
    variations: ['Dumbbell Incline Press', 'Incline Dumbbell Flyes'],
    commonMistakes: [
      'Setting incline too steep',
      'Bouncing bar off chest',
      'Not controlling the descent'
    ],
    targetReps: { min: 6, max: 12 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 120, max: 180 },
    tags: ['compound', 'upper-chest', 'strength']
  },

  {
    id: 'dumbbell-rows',
    name: 'Dumbbell Rows',
    slug: 'dumbbell-rows',
    description: 'Unilateral back exercise for building lat and rhomboid strength',
    instructions: [
      'Place one knee and hand on bench for support',
      'Hold dumbbell in opposite hand',
      'Pull dumbbell to your hip, squeezing shoulder blade',
      'Lower with control and repeat'
    ],
    primaryMuscles: ['back', 'latissimus'],
    secondaryMuscles: ['biceps', 'shoulders'],
    category: 'strength',
    difficulty: 'beginner',
    equipment: ['dumbbells', 'bench'],
    force: 'pull',
    mechanic: 'compound',
    tips: [
      'Keep your back straight and core tight',
      'Pull with your back muscles, not just arms',
      'Squeeze shoulder blade at the top'
    ],
    variations: ['Chest-Supported Row', 'Bent-Over Dumbbell Row'],
    commonMistakes: [
      'Using too much arm instead of back',
      'Rotating torso during movement',
      'Not achieving full range of motion'
    ],
    targetReps: { min: 8, max: 15 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 90, max: 120 },
    tags: ['unilateral', 'back-building', 'compound']
  },

  {
    id: 'hip-thrusts',
    name: 'Hip Thrusts',
    slug: 'hip-thrusts',
    description: 'Glute-focused exercise performed with shoulders elevated on a bench',
    instructions: [
      'Sit with your back against a bench',
      'Place barbell or weight across your hips',
      'Drive through heels to lift hips up',
      'Squeeze glutes at the top, then lower'
    ],
    primaryMuscles: ['gluteus'],
    secondaryMuscles: ['hamstring', 'core'],
    category: 'strength',
    difficulty: 'intermediate',
    equipment: ['barbell', 'bench'],
    force: 'push',
    mechanic: 'isolation',
    tips: [
      'Keep chin tucked and core braced',
      'Drive through your heels',
      'Pause and squeeze at the top'
    ],
    variations: ['Bodyweight Hip Thrusts', 'Single-Leg Hip Thrusts', 'Banded Hip Thrusts'],
    commonMistakes: [
      'Overextending the back',
      'Not achieving full hip extension',
      'Using knees instead of glutes'
    ],
    targetReps: { min: 10, max: 15 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 90, max: 120 },
    tags: ['glute-focused', 'hip-extension', 'strength']
  },

  {
    id: 'overhead-press',
    name: 'Overhead Press',
    slug: 'overhead-press',
    description: 'Standing barbell press for building shoulder and core strength',
    instructions: [
      'Stand with feet hip-width apart',
      'Hold barbell at shoulder height',
      'Press bar straight up overhead',
      'Lower with control back to shoulders'
    ],
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'core'],
    category: 'strength',
    difficulty: 'intermediate',
    equipment: ['barbell'],
    force: 'push',
    mechanic: 'compound',
    tips: [
      'Keep your core tight throughout',
      'Press in a straight line over your head',
      'Don\'t arch your back excessively'
    ],
    variations: ['Dumbbell Shoulder Press', 'Seated Overhead Press', 'Push Press'],
    commonMistakes: [
      'Pressing the bar forward instead of up',
      'Excessive back arch',
      'Not engaging the core'
    ],
    targetReps: { min: 6, max: 10 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 120, max: 180 },
    tags: ['overhead', 'full-body', 'compound']
  },

  // === CARDIO/CONDITIONING EXERCISES ===
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    slug: 'jumping-jacks',
    description: 'Classic cardio exercise that elevates heart rate and works the whole body',
    instructions: [
      'Start standing with feet together, arms at sides',
      'Jump feet apart while raising arms overhead',
      'Jump back to starting position',
      'Maintain steady rhythm'
    ],
    primaryMuscles: ['quadriceps', 'calfs'],
    secondaryMuscles: ['shoulders', 'core'],
    category: 'cardio',
    difficulty: 'beginner',
    equipment: ['bodyweight'],
    force: 'push',
    mechanic: 'compound',
    tips: [
      'Land softly on the balls of your feet',
      'Keep movements controlled',
      'Breathe steadily throughout'
    ],
    variations: ['Half Jacks', 'Cross Jacks', 'Star Jumps'],
    commonMistakes: [
      'Landing too hard',
      'Moving too fast without control',
      'Not fully extending arms overhead'
    ],
    targetReps: { min: 20, max: 50 },
    targetSets: { min: 2, max: 4 },
    restTime: { min: 30, max: 60 },
    tags: ['cardio', 'full-body', 'conditioning']
  },

  {
    id: 'high-knees',
    name: 'High Knees',
    slug: 'high-knees',
    description: 'Dynamic cardio exercise that improves coordination and leg strength',
    instructions: [
      'Stand tall with feet hip-width apart',
      'Run in place lifting knees to hip height',
      'Pump arms naturally with the movement',
      'Maintain quick, controlled pace'
    ],
    primaryMuscles: ['quadriceps', 'calfs'],
    secondaryMuscles: ['core'],
    category: 'cardio',
    difficulty: 'beginner',
    equipment: ['bodyweight'],
    force: 'push',
    mechanic: 'compound',
    tips: [
      'Keep your core engaged',
      'Land on the balls of your feet',
      'Drive knees up toward your chest'
    ],
    variations: ['High Knee Marching', 'High Knees with Arm Circles'],
    commonMistakes: [
      'Not lifting knees high enough',
      'Leaning too far forward',
      'Moving too slowly'
    ],
    targetReps: { min: 20, max: 40 },
    targetSets: { min: 2, max: 4 },
    restTime: { min: 30, max: 60 },
    tags: ['cardio', 'plyometric', 'conditioning']
  },

  // === FLEXIBILITY/MOBILITY EXERCISES ===
  {
    id: 'downward-dog',
    name: 'Downward Dog',
    slug: 'downward-dog',
    description: 'Yoga pose that stretches hamstrings, calves, and shoulders while building strength',
    instructions: [
      'Start in a plank position',
      'Lift hips up and back into inverted V shape',
      'Straighten legs and press heels toward floor',
      'Hold position while breathing deeply'
    ],
    primaryMuscles: ['hamstring', 'calfs'],
    secondaryMuscles: ['shoulders', 'core'],
    category: 'flexibility',
    difficulty: 'beginner',
    equipment: ['bodyweight'],
    force: 'static',
    mechanic: 'compound',
    tips: [
      'Keep your spine long and straight',
      'Press firmly through your hands',
      'Pedal feet to warm up calves'
    ],
    variations: ['Three-Legged Dog', 'Puppy Pose', 'Wide-Legged Downward Dog'],
    commonMistakes: [
      'Rounding the spine',
      'Not engaging the arms',
      'Holding breath'
    ],
    targetReps: { min: 1, max: 1 },
    targetSets: { min: 2, max: 4 },
    restTime: { min: 30, max: 60 },
    tags: ['yoga', 'flexibility', 'full-body-stretch']
  },

  {
    id: 'child-pose',
    name: 'Child\'s Pose',
    slug: 'child-pose',
    description: 'Restorative yoga pose that stretches the back and helps with relaxation',
    instructions: [
      'Kneel on the floor with big toes touching',
      'Sit back on your heels',
      'Fold forward extending arms in front',
      'Rest forehead on the ground and breathe deeply'
    ],
    primaryMuscles: ['back'],
    secondaryMuscles: ['shoulders'],
    category: 'flexibility',
    difficulty: 'beginner',
    equipment: ['bodyweight'],
    force: 'static',
    mechanic: 'isolation',
    tips: [
      'Relax completely into the pose',
      'Breathe deeply and slowly',
      'Hold for extended periods'
    ],
    variations: ['Wide-Knee Child\'s Pose', 'Side Child\'s Pose'],
    commonMistakes: [
      'Tensing up instead of relaxing',
      'Not breathing deeply',
      'Rushing the pose'
    ],
    targetReps: { min: 1, max: 1 },
    targetSets: { min: 1, max: 3 },
    restTime: { min: 0, max: 30 },
    tags: ['yoga', 'recovery', 'relaxation']
  },

  {
    id: 'russian-twists',
    name: 'Russian Twists',
    slug: 'russian-twists',
    description: 'Core exercise that targets obliques and improves rotational strength',
    instructions: [
      'Sit on floor with knees bent, feet lifted',
      'Lean back slightly keeping back straight',
      'Rotate torso left and right',
      'Keep core engaged throughout'
    ],
    primaryMuscles: ['abs', 'core'],
    secondaryMuscles: [],
    category: 'strength',
    difficulty: 'intermediate',
    equipment: ['bodyweight'],
    force: 'pull',
    mechanic: 'isolation',
    tips: [
      'Keep your chest up and core tight',
      'Focus on rotating from your core',
      'Control the movement, don\'t rush'
    ],
    variations: ['Weighted Russian Twists', 'Feet-Down Russian Twists'],
    commonMistakes: [
      'Using arms instead of core',
      'Moving too quickly',
      'Rounding the back'
    ],
    targetReps: { min: 20, max: 40 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 45, max: 90 },
    tags: ['core', 'obliques', 'rotational']
  },

  // === ADDITIONAL POPULAR EXERCISES ===
  {
    id: 'leg-press',
    name: 'Leg Press',
    slug: 'leg-press',
    description: 'Machine-based compound exercise targeting the entire lower body',
    instructions: [
      'Sit on the leg press machine with back against the pad',
      'Place feet shoulder-width apart on the footplate',
      'Lower the weight by bending your knees to 90 degrees',
      'Press the weight back up through your heels'
    ],
    primaryMuscles: ['quadriceps', 'gluteus'],
    secondaryMuscles: ['hamstring', 'calfs'],
    category: 'legs',
    difficulty: 'beginner',
    equipment: ['cable-machine'],
    force: 'push',
    mechanic: 'compound',
    tips: [
      'Keep your core tight throughout the movement',
      'Don\'t lock your knees at the top',
      'Control the descent for better muscle activation'
    ],
    variations: ['Single-Leg Press', 'High-Foot Position', 'Low-Foot Position'],
    commonMistakes: [
      'Going too deep and rounding the back',
      'Not using full range of motion',
      'Pushing through toes instead of heels'
    ],
    targetReps: { min: 8, max: 15 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 90, max: 180 },
    tags: ['machine', 'compound', 'lower-body']
  },

  {
    id: 'chest-fly',
    name: 'Chest Fly',
    slug: 'chest-fly',
    description: 'Isolation exercise targeting the chest muscles with dumbbells',
    instructions: [
      'Lie on a bench holding dumbbells above your chest',
      'With a slight bend in elbows, lower weights out to sides',
      'Feel a stretch in your chest, then bring weights back together',
      'Squeeze chest muscles at the top of the movement'
    ],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    category: 'push',
    difficulty: 'intermediate',
    equipment: ['dumbbells', 'bench'],
    force: 'push',
    mechanic: 'isolation',
    tips: [
      'Keep a slight bend in your elbows throughout',
      'Focus on feeling the stretch in your chest',
      'Control the weight on the way down'
    ],
    variations: ['Incline Chest Fly', 'Decline Chest Fly', 'Cable Fly'],
    commonMistakes: [
      'Using too much weight',
      'Bending elbows too much',
      'Not controlling the descent'
    ],
    targetReps: { min: 10, max: 15 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 60, max: 90 },
    tags: ['dumbbells', 'isolation', 'chest']
  },

  {
    id: 'face-pulls',
    name: 'Face Pulls',
    slug: 'face-pulls',
    description: 'Cable exercise targeting rear delts and improving posture',
    instructions: [
      'Set cable machine to upper chest height',
      'Grab rope attachment with overhand grip',
      'Pull rope towards your face, separating hands',
      'Squeeze shoulder blades together at the end'
    ],
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['back', 'biceps'],
    category: 'pull',
    difficulty: 'beginner',
    equipment: ['cable-machine'],
    force: 'pull',
    mechanic: 'isolation',
    tips: [
      'Focus on pulling elbows back, not just hands',
      'Keep shoulders down and back',
      'Use light weight and focus on form'
    ],
    variations: ['Band Face Pulls', 'Reverse Fly', 'High Cable Row'],
    commonMistakes: [
      'Using too much weight',
      'Not separating hands at the end',
      'Shrugging shoulders'
    ],
    targetReps: { min: 12, max: 20 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 45, max: 75 },
    tags: ['cable', 'isolation', 'posture', 'rear-delts']
  },

  {
    id: 'goblet-squat',
    name: 'Goblet Squat',
    slug: 'goblet-squat',
    description: 'Dumbbell squat variation perfect for learning proper squat form',
    instructions: [
      'Hold a dumbbell at chest level with both hands',
      'Stand with feet slightly wider than shoulder-width',
      'Lower into a squat, keeping chest up and weight on heels',
      'Drive through heels to return to standing position'
    ],
    primaryMuscles: ['quadriceps', 'gluteus'],
    secondaryMuscles: ['hamstring', 'core', 'calfs'],
    category: 'legs',
    difficulty: 'beginner',
    equipment: ['dumbbells'],
    force: 'push',
    mechanic: 'compound',
    tips: [
      'Keep the dumbbell close to your chest',
      'Focus on sitting back with your hips',
      'Keep your knees in line with your toes'
    ],
    variations: ['Kettlebell Goblet Squat', 'Goblet Squat Pulse', 'Goblet Squat Hold'],
    commonMistakes: [
      'Knees caving inward',
      'Not going deep enough',
      'Leaning too far forward'
    ],
    targetReps: { min: 10, max: 15 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 60, max: 120 },
    tags: ['dumbbells', 'beginner-friendly', 'compound', 'squat-variation']
  },

  {
    id: 'wall-sit',
    name: 'Wall Sit',
    slug: 'wall-sit',
    description: 'Isometric exercise that builds leg strength and endurance',
    instructions: [
      'Stand with back against a wall',
      'Slide down until thighs are parallel to floor',
      'Keep knees at 90 degrees and feet flat',
      'Hold this position for the target time'
    ],
    primaryMuscles: ['quadriceps', 'gluteus'],
    secondaryMuscles: ['hamstring', 'calfs', 'core'],
    category: 'legs',
    difficulty: 'beginner',
    equipment: ['bodyweight'],
    force: 'static',
    mechanic: 'compound',
    tips: [
      'Keep your back flat against the wall',
      'Distribute weight evenly on both legs',
      'Breathe normally throughout the hold'
    ],
    variations: ['Single-Leg Wall Sit', 'Wall Sit with Calf Raises', 'Wall Sit Pulses'],
    commonMistakes: [
      'Knees extending past toes',
      'Not going low enough',
      'Putting hands on knees for support'
    ],
    targetReps: { min: 30, max: 120 },
    targetSets: { min: 3, max: 4 },
    restTime: { min: 60, max: 120 },
    tags: ['bodyweight', 'isometric', 'endurance', 'no-equipment']
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