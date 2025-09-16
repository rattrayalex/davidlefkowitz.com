# Overview

This is a composer's portfolio website for David S. Lefkowitz, built as a full-stack web application. The site showcases compositions, recordings, blog posts, and provides contact functionality. It integrates with Notion as a headless CMS for content management, allowing the composer to manage their portfolio content through familiar Notion interfaces while presenting it through a polished, professional web presence.

## Recent Updates (September 16, 2025)
- **Human-readable URLs**: Implemented slug-based URLs for blog posts and recordings (e.g., `/recordings/Reimagine_Beethoven_&_Ravel` instead of UUID-based URLs)
- **Blog Formatting Fixes**: Resolved issues with line breaks appearing around italic text and hyperlinks in blog posts
- **UI Improvements**: Fixed padding issues on recording detail pages, particularly for streaming links section
- **Image Migration**: Successfully migrated all 72 images from local filesystem to Replit App Storage for production compatibility
- **Heading Alignment**: Updated all main page headings to be left-aligned with 64px left padding

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern component-based UI built with React 18 and TypeScript for type safety
- **Wouter Router**: Lightweight client-side routing solution for navigation between pages
- **Shadcn/ui Components**: Pre-built UI component library based on Radix UI primitives with Tailwind CSS styling
- **Tailwind CSS**: Utility-first CSS framework for responsive design and consistent styling
- **React Query**: Data fetching and caching library for managing server state and API interactions
- **React Hook Form**: Form handling with Zod validation for type-safe form submissions

## Backend Architecture  
- **Express.js Server**: RESTful API server handling data requests and business logic
- **TypeScript**: Full-stack type safety with shared types between client and server
- **Notion API Integration**: Uses Notion as a headless CMS for content management
- **Session-based Architecture**: Express sessions for any future authentication needs
- **Vite Development**: Hot module replacement and fast builds in development mode

## Content Management Strategy
- **Notion as CMS**: All content (compositions, recordings, blog posts) managed through Notion databases
- **Dynamic Database Creation**: Server can programmatically create and configure Notion databases
- **Structured Content Types**: Well-defined schemas for different content types (compositions, recordings, blog posts)
- **Real-time Content**: Content changes in Notion are reflected immediately on the website

## Database Design
- **Drizzle ORM**: Type-safe database toolkit configured for PostgreSQL
- **Neon Database**: Serverless PostgreSQL database for scalable data storage
- **Schema Management**: Centralized schema definitions in shared directory for type consistency
- **Migration Support**: Database migration system for schema updates
- **SEO-friendly URLs**: Slug fields added to blog posts and recordings tables for human-readable URLs

## Styling and Design System
- **Design Tokens**: CSS custom properties for consistent theming and spacing
- **Component Variants**: Class variance authority for systematic component styling
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Typography**: Custom font loading with Inter and Playfair Display for professional appearance

# External Dependencies

## Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library for React
- **react-hook-form**: Form handling with validation
- **@hookform/resolvers**: Zod integration for form validation

## UI and Styling
- **@radix-ui/react-***: Comprehensive suite of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utilities

## Backend Services
- **@notionhq/client**: Official Notion API client for content management
- **@neondatabase/serverless**: Neon PostgreSQL database driver
- **drizzle-orm**: Type-safe database ORM
- **drizzle-kit**: Database migration and schema management tools

## Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution environment for Node.js
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Data Validation
- **zod**: Runtime type validation and schema definitions
- **drizzle-zod**: Integration between Drizzle ORM and Zod schemas

## Database Configuration
- **PostgreSQL**: Primary database (Neon serverless)
- **Connection**: Uses DATABASE_URL environment variable
- **Migrations**: Stored in ./migrations directory
- **Schema**: Centralized in ./shared/schema.ts