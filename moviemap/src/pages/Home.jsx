import React from 'react';
import Map from '../components/Map';
import Header from '../components/Header';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="app-container">
      <Header />
      
      <div className="container">
        <main className="home-content">
          <div className="intro-section">
            <h1>Discover Filming Locations</h1>
            <p className="subtitle">Explore iconic movie and TV filming spots around the world</p>
          </div>
          
          <div className="map-section">
            <Map />
          </div>
          
          <div className="info-cards">
            <div className="info-card">
              <div className="info-card-icon">🎬</div>
              <h3>Explore</h3>
              <p>Browse the map to discover filming locations from your favorite movies and TV shows</p>
            </div>
            
            <div className="info-card">
              <div className="info-card-icon">🎥</div>
              <h3>Learn</h3>
              <p>Click markers to view details, watch trailers, and link to IMDb pages</p>
            </div>
            
            <div className="info-card">
              <div className="info-card-icon">📍</div>
              <h3>Contribute</h3>
              <p>Know a filming location? Submit it to help grow our database</p>
            </div>
          </div>
        </main>
        
        <footer className="footer">
          <p>© {new Date().getFullYear()} MovieMap | Discover film locations around the world</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
