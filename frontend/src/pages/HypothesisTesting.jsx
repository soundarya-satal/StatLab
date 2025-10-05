import React, { useState } from 'react';

const HypothesisTesting = () => {
  const [sampleData, setSampleData] = useState('');
  const [testType, setTestType] = useState('ttest');
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:3001/api';

  // Handle hypothesis test
  const handleHypothesisTest = async () => {
    if (!sampleData.trim()) return;
    
    setLoading(true);
    try {
      // Parse the comma-separated values into an array of numbers
      const dataArray = sampleData.split(',').map(item => parseFloat(item.trim())).filter(num => !isNaN(num));
      
      if (dataArray.length < 2) {
        setTestResults({ error: 'Please provide at least 2 valid numeric values' });
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/hypothesis-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: dataArray,
          testType
        })
      });
      
      if (response.ok) {
        const results = await response.json();
        setTestResults(results);
      } else {
        const errorData = await response.json();
        setTestResults({ error: errorData.message || 'Failed to perform hypothesis test' });
      }
    } catch (error) {
      console.error('Error performing hypothesis test:', error);
      setTestResults({ error: 'An error occurred while performing the test' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      {loading && <div className="loading">Loading...</div>}
      <div className="grid-layout">
        <div className="card">
          <h2>Hypothesis Testing</h2>
          
          <div className="form-group">
            <label>Test Type</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="form-control"
            >
              <option value="ttest">One-Sample t-test</option>
              <option value="chisquare">Chi-Square Goodness of Fit</option>
            </select>
          </div>

          <div className="form-group">
            <label>Sample Data (comma-separated values)</label>
            <textarea
              value={sampleData}
              onChange={(e) => setSampleData(e.target.value)}
              placeholder="e.g., 1.2, 2.3, 1.8, 2.1, 1.9, 2.4, 1.7"
              className="form-control textarea"
            />
          </div>

          <button
            onClick={handleHypothesisTest}
            className="btn-primary"
            disabled={loading}
          >
            Run Test
          </button>
        </div>

        <div className="card">
          <h2>Test Results</h2>
          {testResults && (
            <div className="results">
              {testResults.error ? (
                <div className="error">{testResults.error}</div>
              ) : (
                <>
                  <div className="results-grid">
                    <div className="result-item">
                      <span className="label">Test Statistic:</span>
                      <div className="value">{testResults.statistic}</div>
                    </div>
                    <div className="result-item">
                      <span className="label">p-value:</span>
                      <div className="value">{testResults.pValue}</div>
                    </div>
                  </div>
                  <div className="result-item">
                    <span className="label">Degrees of Freedom:</span>
                    <div className="value">{testResults.degreesOfFreedom}</div>
                  </div>
                  <div className="conclusion">
                    <span className="label">Conclusion (α = 0.05):</span>
                    <div className={`value ${parseFloat(testResults.pValue) < 0.05 ? 'reject' : 'accept'}`}>
                      {testResults.conclusion}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HypothesisTesting;