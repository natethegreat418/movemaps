import React from 'react';
import Map from '../components/Map';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <header className="home-header">
        <h1>MovieMap</h1>
        <p className="subtitle">Discover filming locations of famous movies and TV shows</p>
      </header>
      
      <main className="home-content">
        <div className="map-section">
          <Map />
        </div>
        
        <div className="instructions">
          <h2>How it works</h2>
          <ul>
            <li>Browse the map to discover filming locations</li>
            <li>Click on markers to see details about the movie or TV show</li>
            <li>Submit your own locations to add to the map</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Home;
