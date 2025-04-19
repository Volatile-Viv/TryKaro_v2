import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage or empty array
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Track cart total
  const [cartTotal, setCartTotal] = useState(0);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      return sum + itemPrice * item.quantity;
    }, 0);
    setCartTotal(total);
  }, [cartItems]);
  
  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    // Check if product is out of stock
    if (product.manageInventory && product.inventory <= 0) {
      alert("Sorry, this product is out of stock!");
      return false; // Return false to indicate failure
    }
    
    // Check if adding would exceed available inventory
    if (product.manageInventory) {
      const existingItem = cartItems.find(item => item._id === product._id);
      const currentInCart = existingItem ? existingItem.quantity : 0;
      
      if (currentInCart + quantity > product.inventory) {
        alert(`Sorry, we only have ${product.inventory} items in stock. You already have ${currentInCart} in your cart.`);
        return false;
      }
    }
    
    setCartItems(prevItems => {
      // Check if product already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item._id === product._id);
      
      if (existingItemIndex > -1) {
        // Update quantity if product exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Ensure price is included when adding new item
        const newProduct = { 
          ...product, 
          quantity,
          // Make sure price is included and is a string
          price: product.price !== undefined ? product.price.toString() : "0"
        };
        return [...prevItems, newProduct];
      }
    });
    
    return true; // Return true to indicate success
  };
  
  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };
  
  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    // Find the product in the cart and the corresponding product data
    const cartItem = cartItems.find(item => item._id === productId);
    
    // Check if updating would exceed available inventory
    if (cartItem && cartItem.manageInventory && quantity > cartItem.inventory) {
      alert(`Sorry, we only have ${cartItem.inventory} items in stock.`);
      return false;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item._id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
    
    return true;
  };
  
  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Get total number of items in cart
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };
  
  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item._id === productId);
  };
  
  // Value object to be provided to consumers
  const value = {
    cartItems,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    isInCart
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext; 