import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import CryptanalysisResults from './CryptanalysisResults';
import './CryptanalysisStyle.css';

const API_URL = 'http://localhost:5000/api/encryption';

const Cryptanalysis = () => {
  const [ciphertext, setCiphertext] = useState('');
  const [algorithm, setAlgorithm] = useState('aes');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!ciphertext.trim()) {
      setError('Please enter ciphertext to analyze');
      return;
    }
    
    setError('');
    setAnalyzing(true);
    setResults(null);
    
    try {
      const response = await axios.post(`${API_URL}/analyze`, {
        text: ciphertext,
        algorithm
      });
      
      setResults(response.data);
    } catch (err) {
      console.error('Error analyzing ciphertext:', err);
      setError(err.response?.data?.error || 'An error occurred during analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  // Copy results to clipboard as JSON
  const copyResultsToClipboard = () => {
    if (!results) return;
    
    try {
      const resultsText = JSON.stringify(results, null, 2);
      navigator.clipboard.writeText(resultsText)
        .then(() => {
          alert('Analysis results copied to clipboard!');
        })
        .catch(err => {
          console.error('Error copying results: ', err);
        });
    } catch (err) {
      console.error('Error stringifying results:', err);
    }
  };
  
  // Clear form
  const clearForm = () => {
    setCiphertext('');
    setError('');
    setResults(null);
  };
  
  return (
    <div className="cryptanalysis-container">
      <div className="cryptanalysis-header">
        <h2><FontAwesomeIcon icon="chart-bar" /> Cryptanalysis Tools</h2>
        <p className="cryptanalysis-description">
          Analyze encrypted text to gather insights about the encryption method, 
          potential vulnerabilities, and statistical properties.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="cryptanalysis-form">
        <div className="algorithm-selection">
          <label htmlFor="algorithm">Select Algorithm to Analyze:</label>
          <div className="algorithm-buttons">
            <button 
              type="button" 
              className={`algorithm-button ${algorithm === 'aes' ? 'active' : ''}`}
              onClick={() => setAlgorithm('aes')}
            >
              <FontAwesomeIcon icon="shield-alt" /> AES
            </button>
            <button 
              type="button" 
              className={`algorithm-button ${algorithm === 'rsa' ? 'active' : ''}`}
              onClick={() => setAlgorithm('rsa')}
            >
              <FontAwesomeIcon icon="key" /> RSA
            </button>
            <button 
              type="button" 
              className={`algorithm-button ${algorithm === 'autokey' ? 'active' : ''}`}
              onClick={() => setAlgorithm('autokey')}
            >
              <FontAwesomeIcon icon="font" /> Autokey
            </button>
          </div>
        </div>
        
        <div className="input-area">
          <label htmlFor="ciphertext">Ciphertext to Analyze:</label>
          <textarea
            id="ciphertext"
            value={ciphertext}
            onChange={(e) => setCiphertext(e.target.value)}
            placeholder={`Enter ${algorithm.toUpperCase()} ciphertext to analyze...`}
            disabled={analyzing}
            rows={8}
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="cryptanalysis-actions">
          <button 
            type="button" 
            className="clear-button"
            onClick={clearForm}
            disabled={analyzing || (!ciphertext && !results)}
          >
            <FontAwesomeIcon icon="trash" /> Clear
          </button>
          
          <button 
            type="submit" 
            className="analyze-button"
            disabled={analyzing || !ciphertext.trim()}
          >
            {analyzing ? (
              <>
                <FontAwesomeIcon icon="spinner" spin /> Analyzing...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="search" /> Analyze
              </>
            )}
          </button>
        </div>
      </form>
      
      {results && (
        <>
          <CryptanalysisResults 
            results={results} 
            algorithm={algorithm} 
          />
          
          <div className="results-actions">
            <button 
              type="button"
              className="copy-results-button"
              onClick={copyResultsToClipboard}
            >
              <FontAwesomeIcon icon="copy" /> Copy Results
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cryptanalysis;
