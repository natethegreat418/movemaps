# CORS Testing Guide

This document provides guidance on testing and resolving CORS issues in the MovieMap application.

## What Are CORS Issues?

Cross-Origin Resource Sharing (CORS) issues occur when your browser prevents a web page from making requests to a different domain than the one that served the web page. This is a security feature built into browsers.

## Our CORS Solution

The current setup uses a Vite development server proxy to handle CORS issues during local development:

1. In development mode, the frontend makes requests to a relative URL path (`/api/...`)
2. The Vite development server proxies these requests to `http://localhost:3000`
3. This approach completely avoids CORS issues during local development

## Testing Steps

To verify that the CORS setup is working correctly, follow these steps:

### 1. Start the Backend Server

```bash
cd server
npm run dev
```

### 2. Start the Frontend Development Server

```bash
cd moviemap
npm run dev
```

The Vite dev server should start and provide a local URL (usually http://localhost:5173).

### 3. Open the Application and Check for CORS Errors

- Open the browser developer console (F12 or right-click → Inspect → Console)
- Navigate to the main page of the application
- Look for any CORS-related errors in the console

If you see no CORS errors and the application loads data correctly, the setup is working!

## Troubleshooting

If you're still experiencing CORS issues, try these troubleshooting steps:

### Check Your Backend Server

Ensure the Express server is running and that the CORS middleware is correctly configured:

```javascript
// In server/index.js
app.use(cors({
  origin: '*', // In development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
```

### Verify Frontend API Configuration

Make sure the frontend is using a relative path for API requests in development:

```javascript
// In moviemap/src/utils/env.js
export const getApiUrl = () => {
  if (isDevelopment()) {
    return '/api';
  }
  
  return import.meta.env.VITE_API_URL || null;
};
```

### Try Direct Fetch Test

You can try a direct fetch test in your browser console:

```javascript
fetch('/api/locations')
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
```

### Check Network Requests

In your browser's developer tools, go to the Network tab and observe the API requests:
- Status codes
- Request URLs
- Response headers (look for CORS headers)

## Production Environment

In production, CORS issues are handled differently:

1. The Netlify function has CORS headers configured
2. The frontend makes requests to the specified `VITE_API_URL`

## Manual CORS Testing Tool

For advanced testing, you can use this simple HTML file to test CORS configurations:

```html
<!DOCTYPE html>
<html>
<head>
  <title>CORS Test</title>
</head>
<body>
  <h1>MovieMap CORS Test</h1>
  <button id="testApiButton">Test API</button>
  <pre id="result" style="background: #f0f0f0; padding: 10px;"></pre>

  <script>
    document.getElementById('testApiButton').addEventListener('click', async () => {
      const resultElement = document.getElementById('result');
      resultElement.textContent = 'Testing API connection...';
      
      try {
        // Test with your local API endpoint
        const response = await fetch('/api/locations');
        const data = await response.json();
        
        resultElement.textContent = 'Success!\n\nData:\n' + 
          JSON.stringify(data, null, 2);
      } catch (error) {
        resultElement.textContent = 'Error: ' + error.message;
        console.error(error);
      }
    });
  </script>
</body>
</html>
```

Save this as `cors-test.html` in the `moviemap/public` directory and access it via your dev server.

## Additional Resources

- [Vite Proxy Documentation](https://vitejs.dev/config/server-options.html#server-proxy)
- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors.html)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)