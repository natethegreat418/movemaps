import React from 'react';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <span className="logo-text">Movie<span className="logo-highlight">Map</span></span>
        </div>
        <nav className="main-nav">
          <ul>
            <li><a href="/" className="active">Map</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/submit" className="nav-button">Submit Location</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;