const express = require('express');
const cors = require('cors');
const math = require('mathjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Statistical utility functions
class StatisticalAnalysis {
  
  // Normal distribution functions
  static normalPDF(x, mean, std) {
    return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
  }

  static normalCDF(x, mean, std) {
    return 0.5 * (1 + math.erf((x - mean) / (std * Math.sqrt(2))));
  }

  // Binomial distribution functions
  static binomialPMF(k, n, p) {
    if (k < 0 || k > n) return 0;
    return math.combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }

  static binomialCDF(k, n, p) {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
      sum += this.binomialPMF(i, n, p);
    }
    return sum;
  }

  // Poisson distribution functions
  static poissonPMF(k, lambda) {
    if (k < 0) return 0;
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / math.factorial(k);
  }

  static poissonCDF(k, lambda) {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
      sum += this.poissonPMF(i, lambda);
    }
    return sum;
  }

  // Statistical tests
  static performTTest(data, mu = 0) {
    const n = data.length;
    const mean = math.mean(data);
    const std = math.std(data, 'unbiased');
    const tStat = (mean - mu) / (std / Math.sqrt(n));
    const df = n - 1;
    
    // Approximate p-value using normal distribution for large samples
    let pValue;
    if (n >= 30) {
      pValue = 2 * (1 - this.normalCDF(Math.abs(tStat), 0, 1));
    } else {
      // Simple approximation for t-distribution
      const tCritical = 2.0; // Rough approximation
      pValue = Math.abs(tStat) > tCritical ? 0.05 : 0.1;
    }
    
    return {
      statistic: tStat.toFixed(4),
      pValue: pValue.toFixed(6),
      degreesOfFreedom: df,
      conclusion: pValue < 0.05 ? 'Reject null hypothesis' : 'Fail to reject null hypothesis',
      mean: mean.toFixed(4),
      standardError: (std / Math.sqrt(n)).toFixed(4)
    };
  }

  static performChiSquareTest(observed, expected = null) {
    if (!expected) {
      const total = math.sum(observed);
      expected = new Array(observed.length).fill(total / observed.length);
    }
    
    let chiSquare = 0;
    for (let i = 0; i < observed.length; i++) {
      if (expected[i] > 0) {
        chiSquare += Math.pow(observed[i] - expected[i], 2) / expected[i];
      }
    }
    
    const df = observed.length - 1;
    // Approximate p-value using normal approximation for chi-square
    const pValue = 1 - this.normalCDF(chiSquare, df, Math.sqrt(2 * df));
    
    return {
      statistic: chiSquare.toFixed(4),
      pValue: Math.max(0.000001, pValue).toFixed(6),
      degreesOfFreedom: df,
      conclusion: pValue < 0.05 ? 'Reject null hypothesis' : 'Fail to reject null hypothesis',
      expected: expected.map(e => e.toFixed(2))
    };
  }

  // Linear regression
  static performLinearRegression(data) {
    const n = data.length;
    const sumX = math.sum(data.map(d => d.x));
    const sumY = math.sum(data.map(d => d.y));
    const sumXY = math.sum(data.map(d => d.x * d.y));
    const sumX2 = math.sum(data.map(d => d.x * d.x));
    const sumY2 = math.sum(data.map(d => d.y * d.y));
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const ssTotal = math.sum(data.map(d => Math.pow(d.y - yMean, 2)));
    const ssResidual = math.sum(data.map(d => Math.pow(d.y - (slope * d.x + intercept), 2)));
    const rSquared = 1 - (ssResidual / ssTotal);
    
    // Calculate correlation coefficient
    const correlation = (n * sumXY - sumX * sumY) / 
                       Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    // Generate regression line points
    const minX = Math.min(...data.map(d => d.x));
    const maxX = Math.max(...data.map(d => d.x));
    const regressionLine = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const x = minX + (maxX - minX) * i / steps;
      regressionLine.push({ x: Number(x.toFixed(3)), y: Number((slope * x + intercept).toFixed(3)) });
    }
    
    // Calculate standard error of slope
    const mse = ssResidual / (n - 2);
    const seSlope = Math.sqrt(mse / math.sum(data.map(d => Math.pow(d.x - sumX/n, 2))));
    
    return {
      slope: slope.toFixed(4),
      intercept: intercept.toFixed(4),
      rSquared: rSquared.toFixed(4),
      correlation: correlation.toFixed(4),
      equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`,
      standardError: seSlope.toFixed(4),
      regressionLine,
      residualStandardError: Math.sqrt(mse).toFixed(4)
    };
  }

  // Parse CSV data
  static parseCsvData(csvText) {
    const lines = csvText.trim().split('\n');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) { // Skip header
      const values = lines[i].split(',');
      if (values.length >= 2) {
        const x = parseFloat(values[0].trim());
        const y = parseFloat(values[1].trim());
        if (!isNaN(x) && !isNaN(y)) {
          data.push({ x, y });
        }
      }
    }
    
    return data;
  }
}

// API Routes

// Generate distribution data
app.post('/api/distributions', (req, res) => {
  try {
    const { distribution, params, plotType } = req.body;
    const chartData = [];
    
    if (distribution === 'normal') {
      const range = 4 * params.std;
      const step = range / 200;
      for (let x = params.mean - range/2; x <= params.mean + range/2; x += step) {
        const y = plotType === 'pdf' 
          ? StatisticalAnalysis.normalPDF(x, params.mean, params.std)
          : StatisticalAnalysis.normalCDF(x, params.mean, params.std);
        chartData.push({ x: Number(x.toFixed(3)), y: Number(y.toFixed(6)) });
      }
    } else if (distribution === 'binomial') {
      for (let k = 0; k <= params.n; k++) {
        const y = plotType === 'pdf' 
          ? StatisticalAnalysis.binomialPMF(k, params.n, params.p)
          : StatisticalAnalysis.binomialCDF(k, params.n, params.p);
        chartData.push({ x: k, y: Number(y.toFixed(6)) });
      }
    } else if (distribution === 'poisson') {
      const maxK = Math.min(50, Math.max(20, params.lambda * 4));
      for (let k = 0; k <= maxK; k++) {
        const y = plotType === 'pdf' 
          ? StatisticalAnalysis.poissonPMF(k, params.lambda)
          : StatisticalAnalysis.poissonCDF(k, params.lambda);
        chartData.push({ x: k, y: Number(y.toFixed(6)) });
      }
    }
    
    res.json({ chartData });
  } catch (error) {
    console.error('Distribution generation error:', error);
    res.status(500).json({ error: 'Failed to generate distribution data' });
  }
});

// Perform hypothesis testing
app.post('/api/hypothesis-test', (req, res) => {
  try {
    const { data, testType } = req.body;
    
    if (!Array.isArray(data) || data.length < 2) {
      return res.status(400).json({ error: 'Invalid data: need at least 2 numeric values' });
    }
    
    let results;
    if (testType === 'ttest') {
      results = StatisticalAnalysis.performTTest(data);
    } else if (testType === 'chisquare') {
      // Ensure all values are positive for chi-square test
      const positiveData = data.map(x => Math.abs(x));
      results = StatisticalAnalysis.performChiSquareTest(positiveData);
    } else {
      return res.status(400).json({ error: 'Invalid test type' });
    }
    
    res.json(results);
  } catch (error) {
    console.error('Hypothesis test error:', error);
    res.status(500).json({ error: 'Failed to perform hypothesis test' });
  }
});

// Perform regression analysis
app.post('/api/regression', (req, res) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ error: 'Invalid CSV data' });
    }
    
    const data = StatisticalAnalysis.parseCsvData(csvData);
    
    if (data.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 data points for regression' });
    }
    
    const regression = StatisticalAnalysis.performLinearRegression(data);
    
    res.json({
      data,
      regression
    });
  } catch (error) {
    console.error('Regression analysis error:', error);
    res.status(500).json({ error: 'Failed to perform regression analysis' });
  }
});

// Generate sample datasets
app.post('/api/generate-sample', (req, res) => {
  try {
    const { distribution, params, size = 100 } = req.body;
    const sampleData = [];
    
    if (distribution === 'normal') {
      // Box-Muller transform for normal distribution
      for (let i = 0; i < size; i += 2) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
        
        sampleData.push(Number((params.mean + z1 * params.std).toFixed(4)));
        if (i + 1 < size) {
          sampleData.push(Number((params.mean + z2 * params.std).toFixed(4)));
        }
      }
    } else if (distribution === 'binomial') {
      for (let i = 0; i < size; i++) {
        let successes = 0;
        for (let j = 0; j < params.n; j++) {
          if (Math.random() < params.p) successes++;
        }
        sampleData.push(successes);
      }
    } else if (distribution === 'poisson') {
      // Inverse transform sampling for Poisson
      for (let i = 0; i < size; i++) {
        let k = 0;
        let p = 1;
        const L = Math.exp(-params.lambda);
        
        do {
          k++;
          p *= Math.random();
        } while (p > L);
        
        sampleData.push(k - 1);
      }
    }
    
    res.json({ sampleData });
  } catch (error) {
    console.error('Sample generation error:', error);
    res.status(500).json({ error: 'Failed to generate sample data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Statistical Analysis Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});