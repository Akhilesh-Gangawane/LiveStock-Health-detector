import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Constants for consistent theming
const CHART_COLORS = {
  blue: {
    primary: 'rgb(59, 130, 246)',
    light: 'rgba(59, 130, 246, 0.1)',
    dark: 'rgb(37, 99, 235)'
  },
  green: 'rgb(16, 185, 129)',
  amber: 'rgb(245, 158, 11)',
  red: 'rgb(239, 68, 68)',
  purple: 'rgb(139, 92, 246)',
  pink: 'rgb(236, 72, 153)',
  teal: 'rgb(20, 184, 166)',
  orange: 'rgb(251, 146, 60)',
  gray: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.8)'
  }
};

const CHART_TYPOGRAPHY = {
  fontFamily: "'Inter', sans-serif",
  sizes: {
    xs: 11,
    sm: 12,
    base: 13,
    lg: 14
  }
};

/**
 * HealthLineChart Component
 * 
 * Displays health score trends over time using a line chart with smooth gradients
 * and professional styling.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.data - Chart data object
 * @param {string[]} props.data.labels - Array of x-axis labels (dates, time periods)
 * @param {number[]} props.data.values - Array of health score values
 * @param {string} [props.title] - Optional chart title
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {Object} [props.options] - Additional Chart.js options to merge
 */
export function HealthLineChart({ 
  data, 
  title = 'Health Score Trends', 
  className = '',
  options = {} 
}) {
  // Data validation with enhanced error handling
  if (!data || !data.labels || !data.values) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64 md:h-80">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No data available</p>
            <p className="text-gray-400 text-sm mt-1">Please check your data source</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.labels.length !== data.values.length) {
    console.warn('HealthLineChart: Labels and values arrays have different lengths', {
      labels: data.labels.length,
      values: data.values.length
    });
  }

  // Enhanced chart data with gradient fill
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Health Score',
        data: data.values,
        borderColor: CHART_COLORS.blue.primary,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, CHART_COLORS.blue.light);
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.01)');
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: CHART_COLORS.blue.primary,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: CHART_COLORS.blue.dark,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        segment: {
          borderColor: ctx => ctx.p0.parsed.y > ctx.p1.parsed.y ? CHART_COLORS.red : CHART_COLORS.blue.primary,
        }
      }
    ]
  };

  // Enhanced chart options with better animations and interactions
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: CHART_TYPOGRAPHY.sizes.sm,
            family: CHART_TYPOGRAPHY.fontFamily
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: CHART_COLORS.gray.dark,
        titleFont: {
          size: CHART_TYPOGRAPHY.sizes.base,
          weight: '600'
        },
        bodyFont: {
          size: CHART_TYPOGRAPHY.sizes.sm
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            return `Health Score: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: Math.min(...data.values) - 10,
        max: Math.max(...data.values) + 10,
        grid: {
          color: CHART_COLORS.gray.light,
          drawBorder: false
        },
        ticks: {
          font: {
            size: CHART_TYPOGRAPHY.sizes.xs
          },
          padding: 8,
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: CHART_TYPOGRAPHY.sizes.xs
          },
          maxRotation: 45,
          minRotation: 0,
          padding: 12
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    elements: {
      line: {
        borderWidth: 3
      }
    }
  };

  // Merge custom options with defaults
  const mergedOptions = deepMerge(defaultOptions, options);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span>Health Score</span>
            </div>
          </div>
        </div>
      )}
      <div className="h-64 md:h-80">
        <Line data={chartData} options={mergedOptions} />
      </div>
    </div>
  );
}

/**
 * AnimalDoughnut Component
 * 
 * Displays animal distribution or categories using a doughnut chart with
 * interactive legends and percentage calculations.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.data - Chart data object
 * @param {string[]} props.data.labels - Array of category labels
 * @param {number[]} props.data.values - Array of values for each category
 * @param {string} [props.title] - Optional chart title
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {Object} [props.options] - Additional Chart.js options to merge
 */
export function AnimalDoughnut({ 
  data, 
  title = 'Animal Distribution', 
  className = '',
  options = {} 
}) {
  // Data validation with enhanced error handling
  if (!data || !data.labels || !data.values) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64 md:h-80">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No data available</p>
            <p className="text-gray-400 text-sm mt-1">Please check your data source</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.labels.length !== data.values.length) {
    console.warn('AnimalDoughnut: Labels and values arrays have different lengths', {
      labels: data.labels.length,
      values: data.values.length
    });
  }

  // Professional color palette with hover effects
  const colorPalette = [
    CHART_COLORS.blue.primary,
    CHART_COLORS.green,
    CHART_COLORS.amber,
    CHART_COLORS.red,
    CHART_COLORS.purple,
    CHART_COLORS.pink,
    CHART_COLORS.teal,
    CHART_COLORS.orange
  ];

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: colorPalette.slice(0, data.values.length),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 15,
        borderRadius: 4,
        spacing: 2
      }
    ]
  };

  const total = data.values.reduce((acc, val) => acc + val, 0);

  // Enhanced chart options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          font: {
            size: CHART_TYPOGRAPHY.sizes.sm,
            family: CHART_TYPOGRAPHY.fontFamily
          },
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label, i) => {
              const value = datasets[0].data[i];
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              
              return {
                text: `${label}: ${value} (${percentage}%)`,
                fillStyle: datasets[0].backgroundColor[i],
                strokeStyle: datasets[0].borderColor,
                lineWidth: datasets[0].borderWidth,
                hidden: !chart.getDataVisibility(i),
                index: i
              };
            });
          }
        },
        onClick: (e, legendItem, legend) => {
          const index = legendItem.index;
          const chart = legend.chart;
          chart.toggleDataVisibility(index);
          chart.update();
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: CHART_COLORS.gray.dark,
        titleFont: {
          size: CHART_TYPOGRAPHY.sizes.base,
          weight: '600'
        },
        bodyFont: {
          size: CHART_TYPOGRAPHY.sizes.sm
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  // Merge custom options with defaults
  const mergedOptions = deepMerge(defaultOptions, options);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="text-sm text-gray-500">
            Total: <span className="font-semibold text-gray-700">{total}</span>
          </div>
        </div>
      )}
      <div className="relative h-64 md:h-80">
        <Doughnut data={chartData} options={mergedOptions} />
        {/* Enhanced center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-3xl font-bold text-gray-800">{total}</p>
          <p className="text-sm text-gray-500 mt-1">Total Animals</p>
          <p className="text-xs text-gray-400 mt-1">{data.labels.length} Categories</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Utility function to deeply merge objects
 */
function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  
  return output;
}

/**
 * Utility function to check if value is an object
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Example usage component with enhanced demo data
 */
export default function ChartsDemo() {
  const healthData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    values: [75, 82, 78, 85, 88, 92, 95]
  };

  const animalData = {
    labels: ['Dogs', 'Cats', 'Birds', 'Rabbits', 'Hamsters', 'Fish', 'Reptiles'],
    values: [45, 32, 18, 12, 8, 25, 6]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Chart Components
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Beautiful, responsive charts built with Chart.js and React. 
            Features smooth animations, gradient fills, and interactive tooltips.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <HealthLineChart 
            data={healthData} 
            title="Monthly Health Score Trends"
            className="transform hover:-translate-y-1 transition-transform duration-300"
          />
          
          <AnimalDoughnut 
            data={animalData}
            title="Animal Population Distribution"
            className="transform hover:-translate-y-1 transition-transform duration-300"
          />
        </div>

        {/* Additional stats section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Animals</p>
                <p className="text-2xl font-bold text-gray-900">146</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50 text-green-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Health Score</p>
                <p className="text-2xl font-bold text-gray-900">85%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}