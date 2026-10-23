import React from 'react';

function ProgressBar({ total, completed }) {
  if (total === 0) return null;

  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="progress-section">
      <div className="progress-label">
        <span>Progress</span>
        <span className="progress-stat">
          {completed} of {total} completed ({percentage}%)
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Tasks completion progress"
      >
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
