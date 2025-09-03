# Overview

ROTA CERTA is a full-stack web application designed for PMESP (São Paulo Military Police) exam preparation and career progression. The platform serves two main user segments: aspiring candidates ("concurseiros") preparing for police entrance exams, and current military personnel seeking career advancement. The application features a comprehensive onboarding flow that personalizes the user experience based on their profile, goals, study preferences, and subject focus areas.

The platform is built as a modern web application with a React frontend and Express backend, utilizing PostgreSQL for data persistence and implementing session-based authentication through Replit's OAuth system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side application is built using **React 18** with **TypeScript** and follows a component-based architecture. Key architectural decisions include:

- **Routing**: Uses Wouter for lightweight client-side routing, supporting conditional route rendering based on authentication state
- **State Management**: Leverages React Query (@tanstack/react-query) for server state management, providing caching, synchronization, and background updates
- **UI Framework**: Implements Shadcn/UI components built on Radix UI primitives, providing accessible and customizable interface components
- **Styling**: Uses Tailwind CSS with CSS variables for theming, supporting light/dark mode through CSS custom properties
- **Form Handling**: Integrates React Hook Form with Zod validation for type-safe form management

The application structure separates concerns with dedicated directories for pages, components, hooks, and utilities. The onboarding flow is modularized into discrete components for each step, enabling easy maintenance and testing.

## Backend Architecture

The server-side is built with **Express.js** and follows a modular architecture pattern:

- **Database Layer**: Uses Drizzle ORM with PostgreSQL, providing type-safe database operations and schema management
- **Authentication**: Implements Replit OAuth integration with session management using express-session and PostgreSQL session store
- **API Design**: RESTful API endpoints with consistent error handling and request/response patterns
- **Storage Pattern**: Implements a storage interface pattern for database operations, enabling easy testing and potential future database migrations

The backend separates authentication logic, database operations, and route handling into distinct modules for maintainability.

## Data Storage Solutions

**Primary Database**: PostgreSQL hosted on Neon Database provides the main data persistence layer with the following schema design:

- **Users Table**: Stores user authentication data and profile information (required for Replit Auth)
- **User Profiles Table**: Contains onboarding data including user type, goals, study preferences, and subjects
- **Sessions Table**: Manages user session data for authentication persistence (required for Replit Auth)

The database schema uses UUID primary keys and implements proper foreign key relationships with cascade deletion for data integrity.

## Authentication and Authorization

The application uses **Replit's OAuth system** for authentication with the following implementation:

- **Session Management**: Utilizes PostgreSQL-backed session storage with 7-day TTL
- **User Data**: Automatically syncs user profile data from Replit OAuth claims
- **Route Protection**: Implements middleware-based route protection for authenticated endpoints
- **Security**: Uses secure HTTP-only cookies with proper CSRF protection

The authentication system is mandatory for Replit deployment and provides seamless integration with the Replit ecosystem.

## Build and Deployment

The application uses **Vite** for frontend build tooling and development server, with **esbuild** for backend compilation:

- **Development**: Vite dev server with hot module replacement and error overlay
- **Production**: Static asset generation with optimized bundling and tree-shaking
- **Server Bundling**: esbuild compiles the Express server to ESM format for production deployment

The build system supports both development and production environments with appropriate optimizations for each.

# External Dependencies

## Database Services
- **Neon Database**: PostgreSQL hosting service providing the primary database with connection pooling and automated backups
- **@neondatabase/serverless**: Client library for serverless-optimized database connections

## Authentication Services
- **Replit OAuth**: Integrated authentication system providing user identity and session management
- **OpenID Connect**: Standard protocol implementation for OAuth flows

## UI and Component Libraries
- **Radix UI**: Comprehensive set of accessible UI primitives for building the component system
- **Tailwind CSS**: Utility-first CSS framework for styling and responsive design
- **Lucide React**: Icon library providing consistent iconography throughout the application

## Development and Build Tools
- **Vite**: Frontend build tool and development server with fast HMR
- **TypeScript**: Type system providing compile-time error checking and developer experience improvements
- **ESBuild**: Fast JavaScript bundler for backend compilation

## Runtime Libraries
- **React Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation integration
- **Zod**: Schema validation library for type-safe data validation
- **Drizzle ORM**: Type-safe database ORM with schema management capabilities