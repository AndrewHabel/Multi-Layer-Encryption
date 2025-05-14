import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/encryption';

const EncryptionLayer = ({ layer, index, updateLayer, action }) => {
  const [showKeyFields, setShowKeyFields] = useState(false);
  const [showRSAGeneration, setShowRSAGeneration] = useState(false);
  const [generatingKeys, setGeneratingKeys] = useState(false);
  const [keySize, setKeySize] = useState('2048');

  // Handle algorithm change
  const handleAlgorithmChange = (e) => {
    const algorithm = e.target.value;
    
    // Create a new layer object with updated algorithm
    const updatedLayer = { 
      ...layer, 
      algorithm,
      // Reset key fields when changing algorithms
      key: '',
      publicKey: '',
      privateKey: ''
    };
    
    // Auto-populate fields with defaults based on algorithm
    if (algorithm === 'aes') {
      updatedLayer.keySize = '256';
      updatedLayer.mode = 'CBC';
    }
    
    updateLayer(updatedLayer);
    setShowKeyFields(algorithm !== 'none');
    setShowRSAGeneration(algorithm === 'rsa');
  };

  // Handle generic change for most fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateLayer({ ...layer, [name]: value });
  };

  // Generate RSA key pair
  const handleGenerateRSA = async () => {
    setGeneratingKeys(true);
    
    try {
      const response = await axios.post(`${API_URL}/generate-rsa-key`, {
        keySize: parseInt(keySize)
      });
      
      updateLayer({
        ...layer,
        publicKey: response.data.publicKey,
        privateKey: response.data.privateKey
      });
      
    } catch (error) {
      console.error('Error generating RSA keys:', error);
      alert('Failed to generate RSA keys. Please try again.');
    } finally {
      setGeneratingKeys(false);
    }
  };

  return (
    <div className="encryption-layer">
      <div className="layer-header">
        <h4>Layer {index + 1}</h4>
      </div>
      
      <div className="layer-content">
        <div className="algorithm-select">
          <label htmlFor={`algorithm-${index}`}>Algorithm:</label>
          <select
            id={`algorithm-${index}`}
            value={layer.algorithm}
            onChange={handleAlgorithmChange}
            name="algorithm"
          >
            <option value="none">None</option>
            <option value="aes">AES</option>
            <option value="rsa">RSA</option>
            <option value="autokey">Autokey Cipher</option>
          </select>
        </div>
        
        {showKeyFields && (
          <div className="layer-fields">
            {/* AES-specific fields */}
            {layer.algorithm === 'aes' && (
              <>
                <div className="field-group">
                  <label htmlFor={`key-${index}`}>
                    <FontAwesomeIcon icon="key" /> AES Key:
                  </label>
                  <input
                    type="password"
                    id={`key-${index}`}
                    name="key"
                    value={layer.key}
                    onChange={handleChange}
                    placeholder="Enter encryption key"
                  />
                </div>
                
                <div className="field-group">
                  <label htmlFor={`keySize-${index}`}>Key Size:</label>
                  <select
                    id={`keySize-${index}`}
                    name="keySize"
                    value={layer.keySize}
                    onChange={handleChange}
                  >
                    <option value="128">128-bit</option>
                    <option value="192">192-bit</option>
                    <option value="256">256-bit</option>
                  </select>
                </div>
                
                <div className="field-group">
                  <label htmlFor={`mode-${index}`}>Mode:</label>
                  <select
                    id={`mode-${index}`}
                    name="mode"
                    value={layer.mode}
                    onChange={handleChange}
                  >
                    <option value="ECB">ECB</option>
                    <option value="CBC">CBC</option>
                    <option value="CTR">CTR</option>
                  </select>
                </div>
              </>
            )}
            
            {/* RSA-specific fields */}
            {layer.algorithm === 'rsa' && (
              <>
                {action === 'encrypt' && (
                  <div className="field-group">
                    <label htmlFor={`publicKey-${index}`}>
                      <FontAwesomeIcon icon="key" /> Public Key:
                    </label>
                    <textarea
                      id={`publicKey-${index}`}
                      name="publicKey"
                      value={layer.publicKey}
                      onChange={handleChange}
                      placeholder="Enter RSA public key (PEM format)"
                      rows={4}
                    />
                  </div>
                )}
                
                {action === 'decrypt' && (
                  <div className="field-group">
                    <label htmlFor={`privateKey-${index}`}>
                      <FontAwesomeIcon icon="key" /> Private Key:
                    </label>
                    <textarea
                      id={`privateKey-${index}`}
                      name="privateKey"
                      value={layer.privateKey}
                      onChange={handleChange}
                      placeholder="Enter RSA private key (PEM format)"
                      rows={4}
                    />
                  </div>
                )}
                
                <div className="rsa-generator">
                  <button
                    type="button"
                    className="toggle-generator-button"
                    onClick={() => setShowRSAGeneration(!showRSAGeneration)}
                  >
                    {showRSAGeneration ? 'Hide Key Generator' : 'Show Key Generator'}
                  </button>
                  
                  {showRSAGeneration && (
                    <div className="rsa-generator-content">
                      <div className="field-group">
                        <label htmlFor={`rsaKeySize-${index}`}>Key Size:</label>
                        <select
                          id={`rsaKeySize-${index}`}
                          value={keySize}
                          onChange={(e) => setKeySize(e.target.value)}
                        >
                          <option value="1024">1024-bit</option>
                          <option value="2048">2048-bit</option>
                          <option value="4096">4096-bit</option>
                        </select>
                        
                        <button
                          type="button"
                          className="generate-button"
                          onClick={handleGenerateRSA}
                          disabled={generatingKeys}
                        >
                          {generatingKeys ? (
                            <>
                              <FontAwesomeIcon icon="sync" spin /> Generating...
                            </>
                          ) : (
                            'Generate Key Pair'
                          )}
                        </button>
                      </div>
                      <p className="key-generator-note">
                        <FontAwesomeIcon icon="info-circle" /> 
                        Note: This will generate both public and private keys
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Autokey Cipher fields */}
            {layer.algorithm === 'autokey' && (
              <div className="field-group">
                <label htmlFor={`key-${index}`}>
                  <FontAwesomeIcon icon="key" /> Autokey:
                </label>
                <input
                  type="text"
                  id={`key-${index}`}
                  name="key"
                  value={layer.key}
                  onChange={handleChange}
                  placeholder="Enter alphabetic key"
                />
                <p className="key-note">
                  <FontAwesomeIcon icon="info-circle" /> 
                  Autokey cipher requires an alphabetic key (A-Z only)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EncryptionLayer;