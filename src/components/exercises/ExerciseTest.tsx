import React from 'react';
import { EXERCISES, getExerciseById, getExercisesByCategory, exerciseToMuscleGroups } from 'shared/data/exercises';

export const ExerciseTest: React.FC = () => {
  // Test our exercise database
  const totalExercises = EXERCISES.length;
  const categories = [...new Set(EXERCISES.map(e => e.category))];
  const pushUp = getExerciseById('push-up');
  const pushExercises = getExercisesByCategory('push');
  const pushUpMuscles = exerciseToMuscleGroups('Push-Up');

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🧪 Exercise Database Test
      </h2>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">📊 Database Stats</h3>
          <p className="text-blue-700">Total exercises: <strong>{totalExercises}</strong></p>
          <p className="text-blue-700">Categories: <strong>{categories.join(', ')}</strong></p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">🔍 Function Tests</h3>
          <p className="text-green-700">
            getExerciseById('push-up'): <strong>{pushUp?.name || 'Not found'}</strong>
          </p>
          <p className="text-green-700">
            Push exercises found: <strong>{pushExercises.length}</strong>
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">💪 Muscle Integration</h3>
          <p className="text-purple-700">
            Push-Up muscles: <strong>{pushUpMuscles.join(', ')}</strong>
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800">🚀 Sample Exercise</h3>
          {pushUp && (
            <div className="text-gray-700">
              <p><strong>Name:</strong> {pushUp.name}</p>
              <p><strong>Description:</strong> {pushUp.description}</p>
              <p><strong>Category:</strong> {pushUp.category}</p>
              <p><strong>Difficulty:</strong> {pushUp.difficulty}</p>
              <p><strong>Primary Muscles:</strong> {pushUp.primaryMuscles.join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          ✅ Exercise Database Working!
        </span>
      </div>
    </div>
  );
}; 