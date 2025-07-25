# Technical Design Document (TDD) - RepFlow Fitness Tracker Web App

**Project Title**: RepFlow  
**One-sentence pitch**: A user-friendly fitness tracker web app that enables users to plan, log, and track workouts with visual muscle group feedback, a personal dashboard, BMI calculator, and gamified motivation system.

## 1. Tech Stack (Golden Path)
The tech stack aligns with the provided template, tailored for RepFlow’s MVP, prioritizing simplicity and functionality.

- **Framework**: React v19 with TypeScript (Strict mode) for a robust, type-safe frontend.
- **Package Manager**: PNPM for efficient dependency management.
- **Monorepo Management**: pnpm Workspaces for modular code organization:
  ```
  ├── apps/
  │   └── web/            ← React frontend (RepFlow SPA)
  ├── packages/
  │   ├── shared/         ← Zod schemas, utilities, exercise-to-muscle mappings
  │   └── seeding/        ← Firestore seeding helpers (Firestore emulator)
  ├── docs/               ← Project docs (TDD, SDD, FRD, API notes)
  └── .github/            ← CI workflows
  ```
- **Build Orchestration**: Turborepo for efficient monorepo builds.
- **Build Tool**: Vite for fast development and production builds.
- **UI Components**: shadcn/ui (Vite variant) for accessible, customizable components.
- **Styling**: Tailwind CSS v4 for responsive, utility-first styling.
- **Forms & Validation**: React Hook Form + Zod for form handling and validation.
- **Backend Services**: Firebase (Authentication, Firestore, Hosting) with separate staging and production environments:
  - **Staging**: `rep-flow-staging` (projectId: `rep-flow-staging`, authDomain: `rep-flow-staging.firebaseapp.com`).
  - **Production**: `rep-flow-prod` (projectId: `rep-flow-prod`, authDomain: `rep-flow-prod.firebaseapp.com`).
- **API Client**: Axios for calling the Muscle Group Image Generator API and Firestore.
- **Testing**:
  - **Unit/Component**: Vitest + React Testing Library for hooks and UI components.
  - **End-to-End**: Playwright for auth flows and critical user journeys.
- **Linting & Formatting**: ESLint (with `typescript-eslint`, `eslint-plugin-perfectionist`) and Prettier for code consistency.
- **Runtime Environment**: Node.js v22 (LTS).
- **Typesafe Environment Variables**: T3 Env (Zod-validated) for secure configuration, including Firebase and RapidAPI keys:
  ```typescript
  import { z } from 'zod';

  export const envSchema = z.object({
    VITE_FIREBASE_API_KEY: z.string(),
    VITE_FIREBASE_AUTH_DOMAIN: z.string(),
    VITE_FIREBASE_PROJECT_ID: z.string(),
    VITE_FIREBASE_STORAGE_BUCKET: z.string(),
    VITE_FIREBASE_MESSAGING_SENDER_ID: z.string(),
    VITE_FIREBASE_APP_ID: z.string(),
    VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
    VITE_RAPIDAPI_KEY: z.string(),
    VITE_ENV: z.enum(['staging', 'prod']),
  });

  export const env = envSchema.parse(import.meta.env);
  ```
- **CI/CD**: GitHub Actions with Turbo-aware pipeline for linting, testing, and deployment to Firebase Hosting (staging or production based on `VITE_ENV`).

**Firebase Initialization**:
```typescript
import { initializeApp } from 'firebase/app';
import { env } from './env';

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
```

## 2. Data Model
The data model is designed for Firestore, optimized for RepFlow’s requirements with user-scoped collections.

| Entity        | Key Fields                                                                 | Notes                                                                 |
|---------------|---------------------------------------------------------------------------|----------------------------------------------------------------------|
| User          | `uid: string`, `email: string`, `weight: number`, `height: number`, `created_at: timestamp` | Stored in `users` collection; `uid` from Firebase Auth.               |
| Workout       | `id: string`, `user_id: string`, `date: timestamp`, `exercise_name: string`, `sets: number`, `reps: number`, `weight: number`, `duration: number`, `muscle_groups: string[]` | Stored in `workouts` collection; linked to `user_id`. Includes muscle groups for visualization. |
| Routine       | `id: string`, `user_id: string`, `name: string`, `exercises: array<{name: string, muscle_groups: string[]}>`, `schedule: string[]` | Stored in `routines` collection; `schedule` lists days (e.g., ["Mon"]). |
| Goal          | `id: string`, `user_id: string`, `description: string`, `target_value: number`, `current_value: number`, `deadline: timestamp` | Stored in `goals` collection; tracks progress (e.g., bench press weight). |
| BMI_History   | `id: string`, `user_id: string`, `weight: number`, `height: number`, `bmi: number`, `recorded_at: timestamp` | Stored in `bmi_history` collection; tracks BMI over time.            |

- **Security Rules**:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
      match /workouts/{workoutId} {
        allow read, write: if request.auth != null && resource.data.user_id == request.auth.uid;
      }
      match /routines/{routineId} {
        allow read, write: if request.auth != null && resource.data.user_id == request.auth.uid;
      }
      match /goals/{goalId} {
        allow read, write: if request.auth != null && resource.data.user_id == request.auth.uid;
      }
      match /bmi_history/{bmiId} {
        allow read, write: if request.auth != null && resource.data.user_id == request.auth.uid;
      }
    }
  }
  ```
- **Index Strategy**:
  - Composite indexes for frequent queries:
    - `workouts`: `user_id ASC, date DESC` (for fetching workout history and gamification).
    - `routines`: `user_id ASC, name ASC` (for listing routines).
    - `bmi_history`: `user_id ASC, recorded_at DESC` (for BMI history).
  - Indexes defined in `firestore.indexes.json` and deployed via Firebase CLI.

## 3. API Design
### 3.1 Internal API (Firestore Operations)
| Router   | Procedure       | Input (Zod Schema)                                                                 | Output                     |
|----------|-----------------|-----------------------------------------------------------------------------------|----------------------------|
| user     | getById         | `z.object({ uid: z.string() })`                                                  | `User`                     |
| user     | updateProfile   | `z.object({ uid: z.string(), weight: z.number().positive(), height: z.number().positive() })` | `User`                     |
| workout  | create          | `z.object({ user_id: z.string(), date: z.date(), exercise_name: z.string(), sets: z.number().int().positive(), reps: z.number().int().positive(), weight: z.number().positive(), duration: z.number().positive(), muscle_groups: z.array(z.string()) })` | `Workout`                  |
| workout  | getByUser       | `z.object({ user_id: z.string(), limit: z.number().int().positive().optional() })` | `Workout[]`                |
| routine  | create          | `z.object({ user_id: z.string(), name: z.string(), exercises: z.array(z.object({ name: z.string(), muscle_groups: z.array(z.string()) })), schedule: z.array(z.string()) })` | `Routine`                  |
| routine  | getByUser       | `z.object({ user_id: z.string() })`                                              | `Routine[]`                |
| goal     | create          | `z.object({ user_id: z.string(), description: z.string(), target_value: z.number().positive(), current_value: z.number().positive(), deadline: z.date() })` | `Goal`                     |
| goal     | getByUser       | `z.object({ user_id: z.string() })`                                              | `Goal[]`                   |
| bmi      | create          | `z.object({ user_id: z.string(), weight: z.number().positive(), height: z.number().positive(), bmi: z.number().positive(), recorded_at: z.date() })` | `BMI_History`              |
| bmi      | getByUser       | `z.object({ user_id: z.string(), limit: z.number().int().positive().optional() })` | `BMI_History[]`            |

### 3.2 External API (Muscle Group Image Generator)
| Endpoint                        | Input (Query Params)                                                                 | Output                     |
|---------------------------------|-------------------------------------------------------------------------------------|----------------------------|
| `GET /getMuscleGroups`          | None                                                                                | `string[]` (muscle groups) |
| `GET /getImage`                 | `muscleGroups: string` (comma-separated), `color: string` (RGB, e.g., `200,100,80`), `transparentBackground: 0 | 3` | `image/png` (binary) |
| `GET /getMulticolorImage`       | `primaryMuscleGroups: string`, `secondaryMuscleGroups: string`, `primaryColor: string`, `secondaryColor: string`, `transparentBackground: 0 | 3` | `image/png` (binary) |
| `GET /getIndividualColorImage`  | `muscleGroups: string` (comma-separated), `colors: string` (hex, e.g., `ff0000,00ff00,0000ff`), `transparentBackground: 0 | 3` | `image/png` (binary) |
| `GET /getBaseImage`             | `transparentBackground: 0 | 3`                                                       | `image/png` (binary)       |

- **Error Handling Conventions**:
  - **Auth Errors**: Return `401 Unauthorized` for invalid Firebase JWT.
  - **Validation Errors**: Use Zod to validate inputs; return `400 Bad Request` with error details.
  - **API Errors**: Handle RapidAPI errors (e.g., `429 Too Many Requests`) with cached data or fallback image (`/public/fallback-muscle-image.png`).
  - **Firestore Errors**: Catch and log errors (e.g., `PERMISSION_DENIED`); return `500 Internal Server Error` with user-friendly messages (e.g., “Failed to load data, please try again”).

## 4. Testing Strategy
| Level / Focus         | Toolset                          | Scope                                      |
|-----------------------|----------------------------------|--------------------------------------------|
| Unit                  | Vitest                          | Pure functions (e.g., BMI calculation), hooks (e.g., `useGamification`) |
| Component             | Vitest + React Testing Library   | UI components (e.g., Dashboard, ExerciseSelector, Timer) |
| Visual / Interaction  | Vitest + Testing Library        | UI snapshots, user interactions (e.g., form submissions) |
| End-to-End            | Playwright                      | Auth flows (login/logout), happy paths (log workout, view dashboard) |

- **Test Cases**:
  - **Unit**: Test BMI calculation (`weight / height²`), gamification logic (e.g., 5 workouts → Legend).
  - **Component**: Test rendering of `Dashboard`, `ExerciseSelector`, and `MuscleVisualizer` with mock API data.
  - **Visual**: Snapshot tests for UI consistency across light/dark themes.
  - **E2E**: Test login, workout logging, routine creation, BMI calculation, and muscle visualization flows.

## 5. CI/CD Pipeline (GitHub Actions)
1. **Setup PNPM and Restore Turbo Cache**:
   - Install Node.js v22 and PNPM.
   - Restore Turborepo cache for faster builds.
2. **Lint and Typecheck**: `pnpm exec turbo run lint typecheck` (ESLint + `tsc --noEmit`).
3. **Unit/Component Tests**: `pnpm exec turbo run test` (Vitest, skips untouched packages).
4. **E2E Tests**: `pnpm exec turbo run e2e` (Playwright, headless mode).
5. **Build**: `pnpm exec turbo run build` (Vite builds the React app).
6. **Deploy Preview**: Deploy to Firebase Hosting preview channel for PRs (using `rep-flow-staging`).
7. **Production Deployment**: Deploy to Firebase Hosting (`rep-flow-prod`) on merge to `main`, using Changesets for versioning.

**Example GitHub Actions Workflow**:
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm install
      - run: pnpm exec turbo run lint typecheck
      - run: pnpm exec turbo run test
      - run: pnpm exec turbo run e2e
      - run: pnpm exec turbo run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: ${{ env.VITE_ENV == 'prod' ? 'rep-flow-prod' : 'rep-flow-staging' }}
```

## 6. Code Quality & Formatting
- **Prettier**: Formats code on save/commit for consistency.
- **ESLint**: Enforces rules with `typescript-eslint` and `eslint-plugin-perfectionist` (autosorts imports/objects).
- **Husky**: Pre-commit hook runs `lint-staged` for formatting and linting staged files.
- **Example `.eslintrc.cjs`**:
  ```javascript
  module.exports = {
    env: { browser: true, es2021: true, node: true },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:perfectionist/recommended-natural'
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'perfectionist'],
    rules: {
      'perfectionist/sort-imports': ['error', { type: 'natural' }],
      '@typescript-eslint/no-unused-vars': 'error'
    }
  };
  ```

## 7. Gamification Implementation
The gamification system (FR9) uses a power bar with 6 levels (0–5) and nicknames based on weekly workout frequency:
- **Logic**:
  - Query `workouts` collection for the current week (Monday 00:00 to Sunday 23:59).
  - Count unique workout dates (e.g., 3 workouts on different days → 3).
  - Map count to level and nickname:
    - 0: Sleeper
    - 1: Rookie
    - 2: Builder
    - 3: Machine
    - 4: Beast
    - 5+: Legend
- **Implementation**:
  - Frontend hook (`useGamification`) queries Firestore for workouts, calculates level, and updates UI.
  - Store current level/nickname in Redux for real-time display.
  - Reset count weekly via client-side check (comparing `Date.now()` with week start).
- **Example Hook**:
  ```typescript
  import { useQuery } from '@tanstack/react-query';
  import { collection, query, where, getDocs } from 'firebase/firestore';
  import { db } from '../firebase';

  const getWeekRange = () => {
    const now = new Date();
    const start = new Date(now.setHours(0, 0, 0, 0));
    start.setDate(start.getDate() - start.getDay()); // Monday
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  };

  const useGamification = (userId: string) => {
    const { start, end } = getWeekRange();
    return useQuery({
      queryKey: ['gamification', userId, start.toISOString()],
      queryFn: async () => {
        const q = query(
          collection(db, 'workouts'),
          where('user_id', '==', userId),
          where('date', '>=', start),
          where('date', '<', end)
        );
        const snapshot = await getDocs(q);
        const workoutDays = new Set(snapshot.docs.map(doc => doc.data().date.toDate().toDateString())).size;
        const levels = [
          { level: 0, nickname: 'Sleeper' },
          { level: 1, nickname: 'Rookie' },
          { level: 2, nickname: 'Builder' },
          { level: 3, nickname: 'Machine' },
          { level: 4, nickname: 'Beast' },
          { level: 5, nickname: 'Legend' }
        ];
        const level = Math.min(workoutDays, 5);
        return levels[level];
      }
    });
  };
  ```
- **UI Display**:
  - Render power bar and nickname on the dashboard using Tailwind CSS:
  ```typescript
  import { useGamification } from '../hooks/useGamification';

  const PowerBar = ({ userId }: { userId: string }) => {
    const { data } = useGamification(userId);
    return (
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-green-500 h-4 rounded-full"
          style={{ width: `${(data?.level || 0) * 20}%` }}
        />
        <p className="text-lg font-bold">{data?.nickname || 'Sleeper'}</p>
      </div>
    );
  };
  ```

## 8. Muscle Group Image Generator API Integration
- **Endpoints**:
  - `GET /getMuscleGroups`: Returns list of 27 muscle groups (e.g., `all`, `abs`, `biceps`, `chest`, `triceps`, etc.), cached in localStorage.
  - `GET /getImage`: Generates single-color image for specified muscle groups (e.g., `muscleGroups=biceps,chest,hamstring`, `color=200,100,80`).
  - `GET /getMulticolorImage`: Generates dual-color image for primary and secondary muscle groups (e.g., `primaryMuscleGroups=chest`, `secondaryMuscleGroups=triceps,shoulders`, `primaryColor=240,100,80`, `secondaryColor=200,100,80`).
  - `GET /getIndividualColorImage`: Generates image with individual colors per muscle group (e.g., `muscleGroups=chest,triceps,shoulders`, `colors=ff0000,00ff00,0000ff`).
  - `GET /getBaseImage`: Returns base anatomical image without highlights.
- **Implementation**:
  - Use Axios with RapidAPI key stored in `VITE_RAPIDAPI_KEY` (validated by T3 Env).
  - Cache `getMuscleGroups` response and common images (e.g., `chest,triceps`) in localStorage with 7-day TTL.
  - Map exercises to muscle groups using `packages/shared/exercises.json`:
    ```json
    {
      "bench_press": { "primary": ["chest"], "secondary": ["triceps", "shoulders_front"] },
      "squat": { "primary": ["quadriceps", "gluteus"], "secondary": ["hamstring", "core_lower"] },
      "bicep_curl": { "primary": ["biceps"], "secondary": ["forearms"] }
    }
    ```
  - Use `getMulticolorImage` for primary/secondary muscle visualization in the `MuscleVisualizer` component, falling back to `getImage` for simpler displays.
  - Handle API errors by displaying a fallback image (`/public/fallback-muscle-image.png`) and a message (“Failed to load muscle image, please try again”).
- **Example Axios Client**:
  ```typescript
  import axios from 'axios';
  import { z } from 'zod';
  import { env } from './env';

  const muscleGroupsSchema = z.array(z.string());
  const api = axios.create({
    baseURL: 'https://muscle-group-image-generator.p.rapidapi.com',
    headers: { 'X-RapidAPI-Key': env.VITE_RAPIDAPI_KEY }
  });

  export const fetchMuscleGroups = async () => {
    const { data } = await api.get('/getMuscleGroups');
    return muscleGroupsSchema.parse(data);
  };

  export const fetchSingleColorImage = async (muscleGroups: string[], color: string) => {
    const params = new URLSearchParams({
      muscleGroups: muscleGroups.join(','),
      color,
      transparentBackground: '0'
    });
    try {
      const { data } = await api.get(`/getImage?${params}`, { responseType: 'blob' });
      return URL.createObjectURL(data);
    } catch (error) {
      console.error('API Error:', error);
      return '/public/fallback-muscle-image.png';
    }
  };

  export const fetchMulticolorImage = async (
    primaryMuscleGroups: string[],
    secondaryMuscleGroups: string[],
    primaryColor: string,
    secondaryColor: string
  ) => {
    const params = new URLSearchParams({
      primaryMuscleGroups: primaryMuscleGroups.join(','),
      secondaryMuscleGroups: secondaryMuscleGroups.join(','),
      primaryColor,
      secondaryColor,
      transparentBackground: '0'
    });
    try {
      const { data } = await api.get(`/getMulticolorImage?${params}`, { responseType: 'blob' });
      return URL.createObjectURL(data);
    } catch (error) {
      console.error('API Error:', error);
      return '/public/fallback-muscle-image.png';
    }
  };

  export const fetchIndividualColorImage = async (muscleGroups: string[], colors: string[]) => {
    const params = new URLSearchParams({
      muscleGroups: muscleGroups.join(','),
      colors: colors.join(','),
      transparentBackground: '0'
    });
    try {
      const { data } = await api.get(`/getIndividualColorImage?${params}`, { responseType: 'blob' });
      return URL.createObjectURL(data);
    } catch (error) {
      console.error('API Error:', error);
      return '/public/fallback-muscle-image.png';
    }
  };

  export const fetchBaseImage = async () => {
    try {
      const { data } = await api.get('/getBaseImage?transparentBackground=0', { responseType: 'blob' });
      return URL.createObjectURL(data);
    } catch (error) {
      console.error('API Error:', error);
      return '/public/fallback-muscle-image.png';
    }
  };
  ```

## 9. Implementation Notes
- **Exercise Mapping**: The `packages/shared/exercises.json` file maps exercises to primary and secondary muscle groups based on the API’s 27 muscle groups (e.g., `chest`, `triceps`, `shoulders_front`). This drives the `ExerciseSelector` and `MuscleVisualizer` components.
- **BMI Calculation**: Implemented in the frontend:
  ```typescript
  export const calculateBMI = (weight: number, height: number): number => {
    return Number((weight / (height * height)).toFixed(1));
  };
  ```
  - Validated with Zod: `z.number().positive()` for inputs.
  - Results stored in `bmi_history` collection.
- **Timer Implementation**: A React component using `useState` and `setInterval`:
  ```typescript
  import { useState, useEffect } from 'react';

  export const useTimer = (initialSeconds: number) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isRunning) {
        interval = setInterval(() => {
          setSeconds(prev => prev + 1);
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [isRunning]);

    const start = () => setIsRunning(true);
    const pause = () => setIsRunning(false);
    const reset = () => setSeconds(0);

    return { seconds, start, pause, reset };
  };
  ```
- **Calendar**: Uses FullCalendar for scheduling, with events stored in the `routines` collection.
- **Progress Charts**: Uses Chart.js for workout volume and BMI history:
  ```chartjs
  {
    "type": "line",
    "data": {
      "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
      "datasets": [{
        "label": "Total Weight Lifted (kg)",
        "data": [1000, 1200, 1300, 1500],
        "borderColor": "#4CAF50",
        "backgroundColor": "rgba(76, 175, 80, 0.2)",
        "fill": true
      }]
    },
    "options": {
      "responsive": true,
      "scales": {
        "y": { "beginAtZero": true, "title": { "display": true, "text": "Weight (kg)" } },
        "x": { "title": { "display": true, "text": "Weeks" } }
      }
    }
  }
  ```

## 10. Last Updated
2025-07-25