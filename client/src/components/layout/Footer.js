import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Multi-Layer Encryption Tool</p>
        <p className="disclaimer">
          Note: This application is for educational purposes. 
          For sensitive data, use industry-standard encryption solutions.
        </p>
      </div>
    </footer>
  );
};

export default Footer;