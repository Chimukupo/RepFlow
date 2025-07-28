# RepFlow - Intelligent Fitness Tracking Application

**RepFlow** is a modern, full-featured fitness tracking web application designed to revolutionize how users plan, execute, and monitor their workout routines through intelligent muscle group visualization and gamified motivation systems.

## 🎯 Overview

RepFlow provides a seamless, responsive experience that caters to fitness enthusiasts from beginners to advanced athletes. The application's core strength lies in its integration with the Muscle Group Image Generator API, which delivers real-time anatomical visualizations that help users understand exactly which muscle groups they're targeting during their workouts, complete with customizable color-coding for primary and secondary muscles.

## ✨ Key Features

### 🏋️ Exercise Selection & Muscle Group Visualization
- Filter exercises by specific muscle groups or body parts
- Dynamic anatomical images highlighting targeted muscle areas
- Customizable color-coding for primary and secondary muscles
- Real-time visual feedback during workout planning

### 📊 Workout Logging & Progress Tracking
- Detailed recording of exercises, sets, reps, weights, and duration
- Comprehensive historical analysis and trend visualization
- Personal goal setting and progress monitoring
- Advanced analytics and performance metrics

### 📅 Weekly Routine Planning
- Integrated calendar system for scheduling workouts
- Reusable workout templates and routines
- Drag-and-drop workout planning interface
- Smart scheduling recommendations

### 🎮 Gamification System
- Dynamic power bar with 6 levels (0-5) based on weekly activity
- Motivational nicknames: Sleeper → Rookie → Builder → Machine → Beast → Legend
- Achievement badges and milestone rewards
- Weekly challenges and consistency tracking

### 📈 Personal Dashboard
- Centralized hub for all fitness metrics
- Real-time progress visualization
- Quick access to recent workouts and goals
- Personalized insights and recommendations

### 🏥 Health & BMI Tracking
- Body Mass Index calculator with category classification
- Historical BMI trend analysis
- Health recommendations based on fitness data
- Weight and measurement tracking

### ⏱️ Workout Timer System
- Precision timing for workout sessions
- Customizable rest interval timers
- Audio and visual alerts
- Session performance tracking

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS v4** for responsive, utility-first styling
- **shadcn/ui** for accessible, customizable components
- **React Hook Form + Zod** for form handling and validation

### Backend & Infrastructure
- **Firebase Authentication** for secure user management
- **Firestore** for real-time database operations
- **Firebase Hosting** for global CDN deployment
- **Muscle Group Image Generator API** (RapidAPI) for anatomical visualizations

### Development & Deployment
- **Turborepo** for efficient monorepo management
- **PNPM** for optimized package management
- **ESLint + Prettier** for code quality
- **Vitest** for comprehensive testing

## 🚀 Live Application

- **Production**: [https://rep-flow-prod.web.app](https://rep-flow-prod.web.app)
- **Staging**: [https://rep-flow-staging.web.app](https://rep-flow-staging.web.app)

## 🏗️ Architecture

RepFlow follows a modern monorepo architecture:

```
RepFlow/
├── apps/
│   └── web/                 # React frontend application
├── packages/
│   ├── shared/              # Shared schemas, utilities, types
│   └── seeding/             # Database seeding utilities
├── docs/                    # Comprehensive documentation
├── scripts/                 # Deployment and setup scripts
└── firebase.json           # Firebase configuration
```

## 🎨 Design Philosophy

RepFlow embraces a clean, professional design with:
- **Glassmorphism effects** for modern visual appeal
- **Touch-friendly interfaces** optimized for all devices
- **Consistent spacing and typography** for excellent UX
- **Semantic color usage** through CSS custom properties
- **Accessibility-first approach** meeting WCAG 2.1 standards

## 🔒 Security & Performance

- **Sub-2-second load times** with optimized bundle splitting
- **JWT authentication** with secure session management
- **Input sanitization** and validation at all levels
- **Scalable architecture** supporting 10,000+ concurrent users
- **Comprehensive error handling** for external API dependencies

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:
- [Functional Requirements Document](docs/Functional_Requirements_Document.md)
- [Technical Design Document](docs/Technical_Design_Document.md)
- [System Design Document](docs/System_Design_Document.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [API Documentation](docs/API%20Endpoint%20Documentation.md)

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- PNPM package manager
- Firebase CLI

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd RepFlow

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Deployment
```bash
# Deploy to staging
pnpm run deploy:staging

# Deploy to production
pnpm run deploy:prod
```

## 🎯 Target Users

RepFlow is designed for:
- **Fitness Beginners** seeking guided workout planning with visual feedback
- **Intermediate Athletes** wanting detailed progress tracking and goal setting
- **Advanced Fitness Enthusiasts** requiring comprehensive analytics and routine optimization
- **Personal Trainers** needing client progress monitoring tools

## 🌟 Why RepFlow?

RepFlow stands out by combining:
- **Visual Learning** through anatomical muscle group visualization
- **Data-Driven Insights** with comprehensive analytics
- **Gamified Motivation** to maintain consistency
- **Professional Design** with intuitive user experience
- **Scalable Technology** built for growth and reliability

---

**RepFlow** - *Elevate your fitness journey with intelligent tracking and visual insights.*