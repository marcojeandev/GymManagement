import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Package } from 'lucide-react';

const Products = () => {
  const [products] = useState([
    { id: 1, name: 'Whey Protein 2kg', category: 'Supplements', price: '$60.00', stock: 24 },
    { id: 2, name: 'Creatine 500g', category: 'Supplements', price: '$25.00', stock: 15 },
    { id: 3, name: 'Gym Towel', category: 'Accessories', price: '$10.00', stock: 50 },
    { id: 4, name: 'Water Bottle', category: 'Accessories', price: '$15.00', stock: 5 },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Inventory / Products</h1>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-red-500/20">
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
             <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Products</p>
            <p className="text-xl font-bold text-white">124</p>
          </div>
        </div>
        {/* Additional stat cards can go here */}
      </div>

      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-700/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900/50 text-xs uppercase text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-200">{product.name}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4 text-emerald-400">{product.price}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      product.stock > 10 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {product.stock > 10 ? 'In Stock' : 'Low Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-3">
                    <button className="text-gray-400 hover:text-blue-400 transition-colors p-1 bg-gray-800 rounded-md hover:bg-gray-700">
                      <Edit2 size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-red-400 transition-colors p-1 bg-gray-800 rounded-md hover:bg-gray-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
