# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
MovieMap displays filming locations of famous movies/TV shows on an interactive map using React, Node.js, Express, PostgreSQL with PostGIS, and Mapbox GL.

## Build Commands
- Frontend: `npm run dev` - Start Vite dev server
- Backend: `npm start` - Start Express server
- Test: `npm test` - Run test suite
- Lint: `npm run lint` - Run ESLint on project files

## Code Style Guidelines
- Use TypeScript for type safety across frontend and backend
- Follow React functional component patterns with hooks
- Use camelCase for variables/functions, PascalCase for components/classes
- Error handling: Use try/catch blocks with specific error messages
- Organize imports: React first, then external libraries, then local modules
- Frontend structure: components/, pages/, utils/ directories
- Database: Use parameterized queries to prevent SQL injection
- Security: Never commit API keys or secrets (.env files are gitignored)
- Mobile-first approach for responsive design