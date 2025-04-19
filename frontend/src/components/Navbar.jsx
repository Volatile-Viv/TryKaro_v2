import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const navigate = useNavigate();
  
  // Check if user is a brand
  const isBrand = isAuthenticated && user?.role === "Brand";

  // Calculate total items in cart
  useEffect(() => {
    if (isAuthenticated && !isBrand) {
      setItemCount(getCartCount());
    } else {
      setItemCount(0);
    }
  }, [getCartCount, isAuthenticated, isBrand]);

  // Reset click animation after a short time
  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => {
        setIsClicked(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isClicked]);

  // Handle cart icon click for non-authenticated users
  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login', { 
        state: { 
          from: '/cart',
          message: 'Please log in to access your cart'
        } 
      });
    }
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setIsClicked(true)}
            >
              <Link 
                to="/" 
                className={`text-2xl md:text-3xl font-bold relative p-2 rounded-lg
                  ${isClicked ? 'transform scale-90' : isHovered ? 'transform scale-110' : ''}
                  transition-all duration-300 ease-in-out
                  bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text 
                  hover:from-blue-600 hover:to-blue-800
                  active:from-blue-700 active:to-blue-900
                  hover:shadow-lg focus:outline-none`}
                aria-label="Home"
              >
                Try Karo
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 
                  transform origin-left transition-transform duration-300 ease-out
                  ${isHovered ? 'scale-x-100' : 'scale-x-0'}`}></span>
                {isHovered && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                )}
              </Link>
            </div>
            <div className="ml-8 md:ml-10 flex space-x-6 md:space-x-10">
              <Link
                to="/products"
                className="inline-flex items-center px-3 py-2 text-sm md:text-base font-medium text-gray-900 hover:text-blue-600 active:text-blue-800 rounded-md hover:bg-blue-50 active:bg-blue-100 transform active:scale-95 transition-all duration-150"
              >
                {isBrand ? "All Products" : "Trial Products"}
              </Link>
              {isBrand && (
                <>
                  <Link
                    to="/brand/dashboard"
                    className="inline-flex items-center px-3 py-2 text-sm md:text-base font-medium text-gray-600 rounded-md hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 active:text-blue-800 transform active:scale-95 transition-all duration-150"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/products/new"
                    className="inline-flex items-center px-3 py-2 text-sm md:text-base font-medium text-gray-600 rounded-md hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 active:text-blue-800 transform active:scale-95 transition-all duration-150"
                  >
                    Add Product
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Cart Icon - Only for non-brand users */}
            {!isBrand && (
              <Link 
                to="/cart" 
                className="relative group"
                onClick={handleCartClick}
              >
                <div className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-150">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {isAuthenticated && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform transition-transform group-hover:scale-110">
                      {itemCount}
                    </span>
                  )}
                </div>
              </Link>
            )}
            
            {isAuthenticated ? (
              <>
                <Link
                  to={isBrand ? "/brand/dashboard" : "/profile"}
                  className="flex items-center rounded-full border-2 border-transparent hover:border-blue-500 transition-all duration-200 px-2 py-1 space-x-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="User Avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : 
                    user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm md:text-base font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm md:text-base font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform active:scale-95 transition-all duration-150"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm md:text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm md:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform active:scale-95 transition-all duration-150"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
