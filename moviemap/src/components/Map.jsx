import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/Map.css';
import LocationModal from './LocationModal';

// Hardcoded list of 5 filming locations
const FILMING_LOCATIONS = [
  {
    id: 1,
    title: 'The Dark Knight',
    year: 2008,
    type: 'movie',
    lat: 41.8781,
    lng: -87.6298,
    locationName: 'Chicago, Illinois (Lower Wacker Drive)',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    imdbLink: 'https://www.imdb.com/title/tt0468569/'
  },
  {
    id: 2,
    title: 'La La Land',
    year: 2016,
    type: 'movie',
    lat: 34.0675,
    lng: -118.2987,
    locationName: 'Griffith Observatory, Los Angeles',
    trailerUrl: 'https://www.youtube.com/watch?v=0pdqf4P9MB8',
    imdbLink: 'https://www.imdb.com/title/tt3783958/'
  },
  {
    id: 3,
    title: 'Lost in Translation',
    year: 2003,
    type: 'movie',
    lat: 35.6895,
    lng: 139.6917,
    locationName: 'Park Hyatt Tokyo, Shinjuku',
    trailerUrl: 'https://www.youtube.com/watch?v=W6iVPCRflQM',
    imdbLink: 'https://www.imdb.com/title/tt0335266/'
  },
  {
    id: 4,
    title: 'Game of Thrones',
    year: 2011,
    type: 'tv',
    lat: 42.6507,
    lng: 18.0944,
    locationName: 'Dubrovnik, Croatia (King\'s Landing)',
    trailerUrl: 'https://www.youtube.com/watch?v=KPLWWIOCOOQ',
    imdbLink: 'https://www.imdb.com/title/tt0944947/'
  },
  {
    id: 5,
    title: 'Inception',
    year: 2010,
    type: 'movie',
    lat: 43.7800,
    lng: 11.2471,
    locationName: 'Ponte Vecchio, Florence, Italy',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    imdbLink: 'https://www.imdb.com/title/tt1375666/'
  }
];

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locations] = useState(FILMING_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Default map center coordinates (World view)
  const [lng, setLng] = useState(0);
  const [lat, setLat] = useState(30);
  const [zoom, setZoom] = useState(2); // Start zoomed out to see the world

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
          {`${locations.length} filming locations found`}
        </div>
      </div>
      
      <div ref={mapContainer} className="map-container" />
      
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
