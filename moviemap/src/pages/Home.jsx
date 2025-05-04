import React from 'react';
import Map from '../components/Map';

const Home = () => {
  return (
    <div className="home-page">
      <h1>MovieMap</h1>
      <p>Discover filming locations of famous movies and TV shows</p>
      <Map />
    </div>
  );
};

export default Home;
