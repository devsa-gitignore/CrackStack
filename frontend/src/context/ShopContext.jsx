import { createContext, useContext, useMemo, useState } from 'react';
import { products, productMap } from '../data/products';

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (productId, size = null) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.productId === productId && item.size === size);
      if (existing) {
        return current.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { productId, quantity: 1, size }];
    });
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      setCartItems((current) =>
        current.filter((item) => !(item.productId === productId && item.size === size))
      );
      return;
    }

    setCartItems((current) =>
      current.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId, size) => {
    setCartItems((current) =>
      current.filter((item) => !(item.productId === productId && item.size === size))
    );
  };

  const clearCart = () => setCartItems([]);

  const cartDetails = useMemo(() => {
    return cartItems.map((item) => {
      const product = productMap[item.productId];
      return {
        ...item,
        product,
        lineTotal: product.numericPrice * item.quantity
      };
    });
  }, [cartItems]);

  const subtotal = cartDetails.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = cartDetails.length > 0 ? 199 : 0;
  const total = subtotal + shipping;
  const itemCount = cartDetails.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    products,
    productMap,
    cartItems: cartDetails,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    shipping,
    total,
    itemCount
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within ShopProvider');
  }
  return context;
}
