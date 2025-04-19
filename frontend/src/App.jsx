import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import "./App.css";

// Pages
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CreateProductPage from "./pages/CreateProductPage";
import EditProductPage from "./pages/EditProductPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";

// Components
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import ChatBox from "./components/ChatBox";
import PageTransition from "./components/PageTransition";
import GlobalLoadingIndicator, { LoadingProvider } from "./components/GlobalLoadingIndicator";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <LoadingProvider>
              <div className="min-h-screen bg-gray-50">
                {/* Navigation */}
                <Navbar />
                
                {/* Global Loading Indicator */}
                <GlobalLoadingIndicator />

                {/* Main content */}
                <PageTransition>
                  <main>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<ProductsPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/:id" element={<ProductDetailsPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/cart" element={<CartPage />} />

                      {/* Protected Routes */}
                      <Route
                        path="/profile"
                        element={<PrivateRoute element={<ProfilePage />} />}
                      />
                      <Route
                        path="/products/new"
                        element={
                          <PrivateRoute
                            element={<CreateProductPage />}
                            allowedRoles={["Brand", "admin"]}
                          />
                        }
                      />
                      <Route
                        path="/products/:id/edit"
                        element={
                          <PrivateRoute
                            element={<EditProductPage />}
                            allowedRoles={["Brand", "admin"]}
                          />
                        }
                      />
                    </Routes>
                  </main>
                </PageTransition>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-8 mt-12">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500 text-sm">
                      &copy; {new Date().getFullYear()} Try Karo. All rights reserved.
                    </p>
                  </div>
                </footer>

                {/* Chat Box */}
                <ChatBox />
              </div>
            </LoadingProvider>
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
