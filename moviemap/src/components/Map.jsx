import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/Map.css';
import LocationModal from './LocationModal';
import { fetchLocations } from '../utils/api';

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Default map center coordinates (World view)
  const [lng, setLng] = useState(0);
  const [lat, setLat] = useState(30);
  const [zoom, setZoom] = useState(2); // Start zoomed out to see the world

  // Fetch locations from API
  useEffect(() => {
    const getLocations = async () => {
      try {
        setLoading(true);
        const data = await fetchLocations();
        setLocations(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
        setError(`Failed to load filming locations: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    getLocations();
  }, []);

  // Initialize map
  useEffect(() => {
    // Set the access token from environment variables
    // If token is missing, use a public default token (limited functionality)
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2tjeHd0aXhlMDN0ODJybW9hZ2s3bnJ2aCJ9.Uu1SFj4oPgSBPKu7A3c1AQ';
    
    // Initialize the map only if it hasn't been initialized already
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: zoom
      });

      // Add navigation controls (zoom in/out, rotation)
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add a geolocation control to center on user's location
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );

      // Set up event handlers after map is loaded
      map.current.on('load', () => {
        setMapLoaded(true);
      });

      // Update state when map moves
      map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });
    }

    // Clean up map instance on component unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add markers when locations change or map is loaded
  useEffect(() => {
    // Make sure map and locations are loaded
    if (!map.current || !mapLoaded || locations.length === 0) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each location
    locations.forEach(location => {
      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'map-marker';
      markerEl.innerHTML = '<div class="marker-pin"></div>';
      
      // Add type class (movie or tv)
      markerEl.classList.add(`marker-${location.type}`);

      // Create and add the marker (without popup)
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([location.lng, location.lat])
        .addTo(map.current);

      // Add click event to open modal instead of popup
      markerEl.addEventListener('click', () => {
        setSelectedLocation(location);
      });

      // Store marker reference for later cleanup
      markersRef.current.push(marker);
    });

    // Adjust the map bounds to fit all markers if there are multiple
    if (locations.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      
      locations.forEach(location => {
        bounds.extend([location.lng, location.lat]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 10
      });
    } else if (locations.length === 1) {
      // If there's only one location, center on it
      map.current.flyTo({
        center: [locations[0].lng, locations[0].lat],
        zoom: 13
      });
    }
  }, [locations, mapLoaded]);

  return (
    <div className="map-wrapper">
      <div className="map-info">
        <div className="map-coordinates">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
        <div className="map-location-count">
          {loading ? 'Loading locations...' : `${locations.length} filming locations found`}
        </div>
      </div>
      
      {error && (
        <div className="map-error">
          <h3>Error Loading Locations</h3>
          <p>{error}</p>
          <p>Please check your internet connection and try again, or contact support if the issue persists.</p>
        </div>
      )}
      
      <div ref={mapContainer} className="map-container">
        {loading && <div className="map-loading-overlay">
          <div className="map-loading-spinner"></div>
          <p>Loading filming locations...</p>
        </div>}
      </div>
      
      {/* Location modal */}
      {selectedLocation && (
        <LocationModal 
          location={selectedLocation} 
          onClose={() => setSelectedLocation(null)} 
        />
      )}
    </div>
  );
};

export default Map;