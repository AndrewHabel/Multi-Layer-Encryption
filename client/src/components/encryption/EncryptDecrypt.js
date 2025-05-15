import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import EncryptionLayer from './EncryptionLayer';
import ProcessingLog from './ProcessingLog';

const API_URL = 'http://localhost:5000/api/encryption';

const EncryptDecrypt = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [action, setAction] = useState('encrypt');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [processingSteps, setProcessingSteps] = useState([]);
  const [showLog, setShowLog] = useState(false);

  // Define the default encryption layers
  const defaultLayer = {
    algorithm: 'none',
    key: '',
    keySize: '256',
    mode: 'CBC',
    publicKey: '',
    privateKey: ''
  };

  const [layers, setLayers] = useState([
    { ...defaultLayer },
    { ...defaultLayer },
    { ...defaultLayer }
  ]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      setError('Please enter text to process');
      return;
    }
    
    // Check if at least one layer has an algorithm selected
    const hasActiveLayer = layers.some(layer => layer.algorithm && layer.algorithm !== 'none');
    if (!hasActiveLayer) {
      setError('Please select an encryption algorithm for at least one layer');
      return;
    }
    
    // Validate required keys for each active layer
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (layer.algorithm === 'none' || !layer.algorithm) continue;
      
      if (layer.algorithm === 'aes' && !layer.key) {
        setError(`Layer ${i+1}: AES encryption requires a key`);
        return;
      }
      
      if (layer.algorithm === 'rsa') {
        if (action === 'encrypt' && !layer.publicKey) {
          setError(`Layer ${i+1}: RSA encryption requires a public key`);
          return;
        }
        if (action === 'decrypt' && !layer.privateKey) {
          setError(`Layer ${i+1}: RSA decryption requires a private key`);
          return;
        }
      }        if (layer.algorithm === 'autokey') {
        if (!layer.key) {
          setError(`Layer ${i+1}: Autokey cipher requires a numeric key`);
          return;
        }
        const numKey = parseInt(layer.key);
        if (isNaN(numKey)) {
          setError(`Layer ${i+1}: Autokey cipher requires a valid numeric value`);
          return;
        }
      }
    }
    
    setError('');
    setProcessing(true);
    setProcessingSteps(['Starting processing...']);
    
    try {
      const response = await axios.post(`${API_URL}/process`, {
        text: inputText,
        action,
        layers
      });
      
      setOutputText(response.data.result);
      setProcessingSteps(response.data.steps || []);
      setShowLog(true);
    } catch (err) {
      console.error('Error processing data:', err);
      setError(err.response?.data?.error || 'An error occurred during processing');
      setProcessingSteps(err.response?.data?.steps || ['Error occurred during processing']);
      setShowLog(true);
    } finally {
      setProcessing(false);
    }
  };

  // Toggle between encrypt and decrypt modes
  const toggleAction = () => {
    setAction(action === 'encrypt' ? 'decrypt' : 'encrypt');
    setOutputText('');
    setError('');
    setProcessingSteps([]);
    setShowLog(false);
  };

  // Swap input and output text
  const swapInputOutput = () => {
    setInputText(outputText);
    setOutputText('');
    setProcessingSteps([]);
    setShowLog(false);
  };

  // Handle layer updates
  const updateLayer = (index, updatedLayer) => {
    const newLayers = [...layers];
    newLayers[index] = updatedLayer;
    setLayers(newLayers);
  };

  // Clear all inputs
  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError('');
    setProcessingSteps([]);
    setShowLog(false);
    setLayers([
      { ...defaultLayer },
      { ...defaultLayer },
      { ...defaultLayer }
    ]);
  };

  // Copy output text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Error copying text: ', err);
      });
  };
  
  // Download output as text file
  const downloadOutput = () => {
    const element = document.createElement("a");
    const file = new Blob([outputText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${action === 'encrypt' ? 'encrypted' : 'decrypted'}_text.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="encrypt-decrypt-container">
      <div className="mode-toggle">
        <button 
          className={`mode-button ${action === 'encrypt' ? 'active' : ''}`}
          onClick={toggleAction}
          disabled={processing}
        >
          <FontAwesomeIcon icon="lock" /> Encrypt
        </button>
        <button 
          className={`mode-button ${action === 'decrypt' ? 'active' : ''}`}
          onClick={toggleAction}
          disabled={processing}
        >
          <FontAwesomeIcon icon="unlock" /> Decrypt
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="encryption-form">
        <div className="text-area-container">
          <div className="text-area-wrapper">
            <label htmlFor="inputText">
              {action === 'encrypt' ? 'Plain Text' : 'Encrypted Text'}:
            </label>
            <textarea
              id="inputText"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={action === 'encrypt' 
                ? 'Enter text to encrypt...' 
                : 'Enter encrypted text to decrypt...'}
              disabled={processing}
              rows={10}
            />
          </div>
          
          <div className="text-controls">
            <button 
              type="button" 
              className="control-button swap-button"
              onClick={swapInputOutput}
              disabled={processing || !outputText}
              title="Use output as new input"
            >
              <FontAwesomeIcon icon="exchange-alt" />
            </button>
          </div>
          
          <div className="text-area-wrapper">
            <label htmlFor="outputText">
              {action === 'encrypt' ? 'Encrypted Text' : 'Decrypted Text'}:
            </label>
            <textarea
              id="outputText"
              value={outputText}
              readOnly
              placeholder={action === 'encrypt' 
                ? 'Encrypted output will appear here...' 
                : 'Decrypted output will appear here...'}
              rows={10}
            />
            <div className="output-controls">
              {outputText && (
                <>
                  <button 
                    type="button" 
                    className="output-control-button"
                    onClick={copyToClipboard}
                    title="Copy to clipboard"
                  >
                    <FontAwesomeIcon icon="copy" />
                  </button>
                  <button 
                    type="button" 
                    className="output-control-button"
                    onClick={downloadOutput}
                    title="Download as file"
                  >
                    <FontAwesomeIcon icon="download" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="layers-container">
          <h3>
            <FontAwesomeIcon icon="layer-group" /> 
            Encryption Layers ({action === 'encrypt' ? 'Applied Top-to-Bottom' : 'Applied Bottom-to-Top'})
          </h3>
          
          <div className="encryption-layers">
            {layers.map((layer, index) => (
              <EncryptionLayer
                key={index}
                layer={layer}
                index={index}
                updateLayer={(updatedLayer) => updateLayer(index, updatedLayer)}
                action={action}
              />
            ))}
          </div>
        </div>        <div className="action-buttons-container">
          <button 
            type="button" 
            className="clear-all-button"
            onClick={clearAll}
            disabled={processing}
          >
            <FontAwesomeIcon icon="trash" /> Clear All
          </button>
          <button 
            type="submit" 
            className={action === 'encrypt' ? 'encrypt-button' : 'decrypt-button'}
            disabled={processing}
          >
            {processing ? (
              <>
                <FontAwesomeIcon icon="sync" spin /> Processing...
              </>
            ) : (
              <>
                {action === 'encrypt' ? (
                  <><FontAwesomeIcon icon="lock" /> Encrypt</>
                ) : (
                  <><FontAwesomeIcon icon="unlock" /> Decrypt</>
                )}
              </>
            )}
          </button>
        </div>
      </form>
      
      {(processingSteps.length > 0 && showLog) && (
        <ProcessingLog steps={processingSteps} />
      )}
    </div>
  );
};

export default EncryptDecrypt;