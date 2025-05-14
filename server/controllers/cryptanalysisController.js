const cryptanalysisUtils = require('../utils/cryptanalysisUtils');

/**
 * Analyze ciphertext based on the specified algorithm
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const analyzeCiphertext = (req, res) => {
  try {
    const { text, algorithm } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text to analyze is required' });
    }
    
    if (!algorithm || !['aes', 'rsa', 'autokey'].includes(algorithm)) {
      return res.status(400).json({ 
        error: 'Valid algorithm (aes, rsa, or autokey) is required' 
      });
    }
    
    let result;
    
    switch(algorithm) {
      case 'aes':
        result = cryptanalysisUtils.aesAnalysis(text);
        break;
        
      case 'rsa':
        result = cryptanalysisUtils.rsaAnalysis(text);
        break;
        
      case 'autokey':
        result = cryptanalysisUtils.autokeyAnalysis(text);
        break;
    }
    
    // Add general frequency analysis for all types
    if (algorithm === 'autokey') {
      // Already included in the autokey analysis
    } else {
      result.generalAnalysis = cryptanalysisUtils.frequencyAnalysis(text);
    }
    
    return res.json({
      algorithm,
      result
    });
    
  } catch (error) {
    console.error('Error analyzing ciphertext:', error);
    return res.status(500).json({ 
      error: `Analysis error: ${error.message}`
    });
  }
};

module.exports = {
  analyzeCiphertext
};
