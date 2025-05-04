import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/Map.css';
import { fetchLocations } from '../utils/api';

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default map center coordinates (San Francisco)
  const [lng, setLng] = useState(-122.4194);
  const [lat, setLat] = useState(37.7749);
  const [zoom, setZoom] = useState(3); // Start zoomed out to see more locations

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
        setError('Failed to load filming locations');
      } finally {
        setLoading(false);
      }
    };

    getLocations();
  }, []);

  // Initialize map
  useEffect(() => {
    // Set the access token from environment variables
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    
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

      // Create popup with location info
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <h3>${location.title}</h3>
          <p>Type: ${location.type === 'movie' ? 'Movie' : 'TV Show'}</p>
          <div class="popup-links">
            ${location.trailer_url ? `<a href="${location.trailer_url}" target="_blank" rel="noopener noreferrer">Watch Trailer</a>` : ''}
            ${location.imdb_link ? `<a href="${location.imdb_link}" target="_blank" rel="noopener noreferrer">IMDb Page</a>` : ''}
          </div>
        `);

      // Create and add the marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([location.lng, location.lat])
        .setPopup(popup)
        .addTo(map.current);

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
      {error && <div className="map-error">{error}</div>}
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default Map;
