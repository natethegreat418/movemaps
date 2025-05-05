import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            <span className="logo-text">Movie<span className="logo-highlight">Map</span></span>
          </Link>
        </div>
        <nav className="main-nav">
          <ul>
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
              >
                Map
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className={location.pathname === '/about' ? 'active' : ''}
              >
                About
              </Link>
            </li>
            <li>
              <Link to="/submit" className="nav-button">Submit Location</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;