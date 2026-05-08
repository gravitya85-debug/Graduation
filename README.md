# Graduation Project - Technical Report & Overview

## 📌 Project Overview
This project is a modern, full-stack web application built using **React, Vite, and TypeScript**. It follows a feature-based architecture and relies on **Supabase** for backend services including authentication and database management. The application appears to be an educational or learning management platform given the presence of features like courses, postgraduate, certificates, and dashboard modules.

## 🛠️ Tech Stack
- **Frontend Framework:** React 19 (`^19.2.4`)
- **Build Tool:** Vite (`^8.0.1`)
- **Language:** TypeScript (`^6.0.2`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) with PostCSS
- **Routing:** React Router DOM (`^7.14.0`)
- **Backend / BaaS:** Supabase (`@supabase/supabase-js ^2.101.1`)
- **Animations:** Framer Motion (`^12.38.0`)
- **Icons:** Lucide React (`^1.7.0`)
- **Internationalization (i18n):** i18next & react-i18next
- **Notifications:** react-hot-toast

## 📂 Project Structure
The `src/` directory is organized into distinct domain-driven features and shared directories:

```text
src/
├── assets/        # Static assets like images and fonts
├── components/    # Shared, reusable UI components
├── context/       # React Context providers for global state
├── features/      # Domain-specific modules (Feature-Sliced Design)
│   ├── admin/         # Administration panel
│   ├── auth/          # Authentication flows (login, register)
│   ├── certificates/  # Certificate generation and management
│   ├── courses/       # Course catalog, details, ratings
│   ├── dashboard/     # User/Instructor dashboards
│   ├── jobs/          # Job board or career opportunities
│   ├── landing/       # Landing page components
│   ├── postgraduate/  # Postgraduate studies section
│   └── profile/       # User profile management
├── hooks/         # Custom React hooks
├── i18n/          # Internationalization configuration and translations
├── layouts/       # Page layout components (e.g., MainLayout, AuthLayout)
├── lib/           # Utility libraries and API clients (e.g., Supabase client)
├── services/      # Service layer for external APIs
└── types/         # Global TypeScript type definitions
```

## 🗄️ Database
The root directory includes SQL migration/initialization files for Supabase:
- `supabase-complete-setup.sql`
- `supabase-course-lessons-setup.sql`
- `supabase-courses-pricing-reviews.sql`

These files indicate structured schemas for courses, pricing, lessons, and reviews. 

## 🚀 Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in the development mode using Vite.

### `npm run build`
Builds the app for production to the `dist` folder.

### `npm run lint`
Runs ESLint to check for code quality and linting errors.

### `npm run preview`
Locally preview the production build.
