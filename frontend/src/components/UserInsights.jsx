import { useState, useEffect } from 'react';
import { getUserInsights } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import Loader from './Loader';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const UserInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await getUserInsights();
        setInsights(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user insights:', err);
        setError(err.message || 'Failed to load user insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!insights || Object.keys(insights).length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-center p-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No insights yet</h3>
          <p className="mt-1 text-gray-500">
            As users interact with your products, insights will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Get chart data
  const { ageDistribution, genderDistribution, userInterests, productPerformance, averageRating, reviewCount } = insights;

  // Prepare age distribution chart data
  const ageChartData = {
    labels: ageDistribution.map(item => item.label),
    datasets: [
      {
        label: 'Users',
        data: ageDistribution.map(item => item.value),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare gender distribution chart data
  const genderChartData = {
    labels: genderDistribution.map(item => item.label),
    datasets: [
      {
        data: genderDistribution.map(item => item.value),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare user interests chart data
  const interestsChartData = {
    labels: userInterests.map(item => item.label),
    datasets: [
      {
        label: 'User Interest',
        data: userInterests.map(item => item.value),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare product performance chart data
  const performanceChartData = {
    labels: productPerformance.map(item => item.title),
    datasets: [
      {
        type: 'bar',
        label: 'Reviews',
        data: productPerformance.map(item => item.reviewCount),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Average Rating',
        data: productPerformance.map(item => item.averageRating),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Number of Reviews',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 5,
        title: {
          display: true,
          text: 'Average Rating',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">User Insights</h2>
      </div>

      <div className="p-6">
        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Reviews</h3>
            <p className="text-4xl font-bold text-blue-600">{reviewCount}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Rating</h3>
            <div className="flex items-center justify-center">
              <p className="text-4xl font-bold text-green-600 mr-2">{averageRating}</p>
              <div className="text-yellow-500 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star}
                    className={`h-6 w-6 ${
                      star <= averageRating
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300 fill-current'
                    }`}
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Age Distribution */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">User Age Distribution</h3>
            <div className="h-64">
              <Bar data={ageChartData} options={chartOptions} />
            </div>
          </div>

          {/* Gender Distribution */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Gender Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <div style={{ width: '60%', height: '100%' }}>
                <Pie data={genderChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* User Interests */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">User Interests</h3>
            <div className="h-64">
              <Bar data={interestsChartData} options={chartOptions} />
            </div>
          </div>

          {/* Product Performance */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Product Performance</h3>
            <div className="h-64">
              <Bar data={performanceChartData} options={performanceChartOptions} />
            </div>
          </div>
        </div>

        {/* Detailed Product Performance Table */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Detailed Product Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviews
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Rating
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productPerformance.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {product.reviewCount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold mr-2">{product.averageRating}</span>
                        <div className="text-yellow-500 flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                              key={star}
                              className={`h-4 w-4 ${
                                star <= product.averageRating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300 fill-current'
                              }`}
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInsights; 