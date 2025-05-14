const express = require('express');
const router = express.Router();
const encryptionController = require('../controllers/encryptionController');
const cryptanalysisController = require('../controllers/cryptanalysisController');

// Route for processing encryption/decryption with multiple layers
router.post('/process', encryptionController.processData);

// Route for generating RSA key pair
router.post('/generate-rsa-key', encryptionController.generateRsaKeyPair);

// Route for cryptanalysis
router.post('/analyze', cryptanalysisController.analyzeCiphertext);

module.exports = router;