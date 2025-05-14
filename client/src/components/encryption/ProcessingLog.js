import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ProcessingLog = ({ steps }) => {
  return (
    <div className="processing-log">
      <h3>
        <FontAwesomeIcon icon="info-circle" /> Processing Log
      </h3>
      <div className="log-content">
        {steps.map((step, index) => (
          <div key={index} className="log-entry">
            <span className="log-step-number">{index + 1}</span>
            <span className="log-step-message">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingLog;