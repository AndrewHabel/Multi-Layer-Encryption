import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faLock, faUnlock, faKey, faExchangeAlt, faPlus, faMinus, 
  faLayerGroup, faDownload, faCopy, faTrash, faInfoCircle, 
  faSync, faChartBar, faShieldAlt, faFont, faSearch, 
  faSpinner, faMicroscope, faCalculator, faRandom, 
  faFileCode, faCode, faCube, faCog, faComment, 
  faLightbulb, faCheckCircle, faAngleRight, faRetweet,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Navbar from './components/layout/Navbar';
import EncryptDecrypt from './components/encryption/EncryptDecrypt';
import Cryptanalysis from './components/cryptanalysis/Cryptanalysis';
import About from './components/pages/About';
import Footer from './components/layout/Footer';
import './App.css';
import './components/layout/ButtonStyles.css';

// Add FontAwesome icons to library
library.add(
  faLock, 
  faUnlock, 
  faKey, 
  faExchangeAlt, 
  faPlus, 
  faMinus, 
  faLayerGroup,
  faDownload,
  faCopy,
  faTrash,
  faInfoCircle,
  faSync,
  faChartBar,
  faShieldAlt,
  faFont,
  faSearch,
  faSpinner,
  faMicroscope,
  faCalculator,
  faRandom,
  faFileCode,
  faCode,
  faCube,
  faCog,
  faComment,
  faLightbulb,
  faCheckCircle,
  faAngleRight,
  faRetweet,
  faExclamationTriangle
);

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Apply dark mode to HTML element
    if (newDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };

  // Add effect to initialize dark mode on component mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <div className="container">
          <Routes>
            <Route path="/" element={<EncryptDecrypt />} />
            <Route path="/cryptanalysis" element={<Cryptanalysis />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
