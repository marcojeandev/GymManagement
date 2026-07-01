import { useState } from 'react';
import { Search, ShoppingCart, CreditCard, DollarSign } from 'lucide-react';

const Sales = () => {
  const [products] = useState([
    { id: 1, name: 'Whey Protein 2kg', price: 60.00 },
    { id: 2, name: 'Creatine 500g', price: 25.00 },
    { id: 3, name: 'Gym Towel', price: 10.00 },
    { id: 4, name: 'Water Bottle', price: 15.00 },
  ]);

  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="flex h-full gap-6 animate-in fade-in duration-500">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col space-y-6">
        <h1 className="text-2xl font-bold text-white">Point of Sale</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search products to sell..." 
            className="w-full bg-gray-800/80 border border-gray-700/50 rounded-xl py-4 pl-12 pr-4 text-gray-200 focus:outline-none focus:border-red-500 transition-colors text-lg"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pb-20">
          {products.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-4 text-left hover:bg-gray-700/50 hover:border-red-500/50 transition-all group"
            >
              <div className="h-24 bg-gray-900/50 rounded-xl mb-3 flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                <ShoppingCart className="text-gray-600 group-hover:text-red-500 transition-colors" size={32} />
              </div>
              <h3 className="text-gray-200 font-medium line-clamp-1">{product.name}</h3>
              <p className="text-emerald-400 font-bold mt-1">${product.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart / Checkout */}
      <div className="w-96 bg-gray-800/40 border border-gray-700/50 rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-700/50 bg-gray-900/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ShoppingCart size={20} className="text-red-500" /> Current Sale
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
              <ShoppingCart size={48} className="opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex justify-between items-center bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                <div>
                  <h4 className="text-gray-200 font-medium text-sm">{item.product.name}</h4>
                  <p className="text-gray-400 text-xs">${item.product.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <p className="text-emerald-400 font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-900/80 border-t border-gray-700/50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Total</span>
            <span className="text-3xl font-bold text-white">${total.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium">
              <CreditCard size={18} /> Card
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium shadow-lg shadow-red-500/20">
              <DollarSign size={18} /> Cash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
