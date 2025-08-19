# Code Playground

A LeetCode-style online code playground that supports Java and Python execution with Google OAuth authentication, code sharing, and persistent storage.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Google accounts
- ⚡ **Code Execution** - Run Java and Python code safely in containers
- 💾 **Persistent Storage** - Save and manage your code snippets
- 🔗 **Code Sharing** - Share playgrounds with unique URLs
- 🎨 **Monaco Editor** - Professional code editor with syntax highlighting
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🚀 **One-Click Deploy** - Deploy to Zeabur with a single click

## Tech Stack

### Backend
- Node.js & Express
- PostgreSQL database
- Passport.js for OAuth
- Docker for code execution isolation

### Frontend
- React 18
- Monaco Editor (VS Code editor)
- Tailwind CSS
- React Router
- Axios for API calls

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
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback` (dev) and your production callback URL
5. Copy the Client ID and Client Secret to your `.env` file

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
3. Zeabur will automatically detect the `zeabur.json` configuration
4. Set up environment variables in Zeabur dashboard
5. Deploy!

The `Dockerfile` includes multi-stage build for optimized production deployment.

### Environment Variables for Production

Set these in your Zeabur dashboard:
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `SESSION_SECRET` - Random secret for sessions
- `CLIENT_URL` - Your frontend URL
- `NODE_ENV=production`

## Security Features

- Secure code execution in isolated environments
- Session-based authentication
- CORS protection
- Input validation and sanitization
- Execution timeout limits
- File system isolation for code execution

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.