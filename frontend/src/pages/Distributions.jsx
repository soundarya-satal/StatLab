import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Distributions = () => {
  const [distribution, setDistribution] = useState('normal');
  const [params, setParams] = useState({
    mean: 0,
    std: 1,
    n: 10,
    p: 0.5,
    lambda: 1
  });
  const [plotType, setPlotType] = useState('pdf');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:3001/api';

  // Fetch distribution data from backend
  const fetchDistributionData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/distributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distribution,
          params,
          plotType
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setChartData(data.chartData);
      } else {
        console.error('Failed to fetch distribution data');
      }
    } catch (error) {
      console.error('Error fetching distribution data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributionData();
  }, [distribution, params, plotType]);

  return (
    <div className="tab-content">
      {loading && <div className="loading">Loading...</div>}
      <div className="grid-layout">
        {/* Controls */}
        <div className="card">
          <h2>Distribution Parameters</h2>
          
          <div className="form-group">
            <label>Distribution Type</label>
            <select
              value={distribution}
              onChange={(e) => setDistribution(e.target.value)}
              className="form-control"
            >
              <option value="normal">Normal</option>
              <option value="binomial">Binomial</option>
              <option value="poisson">Poisson</option>
            </select>
          </div>

          <div className="form-group">
            <label>Plot Type</label>
            <select
              value={plotType}
              onChange={(e) => setPlotType(e.target.value)}
              className="form-control"
            >
              <option value="pdf">{distribution === 'normal' ? 'PDF' : 'PMF'}</option>
              <option value="cdf">CDF</option>
            </select>
          </div>

          {distribution === 'normal' && (
            <>
              <div className="form-group">
                <label>Mean (μ)</label>
                <input
                  type="number"
                  value={params.mean}
                  onChange={(e) => setParams({...params, mean: parseFloat(e.target.value) || 0})}
                  className="form-control"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Standard Deviation (σ)</label>
                <input
                  type="number"
                  value={params.std}
                  onChange={(e) => setParams({...params, std: parseFloat(e.target.value) || 1})}
                  className="form-control"
                  step="0.1"
                  min="0.1"
                />
              </div>
            </>
          )}

          {distribution === 'binomial' && (
            <>
              <div className="form-group">
                <label>Number of trials (n)</label>
                <input
                  type="number"
                  value={params.n}
                  onChange={(e) => setParams({...params, n: parseInt(e.target.value) || 10})}
                  className="form-control"
                  min="1"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label>Probability of success (p)</label>
                <input
                  type="number"
                  value={params.p}
                  onChange={(e) => setParams({...params, p: parseFloat(e.target.value) || 0.5})}
                  className="form-control"
                  step="0.01"
                  min="0"
                  max="1"
                />
              </div>
            </>
          )}

          {distribution === 'poisson' && (
            <div className="form-group">
              <label>Rate parameter (λ)</label>
              <input
                type="number"
                value={params.lambda}
                onChange={(e) => setParams({...params, lambda: parseFloat(e.target.value) || 1})}
                className="form-control"
                step="0.1"
                min="0.1"
              />
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="card">
          <h2>
            {distribution.charAt(0).toUpperCase() + distribution.slice(1)} Distribution - {plotType.toUpperCase()}
          </h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="x" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="y" 
                  stroke="#fff" 
                  strokeWidth={2}
                  dot={distribution !== 'normal'}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Distributions;