# Supabase Configuration for Task Manager Frontend

## Overview

This document outlines the Supabase configuration for the React frontend of the Task Manager application. The frontend uses Supabase for authentication and database operations.

## Database Schema

The application uses the following Supabase tables:

### Users Table
- `id` (UUID): Primary key, auto-generated
- `email` (VARCHAR): Unique user email
- `full_name` (VARCHAR): User's full name
- `created_at` (TIMESTAMP): Account creation timestamp

### Tasks Table
- `id` (UUID): Primary key, auto-generated
- `title` (VARCHAR): Task title (required, max 200 chars)
- `description` (TEXT): Task description (optional, max 1000 chars)
- `priority` (VARCHAR): Task priority ('low', 'medium', 'high')
- `status` (VARCHAR): Task status ('pending', 'completed')
- `due_date` (TIMESTAMP): Optional due date
- `user_id` (UUID): Foreign key to users table
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp
- `completed_at` (TIMESTAMP): Completion timestamp (nullable)

## Environment Variables

Required environment variables for the frontend:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=your-supabase-anon-key
REACT_APP_SITE_URL=http://localhost:3000
```

## Authentication Configuration

### Supabase Dashboard Settings

1. **Authentication > URL Configuration:**
   - Site URL: Set to your production domain (e.g., https://yourapp.com)
   - Redirect URLs: Add both development and production URLs
     * http://localhost:3000/auth/callback
     * https://yourapp.com/auth/callback

2. **Authentication > Providers:**
   - Enable Email authentication
   - Configure OAuth providers if needed (Google, GitHub, etc.)

3. **Authentication > Email Templates:**
   - Customize confirmation and reset password templates
   - Use `{{ .SiteURL }}` and `{{ .RedirectTo }}` variables

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Policies enforce data isolation based on `auth.uid()`

### Authentication Flow
1. User signs up/signs in through Supabase Auth
2. JWT tokens are automatically managed by Supabase client
3. All API calls include authentication headers
4. Backend validates tokens and enforces user permissions

## Integration Architecture

### Frontend Components
- **AuthContext**: Manages authentication state globally
- **Supabase Client**: Configured in utils/supabase.js
- **API Service**: Abstracts database operations
- **Auth Guards**: Protect routes requiring authentication

### Authentication Methods
- Email/password authentication
- Magic link authentication (optional)
- OAuth providers (optional)
- Password reset functionality

## Usage Instructions

### 1. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Update with your Supabase credentials
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_KEY=your_supabase_anon_key
```

### 2. Install Dependencies
```bash
npm install @supabase/supabase-js
```

### 3. Initialize Supabase Client
The Supabase client is configured in `src/utils/supabase.js` with:
- Project URL and API key from environment variables
- Authentication persistence
- Automatic token refresh

### 4. Authentication Integration
- Login/signup forms use Supabase Auth methods
- Authentication state is managed in React Context
- Protected routes check authentication status
- Automatic redirect to login for unauthenticated users

## Error Handling

### Common Scenarios
- Network connectivity issues
- Authentication token expiration
- Database permission errors
- Validation failures

### Implementation
- Global error boundaries for React components
- Retry logic for network requests
- User-friendly error messages
- Logging for debugging

## Production Considerations

### Security
- Use environment-specific redirect URLs
- Enable email confirmation in production
- Configure proper CORS settings
- Use HTTPS for all production URLs

### Performance
- Enable connection pooling
- Use appropriate indexes on database tables
- Implement proper caching strategies
- Monitor query performance

### Monitoring
- Enable Supabase analytics
- Monitor authentication metrics
- Track database performance
- Set up error reporting

## Development Workflow

1. Local development uses localhost URLs
2. Authentication redirects work with local server
3. Database changes are reflected immediately
4. Hot reload maintains authentication state

## Troubleshooting

### Common Issues
- **Authentication redirects**: Check URL configuration in Supabase dashboard
- **CORS errors**: Verify allowed origins in Supabase settings
- **Token expiration**: Implement automatic token refresh
- **Database permissions**: Check RLS policies and user roles

### Debug Steps
1. Check browser network tab for API errors
2. Verify environment variables are loaded
3. Test authentication flow step by step
4. Validate database policies in Supabase dashboard
