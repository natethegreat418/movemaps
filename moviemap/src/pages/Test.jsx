import { useState, useEffect } from 'react';
import { fetchAllTestEndpoints } from '../utils/testApi';

function Test() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({});
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        
        // Get environment info
        const env = {
          apiUrl: import.meta.env.VITE_API_URL,
          mode: import.meta.env.MODE,
          dev: import.meta.env.DEV,
          prod: import.meta.env.PROD
        };
        setDebugInfo(env);
        
        console.log('Test page fetching from all endpoints...');
        
        // Fetch from all test endpoints in parallel
        const allResults = await fetchAllTestEndpoints();
        console.log('Results from all endpoints:', allResults);
        setResults(allResults);
      } catch (err) {
        console.error('Test page error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAllData();
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
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Testing all API endpoints...</p>
        </div>
      ) : (
        <div>
          <h2>API Endpoint Test Results</h2>
          
          {/* Main table of all endpoint results */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Endpoint</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Locations Count</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Source</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(results).map(([name, data]) => (
                <tr key={name} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px' }}><b>{name}</b></td>
                  <td style={{ padding: '8px', color: data ? 'green' : 'red' }}>
                    {data ? 'Success' : 'Failed'}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {data?.locations?.length || 0}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {data?.source || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Detailed results for each endpoint */}
          {Object.entries(results).map(([name, data]) => data?.locations?.length > 0 && (
            <div key={name} style={{ marginBottom: '30px' }}>
              <h3>{name} ({data.locations.length} locations)</h3>
              
              {data.error && (
                <div style={{ color: 'red', marginBottom: '10px' }}>
                  <p><b>Error:</b> {data.error}</p>
                </div>
              )}
              
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Title</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {data.locations.map(location => (
                    <tr key={location.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '8px' }}>{location.id}</td>
                      <td style={{ padding: '8px' }}>{location.title}</td>
                      <td style={{ padding: '8px' }}>{location.type}</td>
                      <td style={{ padding: '8px' }}>{location.locationName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          
          {/* Error details for failed endpoints */}
          <h3>Endpoint Errors</h3>
          {Object.entries(results).map(([name, data]) => (
            data?.error && (
              <div key={`${name}-error`} style={{ 
                marginBottom: '15px', 
                padding: '10px', 
                background: '#fff0f0', 
                borderLeft: '3px solid #ff0000',
                borderRadius: '3px'
              }}>
                <h4>{name}</h4>
                <p><b>Error:</b> {data.error}</p>
                {data.stack && (
                  <details>
                    <summary>Stack trace</summary>
                    <pre style={{ maxHeight: '200px', overflow: 'auto', fontSize: '12px' }}>
                      {data.stack}
                    </pre>
                  </details>
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

export default Test;