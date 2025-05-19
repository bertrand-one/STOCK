import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, X, ArrowUpFromLine, Edit, Trash2, AlertCircle } from 'lucide-react';

const StockOut = () => {
  const [products, setProducts] = useState([]);
  const [stockOutRecords, setStockOutRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProductData, setSelectedProductData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch products and stock-out records
  const fetchData = async () => {
    try {
      setLoading(true);

      const [productsResponse, stockOutResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/products', {
          withCredentials: true
        }),
        axios.get('http://localhost:5000/api/stockout', {
          withCredentials: true
        })
      ]);

      setProducts(productsResponse.data);
      setStockOutRecords(stockOutResponse.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update selected product data when product changes
  useEffect(() => {
    if (selectedProduct) {
      const product = products.find(p => p.id.toString() === selectedProduct.toString());
      setSelectedProductData(product);
      // Reset quantity to 1 or max available if less than 1
      setQuantity(product && product.quantity > 0 ? 1 : 0);
    } else {
      setSelectedProductData(null);
    }
  }, [selectedProduct, products]);

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!selectedProduct) {
      errors.product = 'Please select a product';
    }

    if (!quantity) {
      errors.quantity = 'Quantity is required';
    } else if (quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    } else if (!Number.isInteger(quantity)) {
      errors.quantity = 'Quantity must be a whole number';
    } else if (selectedProductData && quantity > selectedProductData.quantity) {
      errors.quantity = `Not enough stock available. Maximum available: ${selectedProductData.quantity}`;
    }

    setValidationErrors(errors);

    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  // Handle remove stock
  const handleRemoveStock = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate form
    if (!validateForm()) {
      setFormError('Please fix the errors in the form');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/stockout', {
        product_id: selectedProduct,
        quantity,
        notes
      }, {
        withCredentials: true
      });

      setSuccessMessage('Stock removed successfully');
      setShowAddModal(false);
      setSelectedProduct('');
      setQuantity(1);
      setNotes('');
      setValidationErrors({});
      fetchData();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error removing stock:', error);
      setFormError(error.response?.data?.message || 'Failed to remove stock');
    }
  };

  // Handle edit stock
  const handleEditStock = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate form
    if (!validateForm()) {
      setFormError('Please fix the errors in the form');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/stockout/${editRecord.id}`, {
        product_id: selectedProduct,
        quantity,
        notes
      }, {
        withCredentials: true
      });

      setSuccessMessage('Stock record updated successfully');
      setShowEditModal(false);
      setEditRecord(null);
      setSelectedProduct('');
      setQuantity(1);
      setNotes('');
      setValidationErrors({});
      fetchData();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating stock record:', error);
      setFormError(error.response?.data?.message || 'Failed to update stock record');
    }
  };

  // Handle delete stock
  const handleDeleteStock = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/stockout/${deleteRecordId}`, {
        withCredentials: true
      });

      setSuccessMessage('Stock record deleted successfully');
      setShowDeleteModal(false);
      setDeleteRecordId(null);
      fetchData();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting stock record:', error);
      setError(error.response?.data?.message || 'Failed to delete stock record');
    }
  };

  // Filter stock-out records based on search term
  const filteredRecords = stockOutRecords.filter(record =>
    record.pname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.pcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Stock Out</h1>
        <button
          onClick={() => {
            setFormError('');
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
        >
          <Plus size={16} className="mr-1" />
          Remove Stock
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
          placeholder="Search by product name or code..."
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

      {/* Stock-out records table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading stock records...</div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.pcode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.pname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        -{record.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {record.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setFormError('');
                          setValidationErrors({});
                          setEditRecord(record);
                          setSelectedProduct(record.product_id.toString());
                          setQuantity(record.quantity);
                          setNotes(record.notes || '');
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteRecordId(record.id);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
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
            {searchTerm ? 'No records match your search' : 'No stock-out records found'}
          </div>
        )}
      </div>

      {/* Remove Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Remove Stock</h2>
              <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                <ArrowUpFromLine size={20} />
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-sm flex items-start">
                <AlertCircle size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRemoveStock}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    setValidationErrors({...validationErrors, product: ''});
                  }}
                  className={`w-full px-3 py-2 border ${validationErrors.product ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">-- Select a product --</option>
                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                      disabled={product.quantity <= 0}
                    >
                      {product.pname} ({product.pcode}) - Available: {product.quantity}
                    </option>
                  ))}
                </select>
                {validationErrors.product && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {validationErrors.product}
                  </p>
                )}
              </div>

              {selectedProductData && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Current Stock:</span> {selectedProductData.quantity}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProductData?.quantity || 0}
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(parseInt(e.target.value) || 0);
                    setValidationErrors({...validationErrors, quantity: ''});
                  }}
                  className={`w-full px-3 py-2 border ${validationErrors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  disabled={!selectedProductData || selectedProductData.quantity <= 0}
                />
                {validationErrors.quantity && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {validationErrors.quantity}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setValidationErrors({});
                    setFormError('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  disabled={!selectedProductData || selectedProductData.quantity <= 0 || quantity <= 0}
                >
                  Remove Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Stock Record</h2>
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Edit size={20} />
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-sm flex items-start">
                <AlertCircle size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditStock}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                  {editRecord && products.find(p => p.id.toString() === selectedProduct.toString())?.pname}
                </div>
                <p className="mt-1 text-xs text-gray-500">Product cannot be changed</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProductData?.quantity + editRecord?.quantity || 0}
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(parseInt(e.target.value) || 0);
                    setValidationErrors({...validationErrors, quantity: ''});
                  }}
                  className={`w-full px-3 py-2 border ${validationErrors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {validationErrors.quantity && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {validationErrors.quantity}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Maximum available: {selectedProductData ? (selectedProductData.quantity + editRecord?.quantity) : 0}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditRecord(null);
                    setValidationErrors({});
                    setFormError('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Stock
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Confirm Delete</h2>
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <Trash2 size={20} />
              </div>
            </div>

            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this stock-out record? This action cannot be undone and may affect inventory counts.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteRecordId(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStock}
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

export default StockOut;
