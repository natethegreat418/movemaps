# Deploying MovieMap to Netlify

This guide will walk you through the steps to deploy the MovieMap frontend to Netlify.

## Prerequisites

- A GitHub account
- A Netlify account
- Your MovieMap repository pushed to GitHub

## Deployment Steps

### 1. Push Your Code to GitHub

Make sure your code is pushed to GitHub, including the netlify.toml file and other configuration files.

```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin master
```

### 2. Connect to Netlify

1. Go to [Netlify](https://app.netlify.com/) and log in
2. Click "New site from Git"
3. Select GitHub as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select your MovieMap repository

### 3. Configure Build Settings

Netlify should automatically detect the settings from your netlify.toml file, but verify:

- Base directory: `moviemap/`
- Build command: `npm run build`
- Publish directory: `dist`

### 4. Configure Environment Variables

Add the following environment variables in Netlify's site settings:

1. Go to Site settings > Build & deploy > Environment
2. Add these variables:
   - `VITE_API_URL` - URL of your deployed backend (if available)
   - `VITE_MAPBOX_TOKEN` - Your Mapbox token
   - Firebase configuration variables (if using Firebase)

### 5. Deploy

1. Click "Deploy site"
2. Wait for the build to complete
3. Your site will be available at a Netlify subdomain (e.g., https://your-site.netlify.app)

### 6. Custom Domain (Optional)

If you have a custom domain:

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to set up your domain

## Troubleshooting

- If you encounter build errors, check the build logs in Netlify
- Ensure all required environment variables are set
- Verify your netlify.toml configuration is correct
- Check that your React app works locally with `npm run build && npm run preview`

## Post-Deployment

After deployment, verify:

1. All routes work correctly (refresh pages, test navigation)
2. The map loads properly 
3. Sample locations display correctly
4. UI is responsive on different devices