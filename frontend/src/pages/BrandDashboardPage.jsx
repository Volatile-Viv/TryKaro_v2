import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProducts } from '../services/api';
import Loader from '../components/Loader';

const BrandDashboardPage = () => {
  const { user, isAuthenticated, isMaker } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch brand's products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!isAuthenticated || !isMaker) {
        return;
      }

      try {
        setLoading(true);
        const response = await getUserProducts();
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load your products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isAuthenticated, isMaker]);

  // Redirect if not logged in or not a brand
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/brand/dashboard',
          message: 'Please log in to access your brand dashboard'
        }
      });
    } else if (isAuthenticated && !isMaker) {
      navigate('/products', {
        state: {
          message: 'Only brands can access the dashboard'
        }
      });
    }
  }, [isAuthenticated, isMaker, navigate]);

  if (!isAuthenticated || !isMaker) {
    return null; // Will redirect in the useEffect
  }

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Brand Dashboard</h1>
        <Link
          to="/products/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add New Product
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Brand Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Brand Logo/Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img 
                src={user?.avatar || "https://via.placeholder.com/150?text=Brand"} 
                alt={user?.name} 
                className="h-32 w-32 object-cover rounded-full border-4 border-blue-100"
              />
              <div className="absolute bottom-0 right-0 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                Brand Account
              </div>
            </div>
          </div>
          
          {/* Brand Details */}
          <div className="flex-grow text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{user?.name || 'Your Brand'}</h2>
            <p className="text-gray-600 mb-2">{user?.email}</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h3 className="text-sm uppercase text-gray-500 font-semibold mb-2">About Your Brand</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {user?.bio || 'No brand description provided yet. Edit your profile to add a description.'}
              </p>
            </div>
            
            <div className="mt-4">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {products.length} Products
                </div>
                <Link 
                  to="/profile" 
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200 transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-500 uppercase text-sm">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-500 uppercase text-sm">Live Products</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {products.filter(p => p.status === 'live').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-500 uppercase text-sm">In Testing</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {products.filter(p => p.status === 'in-testing').length}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Your Products</h2>
        </div>

        {products.length === 0 ? (
          <div className="p-6 text-center">
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No products yet</h3>
            <p className="mt-1 text-gray-500">Get started by creating a new product.</p>
            <div className="mt-6">
              <Link
                to="/products/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                New Product
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inventory
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <Link to={`/products/${product._id}`} className="hover:text-blue-600">
                              {product.title}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500">
                            Created: {new Date(product.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          product.status === 'live'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'in-testing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.status === 'live'
                          ? 'Live'
                          : product.status === 'in-testing'
                          ? 'In Testing'
                          : 'Closed'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseFloat(product.price) > 0
                        ? `${product.currency || 'USD'} ${parseFloat(product.price).toFixed(2)}`
                        : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Trial Product</span>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.inventory || 'Unlimited'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/products/${product._id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </Link>
                      <Link to={`/products/${product._id}`} className="text-gray-600 hover:text-gray-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandDashboardPage; 