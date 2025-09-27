# Overview

This is a full-stack web application built as a step tracking health platform called "HealthStep". The application allows users to register, log in, and track their daily step counts with a clean, modern interface. It's designed as a foundation for expanding into a comprehensive healthcare platform with multiple health-related applications.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with **React** and **TypeScript**, utilizing a modern component-based architecture:

- **UI Framework**: React with TypeScript for type safety
- **Styling**: TailwindCSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

The application follows a clean folder structure with components organized in a `ui` directory, pages in separate route components, and shared utilities in dedicated folders.

## Backend Architecture
The backend uses **Node.js** with **Express** in a RESTful API pattern:

- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with clear separation of concerns
- **Error Handling**: Centralized error handling middleware
- **Request Logging**: Custom middleware for API request logging

The server structure includes dedicated modules for routes, database operations, and storage abstraction.

## Data Storage
The application uses **PostgreSQL** as the primary database:

- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle migrations for version control
- **Connection Pooling**: Neon serverless connection pool
- **Tables**: 
  - `users` table for authentication (email/password)
  - `steps` table for tracking daily step counts with user relationships

The database design supports simple email/password authentication and daily step tracking per user.

## Authentication System
The authentication is implemented with a simple but functional approach:

- **Strategy**: Custom email/password authentication
- **Storage**: Browser localStorage for client-side session persistence
- **Validation**: Zod schemas for input validation
- **Security**: Basic password storage (noted for future enhancement)

The system prioritizes simplicity and functionality over complex security features, making it easy to extend.

## External Dependencies

- **@neondatabase/serverless**: PostgreSQL database hosting and connection management
- **@radix-ui/***: Comprehensive set of unstyled UI primitives for building the interface
- **@tanstack/react-query**: Server state management and caching for API calls
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **tailwindcss**: Utility-first CSS framework for styling
- **wouter**: Minimalist routing library for React applications
- **zod**: Schema validation library for type-safe data validation
- **react-hook-form**: Performant forms library with easy validation

The application uses modern tooling focused on developer experience, type safety, and performance while maintaining a lightweight bundle size.