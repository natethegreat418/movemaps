const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = 3002; // Different port to avoid conflicts

// Enable CORS for all routes
app.use(cors());

// Serve the test HTML file
app.use(express.static('.'));

// Create proxy middleware
const apiProxy = createProxyMiddleware('/api', {
  target: 'http://localhost:3000', // Target API server
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // No rewrite needed if paths match
  },
  onProxyRes: function(proxyRes, req, res) {
    // Add CORS headers to the proxied response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept';
  },
  logLevel: 'debug' // Set to 'debug' to see what's happening with the proxy
});

// Use the proxy middleware
app.use('/api', apiProxy);

// Start server
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
  console.log(`Access your test file at: http://localhost:${port}/cors-test.html`);
  console.log(`API requests will be proxied to http://localhost:3000/api`);
});