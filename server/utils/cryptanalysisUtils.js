const CryptoJS = require('crypto-js');

/**
 * Frequency analysis for simple text - useful for classical ciphers
 * @param {string} text - The text to analyze
 * @returns {Object} - Character frequency data
 */
const frequencyAnalysis = (text) => {
  try {
    // Remove non-alphabetic characters and convert to uppercase
    const cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (!cleanText.length) {
      return { error: 'No alphabetic characters found in the text' };
    }
    
    // Count character frequencies
    const charCount = {};
    const totalChars = cleanText.length;
    
    for (const char of cleanText) {
      charCount[char] = (charCount[char] || 0) + 1;
    }
    
    // Calculate frequency percentages and sort by frequency
    const frequencies = Object.keys(charCount).map(char => ({
      character: char,
      count: charCount[char],
      frequency: (charCount[char] / totalChars) * 100
    }));
    
    frequencies.sort((a, b) => b.count - a.count);
    
    // Calculate Index of Coincidence (IC)
    let sumSquares = 0;
    for (const char in charCount) {
      sumSquares += charCount[char] * (charCount[char] - 1);
    }
    const ic = sumSquares / (totalChars * (totalChars - 1));
    
    // English language IC is ~0.067
    // Random text IC is ~0.038
    
    return {
      totalSample: totalChars,
      frequencies,
      ic: ic,
      interpretation: interpretIC(ic)
    };
    
  } catch (error) {
    console.error('Frequency analysis error:', error);
    return { error: error.message };
  }
};

/**
 * Interpret Index of Coincidence values
 */
const interpretIC = (ic) => {
  if (ic > 0.06) {
    return 'High likelihood of simple substitution cipher or plaintext';
  } else if (ic > 0.045) {
    return 'Possible polyalphabetic cipher (like Vigenère or Autokey)';
  } else {
    return 'Likely a more complex encryption or random/compressed data';
  }
};

/**
 * Autokey cipher cryptanalysis
 * @param {string} ciphertext - The ciphertext to analyze
 * @returns {Object} - Analysis results including possible key length
 */
const autokeyAnalysis = (ciphertext) => {
  try {
    // Clean text for analysis
    const cleanText = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (cleanText.length < 20) {
      return { 
        error: 'Text too short for reliable analysis. Need at least 20 characters.'
      };
    }
    
    // Analyze letter frequencies
    const freqAnalysis = frequencyAnalysis(cleanText);
    
    // Kasiski examination for repeating sequences
    const repeats = findRepeatingSequences(cleanText);
    
    // Most common English letters
    const commonLetters = ['E', 'T', 'A', 'O', 'I', 'N'];
    
    // Generate possible first letters of the key based on most common ciphertext letters
    const possibleKeyLetters = [];
    
    freqAnalysis.frequencies.slice(0, 6).forEach(item => {
      commonLetters.forEach(letter => {
        // Calculate potential key letter using Vigenère/Autokey formula in reverse
        let potentialKey = String.fromCharCode(
          ((item.character.charCodeAt(0) - letter.charCodeAt(0) + 26) % 26) + 65
        );
        possibleKeyLetters.push(potentialKey);
      });
    });
    
    // Return analysis results
    return {
      keyCharacteristics: {
        possibleFirstLetters: Array.from(new Set(possibleKeyLetters)),
        estimatedLength: "Unknown (Autokey uses plaintext as part of the key)"
      },
      frequencies: freqAnalysis.frequencies.slice(0, 10),
      ic: freqAnalysis.ic,
      interpretation: freqAnalysis.interpretation,
      repeatingSequences: repeats.slice(0, 5)
    };
    
  } catch (error) {
    console.error('Autokey analysis error:', error);
    return { error: error.message };
  }
};

/**
 * AES cryptanalysis - basic entropy and pattern analysis
 * @param {string} ciphertext - The ciphertext to analyze
 * @returns {Object} - Analysis results
 */
const aesAnalysis = (ciphertext) => {
  try {
    // Check if the ciphertext has the IV:ciphertext format
    const hasIVFormat = ciphertext.includes(':') && 
                        /^[0-9a-fA-F]{32}:.+$/.test(ciphertext);
    
    // Base64 format check - AES ciphertexts are typically base64 encoded
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(ciphertext);
    
    // Entropy calculation
    const entropy = calculateEntropy(ciphertext);
    
    // Block size detection
    let blockSize = "Unknown";
    let mode = "Unknown";
    
    if (hasIVFormat) {
      const parts = ciphertext.split(':');
      const ivHex = parts[0];
      
      // IV is 16 bytes (128 bits) in AES
      if (ivHex.length === 32) {
        blockSize = "128 bits";
        mode = "Likely CBC or CTR (has IV)";
      }
    } else {
      // ECB mode doesn't use an IV
      mode = "Possibly ECB (no IV detected)";
      blockSize = "128 bits"; // AES always uses 128-bit blocks
    }
    
    // AES-ECB pattern detection
    const hasRepeatingPatterns = detectRepeatingBlocks(ciphertext);
    
    // Strength assessment
    let keyStrength = "Strong - brute force attack is infeasible";
    if (hasRepeatingPatterns && mode.includes("ECB")) {
      keyStrength = "Potentially vulnerable - ECB mode with repeating patterns detected";
    }
    
    return {
      format: hasIVFormat ? "Has IV prefix (CBC/CTR mode)" : "No IV detected (possibly ECB mode)",
      encoding: isBase64 ? "Likely Base64 encoded" : "Not standard Base64 encoding",
      entropy: entropy,
      entropyInterpretation: interpretEntropy(entropy),
      blockSize: blockSize,
      detectedMode: mode,
      weaknesses: hasRepeatingPatterns ? 
        "Repeating block patterns detected - could indicate ECB mode or data redundancy" :
        "No obvious repeating block patterns",
      keyStrength: keyStrength,
      recommendations: [
        "AES is considered secure when implemented correctly",
        mode.includes("ECB") ? "Consider using CBC or CTR mode instead of ECB" : "CBC/CTR mode provides better security than ECB",
        "Use a strong, unique key of sufficient length (at least 128 bits)",
        "For maximum security, use AES-256 with a strong key derivation function"
      ]
    };
    
  } catch (error) {
    console.error('AES analysis error:', error);
    return { error: error.message };
  }
};

/**
 * RSA cryptanalysis - basic format and strength analysis
 * @param {string} ciphertext - The RSA ciphertext
 * @returns {Object} - Analysis results
 */
const rsaAnalysis = (ciphertext) => {
  try {
    // Check if the ciphertext is in the expected format (chunks separated by |)
    const isRsaFormat = ciphertext.includes('|');
    const chunks = isRsaFormat ? ciphertext.split('|') : [ciphertext];
    
    // Base64 format check - RSA ciphertexts are typically base64 encoded
    const isBase64 = chunks.every(chunk => /^[A-Za-z0-9+/=]+$/.test(chunk));
    
    // Estimate key size based on chunk length
    let estimatedKeySize = "Unknown";
    if (chunks.length > 0 && isBase64) {
      // Rough estimation based on base64 encoded chunk length
      const avgChunkLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length;
      if (avgChunkLength > 683) {
        estimatedKeySize = "4096 bits or higher";
      } else if (avgChunkLength > 342) {
        estimatedKeySize = "~2048 bits";
      } else if (avgChunkLength > 171) {
        estimatedKeySize = "~1024 bits";
      } else {
        estimatedKeySize = "Less than 1024 bits (not recommended)";
      }
    }
    
    // Entropy calculation
    const entropy = calculateEntropy(ciphertext);
    
    // Chunk analysis
    const chunkLengths = chunks.map(chunk => chunk.length);
    const uniqueChunkLengths = new Set(chunkLengths).size;
    const consistentChunks = uniqueChunkLengths === 1 || 
                           (chunks.length > 5 && uniqueChunkLengths <= 2);
    
    return {
      format: isRsaFormat ? "Multiple chunks separated by '|' - standard RSA format" : "Single chunk - possibly small data or non-standard format",
      encoding: isBase64 ? "Base64 encoded (expected for RSA)" : "Not standard Base64 encoding",
      entropy: entropy,
      entropyInterpretation: interpretEntropy(entropy),
      chunks: {
        count: chunks.length,
        averageLength: Math.round(chunkLengths.reduce((a, b) => a + b, 0) / chunks.length),
        consistent: consistentChunks
      },
      estimatedKeySize: estimatedKeySize,
      keyStrength: evaluateRsaKeyStrength(estimatedKeySize),
      recommendations: [
        "RSA keys should be at least 2048 bits in modern applications",
        "RSA should be combined with proper padding schemes (PKCS#1 v2 or OAEP)",
        "For large data, use RSA to encrypt a symmetric key, then encrypt data with AES"
      ]
    };
    
  } catch (error) {
    console.error('RSA analysis error:', error);
    return { error: error.message };
  }
};

/**
 * Calculate Shannon entropy of a string
 * @param {string} str - The string to analyze
 * @returns {number} - Shannon entropy value
 */
const calculateEntropy = (str) => {
  const len = str.length;
  const frequencies = {};
  
  // Count character frequencies
  for (let i = 0; i < len; i++) {
    frequencies[str[i]] = (frequencies[str[i]] || 0) + 1;
  }
  
  // Calculate entropy
  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
};

/**
 * Interpret entropy values
 */
const interpretEntropy = (entropy) => {
  if (entropy < 3) {
    return "Very low entropy - likely not encrypted or highly structured data";
  } else if (entropy < 4) {
    return "Low entropy - possibly simple encoding or simple cipher";
  } else if (entropy < 5) {
    return "Moderate entropy - typical for text or simple encryption";
  } else if (entropy < 7) {
    return "High entropy - characteristic of good encryption or compression";
  } else {
    return "Very high entropy - strong encryption or random data";
  }
};

/**
 * Find repeating sequences in text
 * @param {string} text - The text to analyze
 * @returns {Array} - Array of repeating sequences with their positions
 */
const findRepeatingSequences = (text) => {
  const sequences = [];
  const minLength = 3; // Minimum sequence length to consider
  
  // Check sequences of various lengths
  for (let len = minLength; len <= 10; len++) {
    if (len > text.length / 3) break; // Don't look for very long sequences
    
    const found = {};
    
    // Slide through the text
    for (let i = 0; i <= text.length - len; i++) {
      const seq = text.substring(i, i + len);
      
      if (!found[seq]) {
        found[seq] = [i];
      } else {
        found[seq].push(i);
      }
    }
    
    // Add sequences that appear more than once
    for (const seq in found) {
      if (found[seq].length > 1) {
        // Calculate distances between occurrences
        const positions = found[seq];
        const distances = [];
        
        for (let i = 1; i < positions.length; i++) {
          distances.push(positions[i] - positions[i-1]);
        }
        
        sequences.push({
          sequence: seq,
          length: seq.length,
          occurrences: positions.length,
          positions: positions,
          distances: distances
        });
      }
    }
  }
  
  // Sort by number of occurrences, then by length
  sequences.sort((a, b) => {
    if (a.occurrences !== b.occurrences) {
      return b.occurrences - a.occurrences;
    }
    return b.length - a.length;
  });
  
  return sequences;
};

/**
 * Detect repeating blocks in ciphertext (useful for ECB mode detection)
 * @param {string} ciphertext - The ciphertext to analyze
 * @returns {boolean} - Whether repeating blocks were detected
 */
const detectRepeatingBlocks = (ciphertext) => {
  // Remove IV if present
  let processedText = ciphertext;
  if (ciphertext.includes(':')) {
    processedText = ciphertext.split(':')[1];
  }
  
  // Look for 16-byte (128-bit) blocks if base64 encoded
  // or 32-character blocks if hex encoded
  const blockSize = /^[0-9a-fA-F]+$/.test(processedText) ? 32 : 24;
  
  const blocks = {};
  let hasRepeats = false;
  
  for (let i = 0; i < processedText.length - blockSize; i += blockSize) {
    const block = processedText.substr(i, blockSize);
    if (blocks[block]) {
      hasRepeats = true;
      blocks[block]++;
    } else {
      blocks[block] = 1;
    }
  }
  
  return hasRepeats;
};

/**
 * Evaluate RSA key strength
 * @param {string} keySizeDesc - Description of key size
 * @returns {string} - Evaluation of key strength
 */
const evaluateRsaKeyStrength = (keySizeDesc) => {
  if (keySizeDesc.includes("4096")) {
    return "Very strong - suitable for long-term security";
  } else if (keySizeDesc.includes("2048")) {
    return "Strong - currently recommended minimum size";
  } else if (keySizeDesc.includes("1024")) {
    return "Weak - considered insufficient by modern standards";
  } else {
    return "Unknown strength or potentially very weak";
  }
};

module.exports = {
  frequencyAnalysis,
  autokeyAnalysis,
  aesAnalysis,
  rsaAnalysis
};
