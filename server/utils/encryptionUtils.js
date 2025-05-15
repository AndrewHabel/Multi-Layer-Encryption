const CryptoJS = require('crypto-js');
const JSEncrypt = require('node-jsencrypt');

/**
 * AES Encryption Implementation
 */
const aesEncrypt = (text, key, keySize, mode) => {  try {
    // Normalize key size
    const keySizeBits = parseInt(keySize);
    const keySizeBytes = keySizeBits / 8;
    
    // Check if key length matches required length for chosen key size
    const requiredLength = keySizeBytes;
    
    // Pad or truncate the key to the correct length
    let normalizedKey = key;
    while (normalizedKey.length < requiredLength) {
      normalizedKey += key;
    }
    normalizedKey = normalizedKey.substring(0, requiredLength);
    
    // Convert to WordArray
    const keyWordArray = CryptoJS.enc.Utf8.parse(normalizedKey);
    
    // Handle input data properly
    let textWordArray;
    try {
      textWordArray = CryptoJS.enc.Utf8.parse(text);
    } catch (e) {
      try {
        textWordArray = CryptoJS.enc.Base64.parse(text);
      } catch (e2) {
        console.log("Could not parse input as UTF-8 or Base64, treating as raw binary");
        textWordArray = text;
      }
    }
    
    // Generate IV for CBC and CTR modes
    let iv = CryptoJS.lib.WordArray.random(16);
    let encryptedData;
    
    // Encrypt based on mode
    switch(mode.toUpperCase()) {
      case 'ECB':
        encryptedData = CryptoJS.AES.encrypt(textWordArray, keyWordArray, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        break;
      
      case 'CBC':
        encryptedData = CryptoJS.AES.encrypt(textWordArray, keyWordArray, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        break;
      
      case 'CTR':
        encryptedData = CryptoJS.AES.encrypt(textWordArray, keyWordArray, {
            iv: iv,
            mode: CryptoJS.mode.CTR,
            padding: CryptoJS.pad.NoPadding
        });
        break;
      
      default:
        throw new Error(`Unsupported AES mode: ${mode}`);
    }
    
    // For CBC and CTR, prepend the IV to the ciphertext
    if (mode.toUpperCase() === 'CBC' || mode.toUpperCase() === 'CTR') {
      const ivHex = CryptoJS.enc.Hex.stringify(iv);
      return `${ivHex}:${encryptedData.toString()}`;
    }
    
    return encryptedData.toString();
  } catch (error) {
    console.error('AES Encryption Error:', error);
    throw new Error(`AES encryption failed: ${error.message}`);
  }
};

/**
 * AES Decryption Implementation
 */
const aesDecrypt = (ciphertext, key, keySize, mode) => {  try {
    // Special handling for multi-layer decryption
    let cleanedCiphertext = ciphertext;
    
    // Normalize key size
    const keySizeBits = parseInt(keySize);
    const keySizeBytes = keySizeBits / 8;
    
    // Check if key length matches required length for chosen key size
    const requiredLength = keySizeBytes;
    
    // Pad or truncate the key to the correct length
    let normalizedKey = key;
    while (normalizedKey.length < requiredLength) {
      normalizedKey += key;
    }
    normalizedKey = normalizedKey.substring(0, requiredLength);
    
    // Convert key to WordArray
    const keyWordArray = CryptoJS.enc.Utf8.parse(normalizedKey);
    
    let iv, actualCiphertext;
    
    // Handle different input formats
    if (mode.toUpperCase() === 'CBC' || mode.toUpperCase() === 'CTR') {
      if (cleanedCiphertext.includes(':')) {
        const parts = cleanedCiphertext.split(':');
        if (parts.length >= 2) {
          iv = CryptoJS.enc.Hex.parse(parts[0]);
          actualCiphertext = parts.slice(1).join(':'); // In case there are more colons in the ciphertext
        } else {
          iv = CryptoJS.lib.WordArray.create();  // Zero IV
          actualCiphertext = cleanedCiphertext;
        }
      } else {
        iv = CryptoJS.lib.WordArray.create();  // Zero IV
        actualCiphertext = cleanedCiphertext;
      }
    } else {
      actualCiphertext = cleanedCiphertext;
    }
    
    // Perform decryption
    let decryptedData;
    try {
      switch(mode.toUpperCase()) {
        case 'ECB':
          decryptedData = CryptoJS.AES.decrypt(actualCiphertext, keyWordArray, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
          });
          break;
        
        case 'CBC':
          decryptedData = CryptoJS.AES.decrypt(actualCiphertext, keyWordArray, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          });
          break;
        
        case 'CTR':
          decryptedData = CryptoJS.AES.decrypt(actualCiphertext, keyWordArray, {
            iv: iv,
            mode: CryptoJS.mode.CTR,
            padding: CryptoJS.pad.NoPadding
          });
          break;
      }
      
      const result = decryptedData.toString(CryptoJS.enc.Utf8);
      if (!result) throw new Error("Empty decryption result");
      
      return result;
    } catch (err) {
      // If standard approach fails, try alternative methods
      console.error("Standard decryption failed:", err);
      
      // Try with direct Base64 parsing
      try {
        let encrypted = { ciphertext: CryptoJS.enc.Base64.parse(actualCiphertext) };
        
        let decryptedData;
        switch(mode.toUpperCase()) {
          case 'ECB':
            decryptedData = CryptoJS.AES.decrypt(encrypted, keyWordArray, {
              mode: CryptoJS.mode.ECB,
              padding: CryptoJS.pad.Pkcs7
            });
            break;
          
          case 'CBC':
            decryptedData = CryptoJS.AES.decrypt(encrypted, keyWordArray, {
              iv: iv,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7
            });
            break;
          
          case 'CTR':
            decryptedData = CryptoJS.AES.decrypt(encrypted, keyWordArray, {
              iv: iv,
              mode: CryptoJS.mode.CTR,
              padding: CryptoJS.pad.NoPadding
            });
            break;
        }
        
        const result = decryptedData.toString(CryptoJS.enc.Utf8);
        if (result) return result;
      } catch (error) {
        console.error("Alternative decryption attempt failed:", error);
      }
      
      throw new Error("All decryption attempts failed");
    }
  } catch (error) {
    console.error('AES Decryption Error:', error);
    throw new Error(`AES decryption failed: ${error.message}`);
  }
};

/**
 * RSA Encryption Implementation
 */
const rsaEncrypt = (text, publicKey) => {
  try {
    // Create JSEncrypt instance
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    
    // Process input text - might be plain text or binary from previous layers
    let processedText = text;
    
    // Estimate key size from public key
    const keySize = 2048; // Default to 2048 bit
    const maxChunkSize = Math.floor(keySize / 8) - 11; // For PKCS#1 v1.5 padding
    
    // Split text into chunks
    const chunks = [];
    for (let i = 0; i < processedText.length; i += maxChunkSize) {
      chunks.push(processedText.substring(i, i + maxChunkSize));
    }
    
    // Encrypt each chunk
    const encryptedChunks = chunks.map(chunk => {
      const encrypted = encrypt.encrypt(chunk);
      if (!encrypted) {
        throw new Error('RSA encryption failed');
      }
      return encrypted;
    });
    
    // Join with delimiter
    return encryptedChunks.join('|');
  } catch (error) {
    console.error('RSA Encryption Error:', error);
    throw new Error(`RSA encryption failed: ${error.message}`);
  }
};

/**
 * RSA Decryption Implementation
 */
const rsaDecrypt = (ciphertext, privateKey) => {
  try {
    // Create JSEncrypt instance
    const decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privateKey);
    
    // Split ciphertext by delimiter
    const encryptedChunks = ciphertext.split('|');
    
    if (!encryptedChunks || encryptedChunks.length === 0) {
      throw new Error('Invalid RSA ciphertext format.');
    }
    
    // Decrypt each chunk
    const decryptedChunks = [];
    
    for (const chunk of encryptedChunks) {
      const decrypted = decrypt.decrypt(chunk);
      if (decrypted === false) {
        throw new Error('RSA decryption failed. Invalid key or corrupted data.');
      }
      decryptedChunks.push(decrypted);
    }
    
    // Join decrypted chunks
    return decryptedChunks.join('');
  } catch (error) {
    console.error('RSA Decryption Error:', error);
    throw new Error(`RSA decryption failed: ${error.message}`);
  }
};

/**
 * Autokey Cipher Encryption Implementation
 */
const autokeyEncrypt = (text, key) => {
  try {
    // Check if input might be binary data from previous encryption layer
    if (containsBinaryData(text)) {
      // Convert binary data to Base64 first
      try {
        const base64 = Buffer.from(text).toString('base64');
        // Mark the data as specially encoded
        return "BASE64:" + encryptAutokeyRaw(base64, key);
      } catch (e) {
        console.warn("Failed to convert binary to base64:", e);
      }
    }
    
    return encryptAutokeyRaw(text, key);
  } catch (error) {
    console.error('Autokey Encryption Error:', error);
    throw new Error(`Autokey encryption failed: ${error.message}`);
  }
};

/**
 * Raw Autokey Encryption Implementation
 */
const encryptAutokeyRaw = (text, key) => {  // Parse numeric key
  const numKey = parseInt(key);
  if (isNaN(numKey)) {
    throw new Error('Autokey cipher requires a valid numeric value');
  }
  
  // Convert number to a letter by taking modulo 26 and adding 65 (ASCII for 'A')
  // This ensures any numeric value can be used as a key
  // For example: 1 -> 'A', 2 -> 'B', 27 -> 'A', -3 -> 'W'
  const modKey = ((numKey % 26) + 26) % 26; // Handles negative numbers
  const actualKey = modKey === 0 ? 26 : modKey; // 0 becomes 26 ('Z')
  const keyLetter = String.fromCharCode(actualKey + 64); // 1->A, 2->B, etc.
  
  // Normalize text (remove non-alphabetic characters and convert to uppercase)
  const normalizedText = text.toUpperCase().replace(/[^A-Z]/g, '');
  
  if (normalizedText.length === 0) {
    return text; // Return original if no alphabetic characters
  }
  
  let result = '';
  let fullKey = keyLetter + normalizedText;
  
  // Encrypt each character
  for (let i = 0; i < normalizedText.length; i++) {
    const textChar = normalizedText.charCodeAt(i) - 65; // A=0, B=1, ...
    const keyChar = fullKey.charCodeAt(i) - 65;
    
    // Apply Vigenère encryption formula
    const encryptedChar = String.fromCharCode(((textChar + keyChar) % 26) + 65);
    result += encryptedChar;
  }
  
  // Return original text with non-alphabetic characters preserved
  let resultIndex = 0;
  let finalResult = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    
    if (/[A-Za-z]/.test(char)) {
      finalResult += char === char.toUpperCase() ? 
        result.charAt(resultIndex) : 
        result.charAt(resultIndex).toLowerCase();
      resultIndex++;
    } else {
      finalResult += char;
    }
  }
  
  return finalResult;
};

/**
 * Autokey Cipher Decryption Implementation
 */
const autokeyDecrypt = (text, key) => {
  try {
    // Check if this is base64-encoded binary data
    if (text.startsWith("BASE64:")) {
      const encryptedBase64 = text.substring(7); // Remove "BASE64:" prefix
      const decryptedBase64 = decryptAutokeyRaw(encryptedBase64, key);
      
      try {
        // Decode the base64 back to binary
        return Buffer.from(decryptedBase64, 'base64').toString();
      } catch (e) {
        console.error("Failed to decode Base64 data:", e);
        return decryptedBase64; // Return as is if decoding fails
      }
    }
    
    return decryptAutokeyRaw(text, key);
  } catch (error) {
    console.error('Autokey Decryption Error:', error);
    throw new Error(`Autokey decryption failed: ${error.message}`);
  }
};

/**
 * Raw Autokey Decryption Implementation
 */
const decryptAutokeyRaw = (text, key) => {  // Parse numeric key
  const numKey = parseInt(key);
  if (isNaN(numKey)) {
    throw new Error('Autokey cipher requires a valid numeric value');
  }
  
  // Convert number to a letter by taking modulo 26 and adding 65 (ASCII for 'A')
  // This ensures any numeric value can be used as a key
  const modKey = ((numKey % 26) + 26) % 26; // Handles negative numbers
  const actualKey = modKey === 0 ? 26 : modKey; // 0 becomes 26 ('Z')
  const normalizedKey = String.fromCharCode(actualKey + 64); // 1->A, 2->B, etc.
  
  if (normalizedKey.length === 0) {
    throw new Error('Invalid Autokey cipher key');
  }
  
  // Extract alphabetic characters from text for processing
  const alphabeticChars = [];
  const nonAlphaPositions = [];
  
  // Store positions of alphabetic and non-alphabetic characters
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    if (/[A-Za-z]/.test(char)) {
      alphabeticChars.push(char.toUpperCase());
    } else {
      nonAlphaPositions.push({
        index: i,
        char: char
      });
    }
  }
  
  if (alphabeticChars.length === 0) {
    return text;
  }
  
  // Decrypt the alphabetic characters
  let result = '';
  let keyStream = normalizedKey;
  
  for (let i = 0; i < alphabeticChars.length; i++) {
    const cipherChar = alphabeticChars[i].charCodeAt(0) - 65; // A=0, B=1, ...
    const keyChar = keyStream.charCodeAt(Math.min(i, keyStream.length - 1)) - 65;
    
    // Apply Vigenère decryption formula
    let plainChar = (cipherChar - keyChar) % 26;
    if (plainChar < 0) plainChar += 26;
    
    const decryptedChar = String.fromCharCode(plainChar + 65);
    result += decryptedChar;
    
    // Extend key with decrypted character
    if (keyStream.length <= normalizedKey.length + i) {
      keyStream += decryptedChar;
    }
  }
  
  // Reinsert non-alphabetic characters and preserve case
  let finalResult = '';
  let resultIndex = 0;
  
  // Reconstruct the original text format
  for (let i = 0; i < text.length; i++) {
    if (nonAlphaPositions.some(pos => pos.index === i)) {
      // Insert non-alphabetic character
      finalResult += nonAlphaPositions.find(pos => pos.index === i).char;
    } else {
      // Preserve the original case
      const originalChar = text.charAt(i);
      finalResult += originalChar === originalChar.toUpperCase() ? 
        result.charAt(resultIndex).toUpperCase() : 
        result.charAt(resultIndex).toLowerCase();
      resultIndex++;
    }
  }
  
  return finalResult;
};

/**
 * Helper function to detect if data is likely binary (non-printable chars)
 */
const containsBinaryData = (text) => {
  if (typeof text !== 'string') return false;
  
  // Check if the string contains many non-printable characters
  const nonPrintableCount = text.split('').filter(char => {
    const code = char.charCodeAt(0);
    return code < 32 || code > 126;
  }).length;
  
  // If more than 20% of characters are non-printable, consider it binary
  return (nonPrintableCount / text.length) > 0.2;
};

/**
 * Helper function to check if a string is valid base64
 */
const isValidBase64 = (str) => {
  try {
    // Regular expression to check if the string is valid base64
    if (!/^[A-Za-z0-9+/=]+$/.test(str)) {
      return false;
    }
    
    // Try to decode and see if it works
    Buffer.from(str, 'base64').toString();
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Helper function to normalize data between layers
 */
const normalizeLayerData = (input, sourceAlgo, targetAlgo) => {
  // If input is not a string or empty, just return it
  if (typeof input !== 'string' || input.length === 0) {
    return input;
  }
  
  try {
    // Special handling based on the source and target algorithms
    if (sourceAlgo === 'aes' && (targetAlgo === 'rsa' || targetAlgo === 'autokey')) {
      // AES output is often base64 which RSA and Autokey can handle directly
      return input;
    } 
    else if ((sourceAlgo === 'rsa' || sourceAlgo === 'autokey') && targetAlgo === 'aes') {
      // If data looks binary, try to make it more compatible with AES
      if (containsBinaryData(input)) {
        try {
          // Try to convert to base64 if it contains binary data
          return Buffer.from(input).toString('base64');
        } catch (e) {
          console.warn("Could not convert binary data to base64:", e);
          return input;
        }
      }
    }
    
    // Default: return unchanged
    return input;
  } catch (e) {
    console.error("Error in data normalization:", e);
    return input;
  }
};

module.exports = {
  aesEncrypt,
  aesDecrypt,
  rsaEncrypt,
  rsaDecrypt,
  autokeyEncrypt,
  autokeyDecrypt,
  normalizeLayerData,
  isValidBase64,
  containsBinaryData
};