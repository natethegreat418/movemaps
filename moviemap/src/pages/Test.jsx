import { useState, useEffect } from 'react';

function Test() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [staticLocations, setStaticLocations] = useState([]);
  const [staticLoading, setStaticLoading] = useState(true);
  const [staticError, setStaticError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // Direct function URLs to bypass any redirects
  // Use environment variable or fallback to hardcoded URL
  const directFunctionUrl = import.meta.env.VITE_FUNCTION_URL || 'https://moviemaps.net/.netlify/functions/locations-list';
  const staticFunctionUrl = 'https://moviemaps.net/.netlify/functions/static-locations';

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Get environment info
        const env = {
          apiUrl: import.meta.env.VITE_API_URL,
          functionUrl: import.meta.env.VITE_FUNCTION_URL,
          mode: import.meta.env.MODE,
          dev: import.meta.env.DEV,
          prod: import.meta.env.PROD
        };
        setDebugInfo(env);
        
        console.log('Test page fetching from:', directFunctionUrl);
        
        const response = await fetch(directFunctionUrl, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Check content type to avoid parsing HTML as JSON
        const contentType = response.headers.get('content-type');
        let data;
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`Received non-JSON response (${contentType})`);
          // Log the first 100 characters of response for debugging
          const text = await response.text();
          console.error(`Response starts with: ${text.substring(0, 100)}...`);
          throw new Error(`Expected JSON but got ${contentType || 'unknown'} response type`);
        } else {
          data = await response.json();
        }
          
        console.log('Received data:', data);
        
        if (data.locations && Array.isArray(data.locations)) {
          setLocations(data.locations);
        } else {
          setError('Invalid response format');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchStaticData() {
      try {
        setStaticLoading(true);
        
        console.log('Test page fetching static data from:', staticFunctionUrl);
        
        const response = await fetch(staticFunctionUrl, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Check content type to avoid parsing HTML as JSON
        const contentType = response.headers.get('content-type');
        let data;
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`Received non-JSON response from static API (${contentType})`);
          // Log the first 100 characters of response for debugging
          const text = await response.text();
          console.error(`Static response starts with: ${text.substring(0, 100)}...`);
          throw new Error(`Expected JSON but got ${contentType || 'unknown'} response type from static API`);
        } else {
          data = await response.json();
        }
        
        console.log('Received static data:', data);
        
        if (data.locations && Array.isArray(data.locations)) {
          setStaticLocations(data.locations);
        } else {
          setStaticError('Invalid response format');
        }
      } catch (err) {
        console.error('Static fetch error:', err);
        setStaticError(err.message);
      } finally {
        setStaticLoading(false);
      }
    }
    
    fetchData();
    fetchStaticData();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>API Test Page</h1>
      
      {debugInfo && (
        <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
          <h2>Environment</h2>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <h2>Firestore Locations ({locations.length})</h2>
          {loading ? (
            <p>Loading locations...</p>
          ) : error ? (
            <div style={{ color: 'red' }}>
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Title</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {locations.map(location => (
                  <tr key={location.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px' }}>{location.id}</td>
                    <td style={{ padding: '8px' }}>{location.title}</td>
                    <td style={{ padding: '8px' }}>{location.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div style={{ flex: '1 1 400px' }}>
          <h2>Static Test Locations ({staticLocations.length})</h2>
          {staticLoading ? (
            <p>Loading static data...</p>
          ) : staticError ? (
            <div style={{ color: 'red' }}>
              <h3>Error</h3>
              <p>{staticError}</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Title</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {staticLocations.map(location => (
                  <tr key={location.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px' }}>{location.id}</td>
                    <td style={{ padding: '8px' }}>{location.title}</td>
                    <td style={{ padding: '8px' }}>{location.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Test;