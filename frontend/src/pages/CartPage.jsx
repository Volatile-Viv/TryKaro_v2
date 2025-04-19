import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { convertProductPrice, formatPrice, currency } = useCurrency();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();
  
  // Check if user is a brand
  const isBrand = isAuthenticated && user?.role === "Brand";
  
  // Redirect non-authenticated users to login and brands to their dashboard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: '/cart',
          message: 'Please log in to access your cart'
        } 
      });
    } else if (isBrand) {
      navigate('/brand/dashboard', {
        state: {
          message: 'Brands do not have access to shopping cart functionality'
        }
      });
    }
  }, [isAuthenticated, isBrand, navigate]);
  
  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, parseInt(newQuantity));
  };
  
  const handleCheckout = () => {
    setCheckoutLoading(true);
    
    // Simulate checkout process
    setTimeout(() => {
      alert('Checkout completed successfully!');
      clearCart();
      setCheckoutLoading(false);
    }, 1500);
  };
  
  // If not authenticated or is a brand, show loading or redirect
  if (!isAuthenticated || isBrand) {
    return null; // Will redirect in useEffect
  }
  
  // Calculate subtotal and check if any items have a price
  const subtotal = cartItems.reduce((total, item) => {
    // Convert each item price to user's currency before adding to total
    const itemPrice = parseFloat(item.price) > 0 
      ? convertProductPrice(parseFloat(item.price), item.currency || 'INR') 
      : 0;
    return total + itemPrice * item.quantity;
  }, 0);
  
  const hasItemsWithPrice = cartItems.some(item => parseFloat(item.price) > 0);
  
  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-gray-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-4">Looks like you haven't added any products to your cart yet.</p>
          <Link 
            to="/products" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cart Items */}
        <div className="md:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Cart Items ({cartItems.length})</h2>
            </div>
            
            <ul className="divide-y divide-gray-200">
              {cartItems.map(item => {
                // Get the converted price in user's currency
                const itemPrice = parseFloat(item.price) > 0 
                  ? convertProductPrice(parseFloat(item.price), item.currency || 'INR') 
                  : 0;
                
                // Format the price with the current currency symbol
                const displayPrice = parseFloat(item.price) > 0 
                  ? formatPrice(itemPrice * item.quantity) 
                  : "Free";
                
                return (
                  <li key={item._id} className="flex flex-col sm:flex-row p-4 hover:bg-gray-50">
                    {/* Product Image */}
                    <div className="sm:w-24 h-24 flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-800 mb-1">
                          <Link to={`/products/${item._id}`} className="hover:text-blue-600">
                            {item.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center text-sm mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center border rounded-md">
                            <button 
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              className="px-2 py-1 text-gray-600 hover:text-gray-800 focus:outline-none"
                            >
                              -
                            </button>
                            <input 
                              type="number" 
                              min="1" 
                              value={item.quantity} 
                              onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                              className="w-10 text-center border-x py-1 focus:outline-none" 
                            />
                            <button 
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-600 hover:text-gray-800 focus:outline-none"
                            >
                              +
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-500 hover:text-red-700 focus:outline-none text-sm flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {displayPrice}
                          </p>
                          {parseFloat(item.price) > 0 && item.currency && item.currency !== currency.code && (
                            <p className="text-xs text-gray-500">
                              Original: {formatPrice(parseFloat(item.price) * item.quantity, item.currency)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            
            <div className="p-4 border-t border-gray-200 flex justify-between">
              <button 
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 text-sm focus:outline-none flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Cart
              </button>
              <Link 
                to="/products" 
                className="text-blue-600 hover:text-blue-800 text-sm focus:outline-none"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-20">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {subtotal > 0 ? formatPrice(subtotal) : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trial Fee</span>
                  <span className="font-medium">{formatPrice(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatPrice(0)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold">
                    {subtotal > 0 ? formatPrice(subtotal) : 'Free'}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className={`w-full mt-6 py-3 px-4 rounded-md font-medium text-white 
                  ${checkoutLoading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {checkoutLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : `Checkout ${subtotal > 0 ? '- ' + formatPrice(subtotal) : ''}`}
              </button>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                {hasItemsWithPrice ? (
                  <p>Your cart contains both paid and free trial products.</p>
                ) : (
                  <p>These are trial products available for free testing.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 