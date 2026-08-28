# Campus OS

Campus OS is a full-stack, AI-powered Student Intelligence Platform designed to turn academic data into actionable insights, providing attendance intelligence, academic risk forecasting, and career roadmap planning.

## Features
- **Attendance Intelligence**: Real-time tracking and safe absence calculators.
- **Academic Analytics**: SGPA/CGPA modeling, target score calculators, and grading trends.
- **Career Discovery Engine**: AI-driven career fit assessments and roadmap generation.
- **Campus Copilot**: A context-aware AI assistant utilizing CopilotKit and Groq.
- **Smart Recommendations**: Centralized, prioritized academic and career action items.
- **Progressive Web App**: Installable on iOS/Android with secure offline capabilities.

## Architecture & Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express, HTTP-only JWT sessions
- **Database**: PostgreSQL, Prisma ORM
- **AI Integrations**: CopilotKit, Groq (Llama-3/Mixtral)
- **Deployment**: Monolithic architecture (Vite app served statically from Express in production)

---

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- Docker (for local PostgreSQL)

### 1. Database Setup
Start the local PostgreSQL database using Docker:
```bash
docker compose up -d
```

### 2. Environment Variables
Create a `.env` file based on `.env.example`:
```bash
# Required
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campus_os?schema=public"
JWT_SECRET="your-super-secret-local-key"
GROQ_API_KEY="your-groq-api-key"

# Optional (Google Sign-In)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```
*Note: Never commit your `.env` file containing real secrets to version control.*

### 3. Install & Migrate
```bash
npm install
npx prisma migrate dev --name init
```

### 4. Run the Application
```bash
npm run dev
```

---

## Production Deployment

Campus OS is designed as a monolithic Node.js application, making it perfectly suited for platforms like Render, Railway, or Heroku.

### 1. Build the Application
```bash
npm run build
```

### 2. Production Environment Variables
Configure the following secrets in your hosting provider's dashboard:
- `NODE_ENV=production`
- `DATABASE_URL` (URL of your managed PostgreSQL database, e.g., Supabase or Neon)
- `JWT_SECRET` (A strong, randomly generated cryptographic key)
- `GROQ_API_KEY` (Your production Groq key)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### 3. Google OAuth Setup
Ensure your Google Cloud Console is configured with the correct production origins and redirect URIs:
- **Authorized JavaScript origins**: `https://your-production-domain.com`
- **Authorized redirect URIs**: `https://your-production-domain.com/api/auth/google/callback`

### 4. Database Migrations
Run the production deployment migration step as part of your build process:
```bash
npm run migrate:deploy
```

### 5. Start the Server
```bash
npm start
```

## Security Considerations
- **Sessions**: JWTs are stored in HTTP-only, secure, SameSite=Lax cookies to prevent XSS exfiltration.
- **CORS/Headers**: Helmet is used for basic security headers. Content Security Policy is currently relaxed to support Google OAuth and CopilotKit iframe integrations.
- **Rate Limiting**: Authentication endpoints (`/api/auth/*`) are protected by `express-rate-limit` to prevent brute force attacks.
- **Data Isolation**: All protected API endpoints enforce strict authorization checks against the `req.user.id` derived safely from the HTTP-only cookie.
