# Overview

This is a modern video project management web application built with a React frontend, Express backend, Drizzle ORM, and PostgreSQL database. The system provides a complete Kanban-style interface for managing video production projects across different stages, from briefing to approval. It includes role-based authentication (Admin, Gestor/Manager, Membro/Member), comprehensive project tracking, metrics visualization, and reporting capabilities. The application supports drag-and-drop project management, automated status logging, and specialized views for different user roles.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management with optimistic updates
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Drag & Drop**: react-beautiful-dnd for Kanban board functionality

## Backend Architecture  
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy and express-session
- **Password Security**: Node.js crypto module with scrypt hashing
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful endpoints with role-based access control

## Database Layer
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with schema validation
- **Schema Design**: 
  - Users table with role-based permissions (Admin, Gestor, Membro)
  - Projects table with status tracking and relationships
  - Types and Tags for categorization
  - Audit logging for status changes
- **Connection**: Connection pooling with @neondatabase/serverless

## Authentication & Authorization
- **Strategy**: Session-based authentication with secure password hashing
- **Roles**: Three-tier permission system (Admin > Gestor > Membro)
- **Session Management**: PostgreSQL-stored sessions with configurable expiration
- **Security**: CSRF protection, secure cookies in production, role-based route protection

## Key Features
- **Kanban Board**: Drag-and-drop interface for project status management
- **Project Lifecycle**: Nine distinct status stages from Briefing to Aprovado
- **Metrics Dashboard**: Real-time analytics with charts and project statistics  
- **Filtering System**: Multi-criteria filtering by status, assignee, type, priority
- **Reporting**: Exportable reports with date range filtering
- **YouTube Integration**: Link management for approved projects
- **Responsive Design**: Mobile-friendly interface with dark/light theme support

## Data Flow Patterns
- **Optimistic Updates**: Immediate UI updates with server reconciliation
- **Real-time Sync**: Automatic query invalidation and refetching
- **Form Validation**: Client and server-side validation with Zod schemas
- **Error Handling**: Centralized error management with toast notifications

# External Dependencies

## Core Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection and pooling
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **passport**: Authentication middleware with local strategy
- **express-session**: Session management with PostgreSQL storage
- **connect-pg-simple**: PostgreSQL session store adapter

## Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI primitive components
- **react-beautiful-dnd**: Drag and drop functionality for Kanban
- **react-hook-form**: Form state management and validation
- **wouter**: Lightweight routing library
- **date-fns**: Date manipulation and formatting
- **recharts**: Chart visualization library

## Development Tools
- **vite**: Frontend build tool and development server
- **typescript**: Type safety and development experience
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database schema management and migrations
- **zod**: Runtime type validation and schema parsing

## UI Enhancement
- **class-variance-authority**: Component variant management
- **clsx/tailwind-merge**: Conditional className utilities
- **lucide-react**: Icon library for consistent iconography