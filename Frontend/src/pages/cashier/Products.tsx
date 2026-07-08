import { useState, useEffect } from 'react';
import { CashierLayout } from '../../layouts/CashierLayout';
import { productApi } from '../../services/cashier/productApi';
import type { Product } from '../../types/Product';
import { CreateProductModal } from '../../components/cashier/Product/CreateProductModal';
import { UpdateProductModal } from '../../components/cashier/Product/UpdateProductModal';
import { ViewProductModal } from '../../components/cashier/Product/ViewProductModal';
import { DeleteProductModal } from '../../components/cashier/Product/DeleteProductModal';
import toast from 'react-hot-toast';
import { Plus, Search, Eye, Pencil, Trash2, Package } from 'lucide-react';

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productApi.getProducts({ search, per_page: 10, page });
      setProducts(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const openView = (product: Product) => {
    setSelectedProduct(product);
    setViewOpen(true);
  };

  const openUpdate = (product: Product) => {
    setSelectedProduct(product);
    setUpdateOpen(true);
  };

  const openDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };

  const handleSuccess = () => {
    fetchProducts();
  };

  return (
    <CashierLayout>
      <div className="max-w-7xl mx-auto">
        {/* Shiny Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
            <Package className="w-7 h-7 text-red-500" />
            Products
          </h2>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-600/20"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {/* Search */}
        <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 mb-6 shadow-xl shadow-red-500/5">
          <div className="flex gap-4 items-end">
            <div className="flex-1 min-w-[200px] relative">
              <label className="block text-sm font-medium text-gray-300 mb-1">Search Products</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#1e242c] border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl shadow-red-500/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1e242c] text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">Image</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Quantity</th>
                  <th className="px-4 py-3 text-left">Sold</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="h-10 w-10 rounded bg-gray-700/40"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-24"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-16"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-12"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-12"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-20 mx-auto"></div></td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products found</td></tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-700/20 transition group">
                      <td className="px-4 py-3">
                        {product.image ? (
                          <img
                            src={`http://localhost:8000/storage/${product.image}`}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover border border-gray-600"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400">
                            <Package size={18} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-gray-300">₱{product.price}</td>
                      <td className="px-4 py-3 text-gray-300">{product.quantity}</td>
                      <td className="px-4 py-3 text-gray-300">{product.sold}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openView(product)}
                            className="p-1.5 text-blue-400 hover:text-white border border-blue-400/30 hover:bg-blue-500/20 rounded-lg transition group-hover:border-blue-400/60"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openUpdate(product)}
                            className="p-1.5 text-yellow-400 hover:text-white border border-yellow-400/30 hover:bg-yellow-500/20 rounded-lg transition group-hover:border-yellow-400/60"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => openDelete(product)}
                            className="p-1.5 text-red-400 hover:text-white border border-red-400/30 hover:bg-red-500/20 rounded-lg transition group-hover:border-red-400/60"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm text-gray-400">
            <span>Page {pagination.current_page} of {pagination.last_page}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-4 py-1.5 bg-[#1e242c] rounded-lg disabled:opacity-50 hover:bg-gray-700/30 transition border border-gray-700/30"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-4 py-1.5 bg-[#1e242c] rounded-lg disabled:opacity-50 hover:bg-gray-700/30 transition border border-gray-700/30"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <CreateProductModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={handleSuccess}
        />
        <UpdateProductModal
          isOpen={updateOpen}
          onClose={() => { setUpdateOpen(false); setSelectedProduct(null); }}
          onSuccess={handleSuccess}
          product={selectedProduct}
        />
        <ViewProductModal
          isOpen={viewOpen}
          onClose={() => { setViewOpen(false); setSelectedProduct(null); }}
          product={selectedProduct}
        />
        <DeleteProductModal
          isOpen={deleteOpen}
          onClose={() => { setDeleteOpen(false); setSelectedProduct(null); }}
          onSuccess={handleSuccess}
          product={selectedProduct}
        />
      </div>
    </CashierLayout>
  );
};