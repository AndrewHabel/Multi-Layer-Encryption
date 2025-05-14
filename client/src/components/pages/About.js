import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="about-container">
      <h2>About Multi-Layer Encryption Tool</h2>
      
      <div className="about-section">
        <h3><FontAwesomeIcon icon="info-circle" /> Overview</h3>
        <p>
          The Multi-Layer Encryption Tool is a web application that demonstrates the concept of 
          encryption layering - applying multiple encryption algorithms sequentially to enhance 
          data security through defense in depth.
        </p>
      </div>

      <div className="about-section">
        <h3><FontAwesomeIcon icon="shield-alt" /> Supported Encryption Algorithms</h3>
        <ul className="algorithm-list">
          <li>
            <strong>AES (Advanced Encryption Standard)</strong>
            <p>
              A symmetric encryption algorithm widely used for securing sensitive data. 
              The application supports multiple key sizes (128, 192, 256-bit) and block cipher modes 
              (ECB, CBC, CTR).
            </p>
          </li>
          <li>
            <strong>RSA (Rivest-Shamir-Adleman)</strong>
            <p>
              An asymmetric encryption algorithm using public/private key pairs. 
              RSA is commonly used for secure data transmission. The application supports 
              key sizes from 1024 to 4096 bits.
            </p>
          </li>
          <li>
            <strong>Autokey Cipher</strong>
            <p>
              A classical polyalphabetic substitution cipher that uses the plaintext itself 
              as part of the key. While not considered secure by modern standards, it serves 
              as an educational example of historical cryptography.
            </p>
          </li>
        </ul>
      </div>

      <div className="about-section">
        <h3><FontAwesomeIcon icon="layer-group" /> How Multi-Layer Encryption Works</h3>
        <ol>
          <li>During <strong>encryption</strong>, the layers are applied from top (Layer 1) to bottom (Layer 3).</li>
          <li>During <strong>decryption</strong>, the layers are applied in reverse order, from bottom (Layer 3) to top (Layer 1).</li>
          <li>Data is normalized between layers to ensure compatibility between different encryption algorithms.</li>
        </ol>
        <p>
          This approach can enhance security by requiring an attacker to break multiple 
          encryption algorithms with different keys to access the original data.
        </p>
      </div>

      <div className="about-section">
        <h3><FontAwesomeIcon icon="chart-bar" /> Cryptanalysis Features</h3>
        <p>
          The application includes a cryptanalysis module to analyze encrypted text and provide insights about:
        </p>
        <ul className="feature-list">
          <li>
            <strong>AES Analysis</strong> - Evaluates entropy, detects block cipher modes, identifies potential weaknesses in implementation
          </li>
          <li>
            <strong>RSA Analysis</strong> - Estimates key size, chunk patterns, entropy properties, and overall security strength
          </li>
          <li>
            <strong>Autokey Analysis</strong> - Character frequency analysis, index of coincidence calculation, repeating sequence detection, and possible key characteristics
          </li>
        </ul>
        <p>
          <Link to="/cryptanalysis" className="feature-link">
            <FontAwesomeIcon icon="microscope" /> Explore Cryptanalysis Tools
          </Link>
        </p>
      </div>

      <div className="about-section">
        <h3><FontAwesomeIcon icon="exclamation-triangle" /> Security Notice</h3>
        <p className="security-notice">
          This application is designed for educational purposes to demonstrate encryption concepts. 
          While the implementation uses standard cryptographic libraries, it has not undergone 
          security auditing required for production systems. For sensitive data, please use 
          industry-standard solutions specific to your security requirements.
        </p>
      </div>
    </div>
  );
};

export default About;