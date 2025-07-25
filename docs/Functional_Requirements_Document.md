# Functional Requirements Document (FRD) - RepFlow Fitness Tracker Web App

## 1. Purpose
The Fitness Tracker Web App enables users to plan, log, and track workouts, focusing on exercises by muscle group or body part, with visual feedback via the Muscle Group Image Generator API. The app includes a personal dashboard, workout logging, weekly routine planning, a BMI calculator, a workout timer, and a gamification system to motivate users. This FRD outlines the functional requirements to guide development, ensuring a user-friendly, functional app that meets user needs while maintaining simplicity.

## 2. Scope
The app targets fitness enthusiasts (beginners to advanced) and includes:
- Exercise selection with muscle group visualization.
- Workout logging and progress tracking.
- Weekly routine planning with a calendar view.
- Personal dashboard for user metrics and progress.
- BMI calculator with history tracking.
- Workout timer for session and rest intervals.
- Gamification system with a power bar and nicknames based on weekly workout frequency.
- Integration with the Muscle Group Image Generator API for visual feedback.

The initial scope (MVP) prioritizes core functionalities, with advanced features (e.g., social sharing, advanced analytics) considered for future iterations.

## 3. User Stories and Epics
The following user stories, grouped into epics, define the app’s core functionalities based on user needs.

### Epic 1: Exercise Selection and Muscle Group Visualization
- **US1.1**: As a fitness enthusiast, I want to filter exercises by muscle group or body part so that I can focus on specific areas for my workout.
- **US1.2**: As a beginner, I want to see a visual representation of the muscle groups targeted by my selected exercises so that I understand what parts of my body I’m training.
- **US1.3**: As a user, I want to customize the colors of highlighted muscle groups in the visual image so that I can differentiate between primary and secondary muscles worked.

### Epic 2: Workout Logging and Progress Tracking
- **US2.1**: As a user, I want to log my workouts (including exercise name, sets, reps, weight, duration) so that I can keep a record of my training history.
- **US2.2**: As a fitness enthusiast, I want to view my workout history with metrics like total volume lifted or time spent so that I can track my progress over time.
- **US2.3**: As a user, I want to set fitness goals (e.g., increase bench press weight by 10% in 8 weeks) so that I can stay motivated and measure my success.

### Epic 3: Weekly Routine Planning and Calendar
- **US3.1**: As a user, I want to plan my weekly workout routine (e.g., full body, upper body, legs, cardio) so that I can follow a structured schedule.
- **US3.2**: As a fitness enthusiast, I want a calendar view to see my planned workouts and past activities so that I can stay organized and consistent.
- **US3.3**: As a user, I want to save custom workout routines so that I can reuse them without recreating them each time.

### Epic 4: Personal Dashboard
- **US4.1**: As a user, I want a dashboard to view my current weight, height, recent workouts, and progress toward goals so that I have a centralized view of my fitness journey.
- **US4.2**: As a user, I want to update my weight and height periodically so that my fitness metrics remain accurate.

### Epic 5: BMI Calculator
- **US5.1**: As a health-conscious user, I want to calculate my BMI based on my height and weight so that I can assess my overall health status.
- **US5.2**: As a user, I want to see my BMI history so that I can track changes over time.

### Epic 6: Workout Timing
- **US6.1**: As a user, I want to time my workouts or rest periods during a session so that I can stay on track with my training pace.

### Epic 7: Gamification and Motivation
- **US7.1**: As a user, I want a power bar with levels (0–5) based on my weekly workout frequency so that I can track my consistency and stay motivated.
- **US7.2**: As a user, I want to earn nicknames (Sleeper, Rookie, Builder, Machine, Beast, Legend) based on my power bar level so that I feel rewarded for my efforts.

## 4. Functional Requirements
The following requirements detail the app’s functionality, ensuring all user stories are addressed. Each requirement includes acceptance criteria to validate implementation.

### FR1: Exercise Selection
- **Description**: Users can select exercises by filtering based on muscle group (e.g., chest, back, legs) or body part (e.g., upper body, lower body).
- **Implementation**: Use the Muscle Group Image Generator API’s `/getMuscleGroups` endpoint to populate a dropdown or list of muscle groups.
- **Acceptance Criteria**:
  - Users can view a list of muscle groups retrieved from the API.
  - Users can filter exercises by selecting one or more muscle groups or body parts.
  - The interface updates dynamically to show relevant exercises.

### FR2: Muscle Group Visualization
- **Description**: Display an anatomical image with highlighted muscle groups based on selected exercises, with customizable colors for primary and secondary muscles.
- **Implementation**: Call the `/getIndividualColorImage` API endpoint with comma-separated muscle groups and colors (e.g., `muscleGroups=chest,back&color=red,blue`).
- **Acceptance Criteria**:
  - The app displays an image with highlighted muscle groups corresponding to selected exercises.
  - Users can customize colors for muscle groups (e.g., red for primary, blue for secondary).
  - The image loads within 2 seconds under normal network conditions.
  - A fallback message is shown if the API call fails.

### FR3: Workout Logging
- **Description**: Users can log workouts, including exercise name, sets, reps, weight, and duration.
- **Implementation**: Provide a form for inputting workout details, stored in a database via a `POST /api/workouts` endpoint.
- **Acceptance Criteria**:
  - Users can input and save workout details (exercise name, sets, reps, weight, duration).
  - Logged workouts are saved with a timestamp and associated with the user’s account.
  - Input validation ensures positive numbers for sets, reps, and weight.

### FR4: Progress Tracking
- **Description**: Users can view workout history and progress metrics (e.g., total volume lifted, total workout time) and set fitness goals.
- **Implementation**: Fetch data via `GET /api/workouts` and `GET /api/goals` endpoints, displaying metrics in charts or tables.
- **Acceptance Criteria**:
  - Users can view a list of past workouts with details (date, exercises, metrics).
  - Progress charts show metrics like total volume lifted over time.
  - Users can set and view goals (e.g., “Increase squat weight to 100kg by Dec 2025”) with progress tracking.

### FR5: Weekly Routine Planning
- **Description**: Users can plan weekly workout routines and save them for reuse, viewable in a calendar.
- **Implementation**: Use a calendar library (e.g., FullCalendar) and store routines via `POST /api/routines`.
- **Acceptance Criteria**:
  - Users can create and save a workout routine with selected exercises and schedule (e.g., Monday: Full Body).
  - The calendar displays planned and past workouts.
  - Users can select and apply saved routines to future dates.

### FR6: Personal Dashboard
- **Description**: A centralized dashboard displays user metrics (weight, height), recent workouts, progress toward goals, and gamification status.
- **Implementation**: Aggregate data via `GET /api/dashboard`, displaying metrics in a clean UI.
- **Acceptance Criteria**:
  - The dashboard shows current weight, height, recent workouts, and goal progress.
  - Users can update weight and height via a form.
  - The dashboard loads within 2 seconds under normal network conditions.

### FR7: BMI Calculator
- **Description**: Users can calculate their BMI based on height and weight and view BMI history.
- **Implementation**: Provide a form for inputting height and weight, calculate BMI (weight / height²), and store results via `POST /api/bmi`.
- **Acceptance Criteria**:
  - Users can input height (m) and weight (kg) to calculate BMI.
  - BMI results are displayed with a category (e.g., Normal, Overweight).
  - BMI history is shown in a table or chart.
  - Input validation ensures positive numbers for height and weight.

### FR8: Workout Timer
- **Description**: Users can time their workouts or rest intervals during a session.
- **Implementation**: Implement a JavaScript-based stopwatch and interval timer in the frontend.
- **Acceptance Criteria**:
  - Users can start, pause, and reset a workout timer.
  - Users can set rest intervals (e.g., 60 seconds) with audible or visual alerts.
  - The timer remains accurate within 1 second.

### FR9: Gamification System
- **Description**: A power bar with 6 levels (0–5) tracks weekly workout frequency, assigning nicknames: Sleeper (0), Rookie (1), Builder (2), Machine (3), Beast (4), Legend (5).
- **Implementation**: Track weekly workout logs, update the power bar level based on workout frequency (e.g., 1 workout = Level 1, 5+ workouts = Level 5), and display the nickname.
- **Acceptance Criteria**:
  - The power bar updates weekly based on the number of workouts logged (e.g., 1 workout = Level 1, 5+ workouts = Level 5).
  - The current level and nickname are displayed on the dashboard.
  - The system resets the count every week (e.g., Monday reset).
  - Nicknames are assigned as follows:
    - 0 workouts: Sleeper
    - 1 workout: Rookie
    - 2 workouts: Builder
    - 3 workouts: Machine
    - 4 workouts: Beast
    - 5+ workouts: Legend

## 5. Non-Functional Requirements
- **Usability**: The app must have an intuitive UI with minimal clicks (≤3) to perform core actions (e.g., log workout, view dashboard).
- **Performance**: Pages and API calls should load within 2 seconds under normal network conditions.
- **Security**: User data (e.g., weight, workout logs) must be stored securely with authentication (e.g., JWT) and input sanitization.
- **Accessibility**: The app should be WCAG 2.1 compliant (e.g., high-contrast colors, keyboard navigation).
- **Scalability**: The app should support up to 10,000 active users with minimal performance degradation.

## 6. Assumptions
- The Muscle Group Image Generator API is reliable, with sufficient quota for MVP usage.
- Users have basic internet connectivity (e.g., 4G or Wi-Fi) for API calls and app usage.
- Exercises are mapped to muscle groups internally (e.g., bench press → chest, triceps).
- Users provide valid height and weight inputs for BMI calculations.

## 7. Constraints
- **API Dependency**: The app relies on the Muscle Group Image Generator API for visualization, requiring error handling for downtime or quota limits.
- **MVP Scope**: Advanced features (e.g., social sharing, personalized workout plans) are deferred to future iterations.

## 8. Dependencies
- **External API**: Muscle Group Image Generator API (RapidAPI) for muscle group listing and image generation.
- **Libraries**: React or Vue.js (frontend), Node.js/Express or Django (backend), PostgreSQL (database), FullCalendar (calendar), Chart.js (progress charts).
- **Authentication**: JWT or OAuth for user authentication.