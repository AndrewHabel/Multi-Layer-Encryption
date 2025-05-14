import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  return (
    <nav className={`navbar ${darkMode ? 'dark-mode' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FontAwesomeIcon icon="layer-group" className="navbar-icon" />
          Multi-Layer Encryption
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              <FontAwesomeIcon icon="lock" className="nav-icon" /> Encrypt/Decrypt
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/cryptanalysis" className="nav-link">
              <FontAwesomeIcon icon="chart-bar" className="nav-icon" /> Cryptanalysis
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link">
              <FontAwesomeIcon icon="info-circle" className="nav-icon" /> About
            </Link>
          </li>
          <li className="nav-item">
            <button className="theme-toggle" onClick={toggleDarkMode}>
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;