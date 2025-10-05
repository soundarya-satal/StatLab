import React, { useState } from 'react';
import { ScatterChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RegressionAnalysis = () => {
  const [csvData, setCsvData] = useState('');
  const [regressionData, setRegressionData] = useState([]);
  const [regressionResults, setRegressionResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:3001/api';

  // Handle CSV upload and regression analysis
  const handleCsvUpload = async (e) => {
    const text = e.target.value;
    setCsvData(text);
    
    if (text.trim()) {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/regression`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            csvData: text
          })
        });
        
        if (response.ok) {
          const results = await response.json();
          setRegressionData(results.data);
          setRegressionResults(results.regression);
        } else {
          console.error('Failed to perform regression analysis');
        }
      } catch (error) {
        console.error('Error performing regression analysis:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="tab-content">
      {loading && <div className="loading">Loading...</div>}
      <div className="grid-layout">
        <div className="card">
          <h2>Linear Regression</h2>
          
          <div className="form-group">
            <label>CSV Data (x,y format with header)</label>
            <textarea
              value={csvData}
              onChange={handleCsvUpload}
              placeholder={`x,y\n1,2.1\n2,3.9\n3,6.2\n4,7.8\n5,10.1`}
              className="form-control textarea-large"
            />
          </div>

          {regressionResults && (
            <div className="regression-results">
              <h3>Regression Results</h3>
              <div className="result-item">
                <span className="label">Equation:</span>
                <div className="equation">{regressionResults.equation}</div>
              </div>
              <div className="results-grid">
                <div className="result-item">
                  <span className="label">Slope:</span>
                  <div className="value">{regressionResults.slope}</div>
                </div>
                <div className="result-item">
                  <span className="label">Intercept:</span>
                  <div className="value">{regressionResults.intercept}</div>
                </div>
              </div>
              <div className="result-item">
                <span className="label">R-squared:</span>
                <div className="value">{regressionResults.rSquared}</div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Scatter Plot & Regression Line</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="x" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Scatter data={regressionData} fill="#fff" />
                {regressionResults && (
                  <Line 
                    data={regressionResults.regressionLine} 
                    dataKey="y" 
                    stroke="#ff4444" 
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegressionAnalysis;