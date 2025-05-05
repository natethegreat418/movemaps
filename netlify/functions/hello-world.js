// Simple hello world function to test Netlify Functions deployment
exports.handler = async function() {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: "Hello from Netlify Functions!",
      timestamp: new Date().toISOString()
    })
  };
};