import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, X, AlertCircle } from 'lucide-react';
import { validateName } from '../utils/validation';
import FormValidationError from '../components/FormValidationError';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [newProduct, setNewProduct] = useState({ pname: '', quantity: 0 });
  const [editProduct, setEditProduct] = useState({ id: null, pname: '' });
  const [deleteProductId, setDeleteProductId] = useState(null);

  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    newProductName: '',
    editProductName: ''
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products', {
        withCredentials: true
      });
      setProducts(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle add product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate product name
    const nameValidation = validateName(newProduct.pname, 'Product name');
    if (!nameValidation.isValid) {
      setValidationErrors({...validationErrors, newProductName: nameValidation.message});
      setFormError('Please fix the errors in the form');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/products', newProduct, {
        withCredentials: true
      });

      setSuccessMessage('Product added successfully');
      setNewProduct({ pname: '', quantity: 0 });
      setShowAddModal(false);
      fetchProducts();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error adding product:', error);
      setFormError(error.response?.data?.message || 'Failed to add product');
    }
  };

  // Handle edit product
  const handleEditProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate product name
    const nameValidation = validateName(editProduct.pname, 'Product name');
    if (!nameValidation.isValid) {
      setValidationErrors({...validationErrors, editProductName: nameValidation.message});
      setFormError('Please fix the errors in the form');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/products/${editProduct.id}`, {
        pname: editProduct.pname
      }, {
        withCredentials: true
      });

      setSuccessMessage('Product updated successfully');
      setShowEditModal(false);
      fetchProducts();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating product:', error);
      setFormError(error.response?.data?.message || 'Failed to update product');
    }
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${deleteProductId}`, {
        withCredentials: true
      });

      setSuccessMessage('Product deleted successfully');
      setShowDeleteModal(false);
      fetchProducts();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.response?.data?.message || 'Failed to delete product');
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.pname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.pcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => {
            setFormError('');
            setNewProduct({ pname: '', quantity: 0 });
            setValidationErrors({...validationErrors, newProductName: ''});
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus size={16} className="mr-1" />
          Add Product
        </button>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 p-3 rounded-md text-green-800">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 p-3 rounded-md text-red-800">
          {error}
        </div>
      )}

      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search products by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X size={18} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Products table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading products...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.pcode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.pname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.quantity <= 0
                          ? 'bg-red-100 text-red-800'
                          : product.quantity < 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setFormError('');
                          setEditProduct({
                            id: product.id,
                            pname: product.pname
                          });
                          setValidationErrors({...validationErrors, editProductName: ''});
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteProductId(product.id);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No products match your search' : 'No products found'}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>

            {formError && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddProduct}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newProduct.pname}
                  onChange={(e) => {
                    setNewProduct({ ...newProduct, pname: e.target.value });
                    setValidationErrors({...validationErrors, newProductName: ''});
                  }}
                  className={`w-full px-3 py-2 border ${validationErrors.newProductName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                <FormValidationError message={validationErrors.newProductName} />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Quantity (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>

            {formError && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditProduct}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editProduct.pname}
                  onChange={(e) => {
                    setEditProduct({ ...editProduct, pname: e.target.value });
                    setValidationErrors({...validationErrors, editProductName: ''});
                  }}
                  className={`w-full px-3 py-2 border ${validationErrors.editProductName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                <FormValidationError message={validationErrors.editProductName} />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
