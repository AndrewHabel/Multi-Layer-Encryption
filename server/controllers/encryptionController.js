const encryptionUtils = require('../utils/encryptionUtils');

/**
 * Process data with multiple encryption layers
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const processData = (req, res) => {
  try {
    const { text, action, layers } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text to process is required' });
    }
    
    if (!action || !['encrypt', 'decrypt'].includes(action)) {
      return res.status(400).json({ error: 'Valid action (encrypt or decrypt) is required' });
    }
    
    if (!layers || !Array.isArray(layers) || layers.length === 0) {
      return res.status(400).json({ error: 'At least one layer configuration is required' });
    }
    
    // Process steps for logging
    const steps = [];
    let processedData = text;
    
    // Process each layer in order for encryption, reverse order for decryption
    const layerIndices = action === 'encrypt' ? [0, 1, 2] : [2, 1, 0];
    
    for (const i of layerIndices) {
      // Skip if beyond provided layer array
      if (i >= layers.length) continue;
      
      const layer = layers[i];
      if (!layer.algorithm || layer.algorithm === 'none') {
        steps.push(`Layer ${i + 1}: No encryption selected, skipping`);
        continue;
      }
      
      // Process based on algorithm
      switch(layer.algorithm) {        case 'aes':
          if (!layer.key) {
            return res.status(400).json({ error: `AES key is required for Layer ${i + 1}` });
          }
          
          // Validate key length based on key size
          const keySizeBits = parseInt(layer.keySize);
          const requiredLength = keySizeBits / 8; // 128-bit -> 16 chars, 192-bit -> 24 chars, 256-bit -> 32 chars
          
          if (layer.key.length !== requiredLength) {
            return res.status(400).json({ 
              error: `AES key must be exactly ${requiredLength} characters for ${keySizeBits}-bit encryption (Layer ${i + 1})` 
            });
          }
          
          steps.push(`Processing Layer ${i + 1}: AES ${layer.mode} ${action}`);
          
          if (action === 'encrypt') {
            if (i > 0 && layers[i-1].algorithm !== 'none') {
              processedData = encryptionUtils.normalizeLayerData(processedData, layers[i-1].algorithm, 'aes');
              steps.push(`Normalized data from ${layers[i-1].algorithm} for AES encryption`);
            }
            processedData = encryptionUtils.aesEncrypt(processedData, layer.key, layer.keySize, layer.mode);
          } else {
            try {
              processedData = encryptionUtils.aesDecrypt(processedData, layer.key, layer.keySize, layer.mode);
            } catch (error) {
              return res.status(400).json({ 
                error: `AES decryption failed in Layer ${i+1}: ${error.message}`,
                steps: steps
              });
            }
            
            // If there's another layer after this one during decryption, normalize the data
            if (action === 'decrypt' && i > 0 && layers[i-1].algorithm !== 'none') {
              processedData = encryptionUtils.normalizeLayerData(
                processedData, 
                'aes', 
                layers[i-1].algorithm
              );
              steps.push(`Normalized AES output for ${layers[i-1].algorithm} decryption`);
            }
          }
          break;
          
        case 'rsa':
          if (action === 'encrypt' && !layer.publicKey) {
            return res.status(400).json({ error: `RSA public key is required for Layer ${i + 1}` });
          }
          
          if (action === 'decrypt' && !layer.privateKey) {
            return res.status(400).json({ error: `RSA private key is required for Layer ${i + 1}` });
          }
          
          steps.push(`Processing Layer ${i + 1}: RSA ${action}`);
          
          if (action === 'encrypt') {
            if (i > 0 && layers[i-1].algorithm !== 'none') {
              processedData = encryptionUtils.normalizeLayerData(processedData, layers[i-1].algorithm, 'rsa');
              steps.push(`Normalized data from ${layers[i-1].algorithm} for RSA encryption`);
            }
            processedData = encryptionUtils.rsaEncrypt(processedData, layer.publicKey);
          } else {
            try {
              processedData = encryptionUtils.rsaDecrypt(processedData, layer.privateKey);
            } catch (error) {
              return res.status(400).json({ 
                error: `RSA decryption failed in Layer ${i+1}: ${error.message}`,
                steps: steps
              });
            }
            
            // If there's another layer after this one during decryption, normalize the data
            if (action === 'decrypt' && i > 0 && layers[i-1].algorithm !== 'none') {
              processedData = encryptionUtils.normalizeLayerData(
                processedData, 
                'rsa', 
                layers[i-1].algorithm
              );
              steps.push(`Normalized RSA output for ${layers[i-1].algorithm} decryption`);
            }
          }
          break;        case 'autokey':
          if (!layer.key) {
            return res.status(400).json({ error: `Autokey cipher key is required for Layer ${i + 1}` });
          }
          
          const numKey = parseInt(layer.key);
          if (isNaN(numKey)) {
            return res.status(400).json({ 
              error: `Autokey cipher key should be a valid numeric value (Layer ${i + 1})`
            });
          }
          
          steps.push(`Processing Layer ${i + 1}: Autokey cipher ${action}`);
          
          if (action === 'encrypt') {
            if (i > 0 && layers[i-1].algorithm !== 'none') {
              processedData = encryptionUtils.normalizeLayerData(processedData, layers[i-1].algorithm, 'autokey');
              steps.push(`Normalized data from ${layers[i-1].algorithm} for Autokey encryption`);
            }
            processedData = encryptionUtils.autokeyEncrypt(processedData, layer.key);
          } else {
            try {
              processedData = encryptionUtils.autokeyDecrypt(processedData, layer.key);
            } catch (error) {
              return res.status(400).json({ 
                error: `Autokey decryption failed in Layer ${i+1}: ${error.message}`,
                steps: steps
              });
            }
            
            // If there's another layer after this one during decryption, normalize the data
            if (action === 'decrypt' && i > 0 && layers[i-1].algorithm !== 'none') {
              processedData = encryptionUtils.normalizeLayerData(
                processedData, 
                'autokey', 
                layers[i-1].algorithm
              );
              steps.push(`Normalized Autokey output for ${layers[i-1].algorithm} decryption`);
            }
          }
          break;
          
        default:
          return res.status(400).json({ 
            error: `Unknown algorithm: ${layer.algorithm} in Layer ${i + 1}`
          });
      }
    }
    
    // Add final step for logging
    steps.push(`${action.charAt(0).toUpperCase() + action.slice(1)}ion complete!`);
    
    // Return the processed data and steps
    return res.json({
      result: processedData,
      steps: steps
    });
    
  } catch (error) {
    console.error('Error processing data:', error);
    return res.status(500).json({ 
      error: `Server error: ${error.message}`,
      steps: ['Error occurred during processing.']
    });
  }
};

/**
 * Generate RSA key pair
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const generateRsaKeyPair = (req, res) => {
  try {
    const { keySize = 2048 } = req.body;
    
    const NodeRSA = require('node-rsa');
    const key = new NodeRSA({ b: keySize });
    
    // Export keys in PEM format
    const privateKey = key.exportKey('private');
    const publicKey = key.exportKey('public');
    
    return res.json({
      privateKey,
      publicKey
    });
  } catch (error) {
    console.error('Error generating RSA key pair:', error);
    return res.status(500).json({ error: `Error generating RSA key pair: ${error.message}` });
  }
};

module.exports = {
  processData,
  generateRsaKeyPair
};