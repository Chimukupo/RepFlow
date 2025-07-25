# Systems Design Document (SDD) - RepFlow Fitness Tracker Web App

## 1. Purpose
The RepFlow Fitness Tracker Web App enables users to plan, log, and track workouts, focusing on exercises by muscle group or body part, with visual feedback via the Muscle Group Image Generator API. It includes a personal dashboard, workout logging, weekly routine planning, a BMI calculator, a workout timer, and a gamification system with a power bar and nicknames (Sleeper, Rookie, Builder, Machine, Beast, Legend) based on weekly workout frequency. This Systems Design Document (SDD) outlines the high-level architecture, components, and data flow to deliver a functional Minimum Viable Product (MVP) that prioritizes simplicity, scalability, and user experience while integrating with Firebase and the external API.

## 2. System Overview
RepFlow is a single-page web application (SPA) built with a modern frontend-backend architecture. The frontend, built with React and TypeScript, provides an intuitive UI for exercise selection, workout logging, and visualization. The backend, powered by Firebase (Authentication, Firestore, Hosting), handles user data and workout storage. The Muscle Group Image Generator API (via RapidAPI) provides muscle group data and visual images. The system is designed for scalability, security, and minimal latency, with caching to optimize external API calls.

### 2.1 System Components
- **Frontend (Client)**: React v19 with TypeScript, hosted on Firebase Hosting, provides the user interface for all features (dashboard, exercise selector, calendar, etc.).
- **Backend (Serverless)**: Firebase Firestore for data storage and Firebase Authentication for user management.
- **External API**: Muscle Group Image Generator API for listing muscle groups and generating anatomical images.
- **Caching Layer**: In-memory caching (e.g., localStorage or Redux) for API responses to reduce external calls.
- **CI/CD Pipeline**: GitHub Actions for automated testing, linting, and deployment.

### 2.2 System Architecture Diagram
```
[User] ↔ [Browser]
           ↓
[Firebase Hosting] ↔ [React SPA]
           ↓
[Firebase Authentication] ↔ [Firestore Database]
           ↓
[Muscle Group Image Generator API (RapidAPI)]
```
- **User Interaction**: Users access the SPA via a browser, interacting with the React frontend.
- **Authentication**: Firebase Authentication handles user login and session management.
- **Data Storage**: Firestore stores user profiles, workouts, routines, goals, and BMI history.
- **External API**: The frontend calls the Muscle Group Image Generator API for muscle group data and images, with responses cached locally.

## 3. Functional Requirements Mapping
The system supports all functional requirements from the FRD (artifact_id: 1a97725f-31af-486e-8576-9be72b1fbd66):
- **FR1 (Exercise Selection)**: Frontend fetches muscle groups via `GET /getMuscleGroups` and displays a filterable list.
- **FR2 (Muscle Group Visualization)**: Frontend calls `GET /getIndividualColorImage` to render images with highlighted muscle groups.
- **FR3 (Workout Logging)**: Frontend sends workout data to Firestore via a secure API client.
- **FR4 (Progress Tracking)**: Frontend retrieves workout and goal data from Firestore for display in charts.
- **FR5 (Weekly Routine Planning)**: Calendar component stores and retrieves routines from Firestore.
- **FR6 (Personal Dashboard)**: Aggregates user metrics, workouts, and goals from Firestore.
- **FR7 (BMI Calculator)**: Frontend calculates BMI and stores results in Firestore.
- **FR8 (Workout Timer)**: JavaScript-based timer runs in the frontend.
- **FR9 (Gamification System)**: Frontend calculates weekly workout frequency from Firestore data and updates the power bar/nickname.

## 4. Component Design
### 4.1 Frontend (React SPA)
- **Framework**: React v19 with TypeScript, using Vite for fast builds.
- **UI Components** (shadcn/ui with Tailwind CSS):
  - **Dashboard**: Displays user metrics (weight, height), recent workouts, goals, and power bar with nickname.
  - **Exercise Selector**: Dropdown or list populated by `/getMuscleGroups`, with filters for muscle groups/body parts.
  - **Muscle Visualizer**: Renders images from `/getIndividualColorImage` with color customization.
  - **Workout Logger**: Form (React Hook Form + Zod) for inputting exercise details.
  - **Calendar**: FullCalendar library for planning and viewing routines.
  - **BMI Calculator**: Form for height/weight input, with results and history display.
  - **Timer**: Stopwatch and interval timer component.
- **State Management**: Redux Toolkit for managing API responses and user session data.
- **API Client**: Axios for calling the Muscle Group Image Generator API and Firestore.

### 4.2 Backend (Firebase)
- **Authentication**: Firebase Authentication for email/password login and JWT-based session management.
- **Database**: Firestore with collections for:
  - `users`: User profiles (uid, email, weight, height).
  - `workouts`: Workout logs (user_id, date, exercise_name, sets, reps, weight, duration).
  - `routines`: Saved workout routines (user_id, name, exercises, schedule).
  - `goals`: Fitness goals (user_id, description, target_value, deadline).
  - `bmi_history`: BMI records (user_id, weight, height, bmi, recorded_at).
- **Security Rules**: Restrict read/write access to authenticated users’ data (e.g., `allow read, write: if request.auth.uid == resource.data.user_id`).

### 4.3 External API (Muscle Group Image Generator)
- **Endpoints**:
  - `GET /getMuscleGroups`: Retrieves available muscle groups for the exercise selector.
  - `GET /getIndividualColorImage?muscleGroups={groups}&color={colors}&transparentBackground=0_or_3`: Generates images with highlighted muscle groups and custom colors.
- **Integration**: Axios requests with RapidAPI key stored in environment variables (via T3 Env).
- **Caching**: Store muscle group list and frequently used images in localStorage to reduce API calls.

### 4.4 Caching Layer
- **Purpose**: Minimize external API calls and improve performance.
- **Implementation**: Use localStorage for caching `/getMuscleGroups` responses and common muscle group images. Redux Toolkit Query for caching Firestore data.
- **Eviction Policy**: Clear cache on app version update or after 7 days.

## 5. Data Flow
1. **User Login**: User authenticates via Firebase Authentication, receiving a JWT.
2. **Dashboard Load**: Frontend fetches user data, recent workouts, goals, and power bar status from Firestore.
3. **Exercise Selection**: Frontend calls `/getMuscleGroups` to populate the selector, caches response, and displays filtered exercises.
4. **Muscle Visualization**: User selects exercises; frontend maps them to muscle groups, calls `/getIndividualColorImage`, and displays the image.
5. **Workout Logging**: User submits workout details via a form; frontend sends data to Firestore (`workouts` collection).
6. **Routine Planning**: User creates a routine; frontend saves it to Firestore (`routines` collection) and updates the calendar.
7. **BMI Calculation**: User inputs height/weight; frontend calculates BMI, displays it, and saves to Firestore (`bmi_history`).
8. **Timer**: Frontend runs a JavaScript timer for workout/rest intervals.
9. **Gamification**: Frontend counts weekly workouts from Firestore, updates the power bar (0–5), and assigns nicknames (e.g., 5+ workouts = Legend).

## 6. Non-Functional Requirements
- **Performance**: Page loads and API calls complete within 2 seconds (95th percentile, normal network conditions).
- **Scalability**: Support 1000 active users with Firestore’s auto-scaling and caching for API calls.
- **Security**: Firebase Authentication for secure user sessions; Firestore security rules to protect data; RapidAPI key stored in environment variables.
- **Usability**: Intuitive UI with ≤3 clicks to perform core actions (e.g., log workout).
- **Accessibility**: WCAG 2.1 compliance (high-contrast colors, keyboard navigation).
- **Reliability**: Handle Muscle Group Image Generator API downtime with cached images or fallback messages.

## 7. Scalability Considerations
- **Firestore**: Use composite indexes for frequent queries (e.g., `user_id` + `date` on `workouts`). Shard collections if user base exceeds 10,000.
- **Caching**: Cache API responses in localStorage and Firestore queries in Redux Toolkit Query to reduce latency.
- **Hosting**: Firebase Hosting’s CDN ensures low-latency delivery of static assets.
- **API Limits**: Monitor RapidAPI quota; cache common muscle group images to stay within limits.

## 8. Risks and Mitigations
- **Risk**: Muscle Group Image Generator API downtime or quota limits.
  - **Mitigation**: Cache responses and use static fallback images if API fails.
- **Risk**: Firestore performance degradation with high user load.
  - **Mitigation**: Optimize queries with indexes and denormalize data where necessary.
- **Risk**: User data security breaches.
  - **Mitigation**: Enforce strict Firestore security rules and sanitize all inputs.

## 9. Assumptions
- Muscle Group Image Generator API is reliable for MVP usage.
- Users have stable internet (4G/Wi-Fi) for API calls and Firebase access.
- Exercises are pre-mapped to muscle groups (e.g., bench press → chest, triceps).

## 10. Constraints
- **API Dependency**: Relies on RapidAPI for muscle visualization; requires error handling for downtime.
- **MVP Scope**: Excludes advanced features (e.g., social sharing) to focus on core functionality.
- **Tech Stack**: Adheres to React v19, TypeScript, Firebase, and template-specified tools.

## 12. Last Updated
2025-07-25