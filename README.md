# Code Playground

A modern, mobile-first online code playground that supports Java and Python execution with Google OAuth authentication, code sharing, persistent storage, and one-click code formatting. Designed for seamless coding experience across all devices.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Google accounts
- ⚡ **Code Execution** - Run Java and Python code safely in containers
- 💾 **Persistent Storage** - Save and manage your code snippets
- 🔗 **Code Sharing** - Share playgrounds with unique URLs
- 🎨 **Monaco Editor** - Professional code editor with syntax highlighting
- ✨ **Code Formatting** - One-click code beautification for Java and Python
- 📱 **Mobile-First Design** - Fully responsive with mobile-optimized interface
- 🔄 **Mobile View Toggle** - Switch between code editor and output on mobile
- 🚀 **One-Click Deploy** - Deploy to Zeabur with a single click
- 🛠️ **Touch-Friendly UI** - Optimized buttons and interactions for mobile devices

## Tech Stack

### Backend
- Node.js & Express
- PostgreSQL database
- Passport.js for OAuth
- Secure code execution

### Frontend
- React 18
- Monaco Editor (VS Code editor) with mobile optimization
- Tailwind CSS with responsive design
- React Router
- Axios for API calls
- Lucide React icons

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Java 11+ (for code execution)
- Python 3+ (for code execution)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd code-playground
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your configuration:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/code_playground
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_random_session_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

4. Set up the database:
```bash
# Create database and run the schema
psql -d your_database < database-schema.sql
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: 
     - Development: `http://localhost:5001/api/auth/google/callback`
     - Production: `https://your-domain.com/api/auth/google/callback`
5. Copy the Client ID and Client Secret to your `.env` file

**Important**: Make sure to use HTTPS URLs for production environments to avoid redirect URI mismatch errors.

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - Store user information from Google OAuth
- **playgrounds** - Store code snippets and metadata
- **executions** - Store execution history and results

See `database-schema.sql` for complete schema.

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout user

### Playgrounds
- `GET /api/playground` - Get user's playgrounds
- `POST /api/playground` - Create new playground
- `GET /api/playground/:id` - Get specific playground
- `PUT /api/playground/:id` - Update playground
- `DELETE /api/playground/:id` - Delete playground
- `GET /api/playground/share/:token` - Get shared playground
- `POST /api/playground/:id/share` - Generate share link

### Code Execution
- `POST /api/execute` - Execute code (Java/Python)

## Deployment

### Deploy to Zeabur

1. Push your code to GitHub
2. Connect your GitHub repository to Zeabur
3. Zeabur will automatically detect Node.js project
4. Add PostgreSQL service in Zeabur
5. Set up environment variables in Zeabur dashboard
6. Deploy!

### Environment Variables for Production

Set these in your Zeabur dashboard:
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `SESSION_SECRET` - Random secret for sessions (use a long random string)
- `CLIENT_URL` - Your frontend URL (e.g., `https://your-domain.com`)
- `NODE_ENV=production` - **Important**: Must be set to "production" for HTTPS OAuth callbacks

## Mobile Features

- 📱 **Responsive Layout** - Automatically adapts to different screen sizes
- 🔄 **View Toggle** - Switch between code editor and output views on mobile
- ✨ **Code Formatting** - One-click code beautification with fallback formatting
- 👆 **Touch Optimization** - Larger touch targets and gesture-friendly interface
- 🎨 **Mobile Editor** - Monaco Editor optimized for mobile with:
  - Smaller font size for better readability
  - Word wrap enabled
  - Simplified suggestions and autocomplete
  - Touch-friendly scrolling

## Security Features

- Secure code execution in isolated environments
- Session-based authentication
- CORS protection
- Input validation and sanitization
- Execution timeout limits
- File system isolation for code execution
- HTTPS enforcement for production OAuth flows

## Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- Ensure you've added the correct callback URL in Google Cloud Console
- For production: `https://your-domain.com/api/auth/google/callback`
- For development: `http://localhost:5001/api/auth/google/callback`
- Verify `NODE_ENV=production` is set in production environment
- Check that your domain uses HTTPS in production

**OAuth not working after deployment**
- Wait 5-10 minutes for Google's configuration to propagate
- Check environment variables are correctly set in your hosting platform
- Verify the callback URL uses HTTPS for production deployments

### Build Issues

**Prettier/formatting errors during build**
- The app includes fallback formatting that doesn't require external dependencies
- Build-time formatting issues are resolved with simplified JavaScript-based formatting

### Database Connection Issues
- Verify DATABASE_URL is correctly formatted
- Ensure PostgreSQL service is running
- Check that the database schema has been applied

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.