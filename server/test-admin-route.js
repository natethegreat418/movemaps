const fetch = require('node-fetch');

// Test the admin endpoints with the development token
async function testAdminRoute() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/profile', {
      headers: {
        'Authorization': 'Bearer test-token-moderator'
      }
    });
    
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAdminRoute();