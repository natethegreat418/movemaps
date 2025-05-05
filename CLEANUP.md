# MovieMap Cleanup Tasks

This document outlines recommended cleanup tasks for the MovieMap application based on a comprehensive code review.

## 1. CSS and Styling Improvements

### High Priority
- **Consolidate CSS Variables**: Remove duplication between App.css and theme.css
  - Keep theme.css as the single source of truth for all variables
  - Update all components to use the standardized variable names (--color-*)
  - Remove redundant variable definitions from App.css

- **Remove index.css**: This file contains default Vite template styles that conflict with the custom theme
  - Remove the import from main.jsx
  - Ensure any needed styles are properly migrated to theme.css

- **Eliminate Style Conflicts**: Resolve conflicting style definitions across files
  - Consolidate body, button, and anchor styling into theme.css only
  - Remove duplicate utility classes for margins, padding, etc.

### Medium Priority
- **Clean Up CSS Reset Rules**: Keep only one set of CSS reset rules in theme.css
- **Standardize Spacing and Layout**: Ensure consistent use of spacing variables throughout the app
- **Optimize Media Queries**: Consolidate and standardize breakpoint definitions

## 2. JavaScript and React Code

### High Priority
- **Remove Debug Console Logs**: Remove all debug console.log statements from production code
  - api.js has numerous console.log statements
  - Could be replaced with a proper logging utility that respects environment

- **Fix Redundant Imports**: Remove unnecessary duplicate imports
  - theme.css is imported in multiple files
  - Some components have redundant React imports

### Medium Priority
- **Standardize Props Handling**: Add PropTypes or TypeScript type definitions
- **Improve Error Handling**: Implement more consistent error handling patterns
- **Refactor Map Component**: The Map.jsx component could be broken down into smaller, more focused components

## 3. Database Implementation

### High Priority
- **Remove SQL Query Pattern**: Refactor the `query()` method in firestore.js
  - Replace SQL-like string parsing with direct method calls
  - Update route handlers to use specific methods rather than SQL queries
  - Example: Replace `db.query('SELECT * FROM locations')` with `db.getLocations()`

- **Simplify Firebase Initialization**: Streamline the complex initialization in config/firebase.js
  - Consolidate the fallback chain logic
  - Reduce duplicate code paths for mock creation

### Medium Priority
- **Consistent Error Handling**: Create a shared error handling utility
- **Eliminate Redundant Compatibility Code**: Remove SQLite compatibility methods like `close()`
- **Centralize Sample Data**: Maintain sample location data in a single file that's imported where needed

## 4. Deployment and Configuration

### High Priority
- **Optimize Netlify Configuration**: Review and possibly simplify netlify.toml
  - The base path in Vite config isn't necessary if using HashRouter correctly

### Medium Priority
- **Update Environment Variable Documentation**: Ensure documentation accurately reflects all required variables
- **Create Development Setup Guide**: Document the exact steps for a new developer to set up the project

## 5. General Code Organization

### Medium Priority
- **Add Component Documentation**: Add JSDoc comments to key components and functions
- **Organize Imports**: Standardize import order and grouping
- **Review File Structure**: Ensure component file organization follows a consistent pattern

## Implementation Plan

For an efficient cleanup process, it's recommended to tackle these items in the following order:

1. CSS/styling consolidation
2. Database implementation cleanup
3. Removal of debug logs and redundant code
4. Optimization of deployment configuration

This approach minimizes the risk of regressions and ensures the most impactful changes are made first.