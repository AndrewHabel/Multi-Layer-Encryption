import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './CryptanalysisStyle.css';

const CryptanalysisResults = ({ results, algorithm }) => {
  const renderFrequencyChart = (frequencies, maxBars = 10) => {
    if (!frequencies || !frequencies.length) return <p>No frequency data available</p>;
    
    // Get top frequencies
    const topFrequencies = frequencies.slice(0, maxBars);
    
    // Find the maximum count for scaling
    const maxCount = Math.max(...topFrequencies.map(f => f.count));
    
    return (
      <div className="frequency-chart">
        {topFrequencies.map((item, index) => (
          <div key={index} className="chart-item">
            <div className="chart-label">{item.character}</div>
            <div className="chart-bar-container">
              <div 
                className="chart-bar" 
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              ></div>
              <span className="chart-value">
                {item.count} ({item.frequency.toFixed(2)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderDataRow = (label, value, icon = null) => {
    return (
      <div className="data-row">
        <div className="data-label">
          {icon && <FontAwesomeIcon icon={icon} className="data-icon" />}
          {label}:
        </div>
        <div className="data-value">{value}</div>
      </div>
    );
  };
  
  const renderSection = (title, content, icon = null) => {
    return (
      <div className="analysis-section">
        <h3 className="section-title">
          {icon && <FontAwesomeIcon icon={icon} className="section-icon" />}
          {title}
        </h3>
        <div className="section-content">{content}</div>
      </div>
    );
  };
  
  const renderRecommendations = (recommendations) => {
    if (!recommendations || !recommendations.length) return null;
    
    return (
      <ul className="recommendations-list">
        {recommendations.map((rec, index) => (
          <li key={index} className="recommendation-item">
            <FontAwesomeIcon icon="check-circle" className="recommendation-icon" />
            {rec}
          </li>
        ))}
      </ul>
    );
  };
  
  const renderAesResults = () => {
    const { result } = results;
    if (!result) return <p>No analysis results available</p>;
    
    return (
      <>
        {renderSection('Format Analysis', (
          <>
            {renderDataRow('Detection', result.format, 'file-code')}
            {renderDataRow('Encoding', result.encoding, 'code')}
            {renderDataRow('Block Size', result.blockSize, 'cube')}
            {renderDataRow('Mode', result.detectedMode, 'cog')}
          </>
        ), 'info-circle')}
        
        {renderSection('Entropy Analysis', (
          <>
            {renderDataRow('Entropy Score', result.entropy.toFixed(4), 'random')}
            {renderDataRow('Interpretation', result.entropyInterpretation, 'comment')}
            <div className="entropy-meter">
              <div className="entropy-scale">
                <span>0</span>
                <span>2</span>
                <span>4</span>
                <span>6</span>
                <span>8</span>
              </div>
              <div className="entropy-bar-container">
                <div 
                  className={`entropy-bar ${result.entropy > 6 ? 'high' : result.entropy > 4 ? 'medium' : 'low'}`}
                  style={{ width: `${Math.min(result.entropy / 8 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </>
        ), 'chart-bar')}
        
        {renderSection('Security Assessment', (
          <>
            {renderDataRow('Pattern Analysis', result.weaknesses, 'search')}
            {renderDataRow('Key Strength', result.keyStrength, 'shield-alt')}
          </>
        ), 'lock')}
        
        {renderSection('Recommendations', (
          renderRecommendations(result.recommendations)
        ), 'lightbulb')}
      </>
    );
  };
  
  const renderRsaResults = () => {
    const { result } = results;
    if (!result) return <p>No analysis results available</p>;
    
    return (
      <>
        {renderSection('Format Analysis', (
          <>
            {renderDataRow('Detection', result.format, 'file-code')}
            {renderDataRow('Encoding', result.encoding, 'code')}
            {renderDataRow('Chunks', `${result.chunks.count} chunks (avg length: ${result.chunks.averageLength})`, 'puzzle-piece')}
          </>
        ), 'info-circle')}
        
        {renderSection('Entropy Analysis', (
          <>
            {renderDataRow('Entropy Score', result.entropy.toFixed(4), 'random')}
            {renderDataRow('Interpretation', result.entropyInterpretation, 'comment')}
            <div className="entropy-meter">
              <div className="entropy-scale">
                <span>0</span>
                <span>2</span>
                <span>4</span>
                <span>6</span>
                <span>8</span>
              </div>
              <div className="entropy-bar-container">
                <div 
                  className={`entropy-bar ${result.entropy > 6 ? 'high' : result.entropy > 4 ? 'medium' : 'low'}`}
                  style={{ width: `${Math.min(result.entropy / 8 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </>
        ), 'chart-bar')}
        
        {renderSection('Security Assessment', (
          <>
            {renderDataRow('Estimated Key Size', result.estimatedKeySize, 'key')}
            {renderDataRow('Key Strength', result.keyStrength, 'shield-alt')}
          </>
        ), 'lock')}
        
        {renderSection('Recommendations', (
          renderRecommendations(result.recommendations)
        ), 'lightbulb')}
      </>
    );
  };
  
  const renderAutokeyResults = () => {
    const { result } = results;
    if (!result) return <p>No analysis results available</p>;
    
  const renderRepeatingSequences = () => {
      if (!result.repeatingSequences || !result.repeatingSequences.length) {
        return <p>No significant repeating sequences found</p>;
      }
      
      return (
        <table className="repeating-sequences-table">
          <thead>
            <tr>
              <th>Sequence</th>
              <th>Length</th>
              <th>Occurrences</th>
              <th>Positions</th>
            </tr>
          </thead>
          <tbody>
            {result.repeatingSequences.map((seq, index) => (
              <tr key={index}>
                <td>{seq.sequence || 'N/A'}</td>
                <td>{seq.length || 'N/A'}</td>
                <td>{seq.occurrences || 'N/A'}</td>
                <td>{seq.positions && seq.positions.length > 0 ? 
                    `${seq.positions.slice(0, 4).join(', ')}${seq.positions.length > 4 ? '...' : ''}` : 
                    'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    };
    
    return (
      <>
        {renderSection('Character Frequency Analysis', (
          <>
            <p className="ic-score">              <FontAwesomeIcon icon="calculator" /> Index of Coincidence (IC): 
              <span className={`ic-value ${result.ic ? (result.ic > 0.06 ? 'ic-high' : result.ic > 0.045 ? 'ic-medium' : 'ic-low') : 'ic-low'}`}>
                {result.ic ? result.ic.toFixed(4) : 'N/A'}
              </span>
              <span className="ic-interpretation">
                {result.interpretation ? `(${result.interpretation})` : ''}
              </span>
            </p>
            {renderFrequencyChart(result.frequencies)}
            <p className="freq-note">
              <FontAwesomeIcon icon="info-circle" /> 
              English language typical frequencies: E (12.7%), T (9.1%), A (8.2%), O (7.5%), I (7.0%), N (6.7%)
            </p>
          </>
        ), 'chart-bar')}
        
        {renderSection('Key Analysis', (
          <>
            <div className="key-possibilities">
              <div className="key-label">Possible First Letters:</div>
              <div className="key-letters">
                {result.keyCharacteristics && result.keyCharacteristics.possibleFirstLetters 
                  ? result.keyCharacteristics.possibleFirstLetters.join(', ') 
                  : 'N/A'}
              </div>
            </div>
            <p className="key-note">
              <FontAwesomeIcon icon="info-circle" /> 
              {result.keyCharacteristics && result.keyCharacteristics.estimatedLength 
                ? result.keyCharacteristics.estimatedLength 
                : 'Key length estimation not available'}
            </p>
          </>
        ), 'key')}
        
        {renderSection('Repeating Sequences', (
          renderRepeatingSequences()
        ), 'retweet')}
        
        {renderSection('Cryptanalysis Tips', (
          <ul className="tips-list">
            <li><FontAwesomeIcon icon="angle-right" /> Autokey cipher is vulnerable to known-plaintext attacks</li>
            <li><FontAwesomeIcon icon="angle-right" /> If you know any part of the plaintext, you can recover the key</li>
            <li><FontAwesomeIcon icon="angle-right" /> Try common words as potential keys (e.g., "KEY", "CIPHER", "SECRET")</li>
            <li><FontAwesomeIcon icon="angle-right" /> High frequency letters in English are E, T, A, O, I, N</li>
          </ul>
        ), 'lightbulb')}
      </>
    );
  };
  
  const renderGeneralAnalysis = () => {
    const generalData = algorithm === 'autokey' ? 
      null : // Already included in autokey analysis
      results.result?.generalAnalysis;
      
    if (!generalData || generalData.error) return null;
    
    return (
      <div className="general-analysis">
        {renderSection('Text Statistics', (
          <>
            <p>Sample Size: {generalData.totalSample} characters</p>
            <p>
              Index of Coincidence: 
              <span className={`ic-value ${generalData.ic > 0.06 ? 'ic-high' : generalData.ic > 0.045 ? 'ic-medium' : 'ic-low'}`}>
                {generalData.ic.toFixed(4)}
              </span>
            </p>
            <p className="interpretation">{generalData.interpretation}</p>
          </>
        ), 'calculator')}
      </div>
    );
  };
  
  return (
    <div className="cryptanalysis-results">
      <h3 className="results-title">
        <FontAwesomeIcon icon="microscope" /> 
        Analysis Results for {algorithm.toUpperCase()} Ciphertext
      </h3>
      
      <div className="results-content">
        {algorithm === 'aes' && renderAesResults()}
        {algorithm === 'rsa' && renderRsaResults()}
        {algorithm === 'autokey' && renderAutokeyResults()}
        {renderGeneralAnalysis()}
      </div>
    </div>
  );
};

export default CryptanalysisResults;
