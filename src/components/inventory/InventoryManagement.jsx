import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import inventoryService from '../../api/inventory/inventoryService';
import InventoryItemForm from './InventoryItemForm';
import InventoryDetail from './InventoryDetail';
import InventoryTransactionForm from './InventoryTransactions';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { FaPlus, FaSearch, FaFilter, FaExclamationTriangle } from 'react-icons/fa';

const InventoryManagement = () => {
  const { user, clinic } = useAuth();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isItemFormModalOpen, setIsItemFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [stats, setStats] = useState(null);

  // Fetch inventory items
  const fetchInventoryItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (stockFilter === 'lowStock') params.lowStock = true;
      if (stockFilter === 'active') params.status = 'active';
      if (stockFilter === 'inactive') params.status = 'inactive';

      const data = await inventoryService.getInventoryItems(params);
      setInventoryItems(data);
    } catch (err) {
      console.error('Error fetching inventory items:', err);
      setError(err.response?.data?.message || 'Failed to load inventory items');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch inventory statistics
  const fetchInventoryStats = async () => {
    try {
      const data = await inventoryService.getInventoryStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching inventory stats:', err);
      // Don't set error state here to avoid blocking the main functionality
    }
  };

  // Initial data load
  useEffect(() => {
    fetchInventoryItems();
    fetchInventoryStats();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchInventoryItems();
  }, [searchTerm, categoryFilter, stockFilter]);

  // Handle creating or updating an inventory item
  const handleSubmitItem = async (itemData) => {
    setIsLoading(true);
    setError(null);
    try {
      if (selectedItem) {
        // Update existing item
        await inventoryService.updateInventoryItem(selectedItem._id, itemData);
        setSuccessMessage('Inventory item updated successfully');
      } else {
        // Create new item
        await inventoryService.createInventoryItem(itemData);
        setSuccessMessage('Inventory item created successfully');
      }
      // Refresh the list and stats
      fetchInventoryItems();
      fetchInventoryStats();
      // Close the modal
      setIsItemFormModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error saving inventory item:', err);
      setError(err.response?.data?.message || 'Failed to save inventory item');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle creating an inventory transaction
  const handleSubmitTransaction = async (transactionData) => {
    setIsLoading(true);
    setError(null);
    try {
      await inventoryService.createInventoryTransaction(transactionData);
      setSuccessMessage('Transaction recorded successfully');
      // Refresh the list and stats
      fetchInventoryItems();
      fetchInventoryStats();
      // Close the modal
      setIsTransactionModalOpen(false);
    } catch (err) {
      console.error('Error recording transaction:', err);
      setError(err.response?.data?.message || 'Failed to record transaction');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting an inventory item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await inventoryService.deleteInventoryItem(itemToDelete);
      setSuccessMessage('Inventory item deleted successfully');
      // Refresh the list and stats
      fetchInventoryItems();
      fetchInventoryStats();
      // Close the modal
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      setError(err.response?.data?.message || 'Failed to delete inventory item');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle viewing an item
  const handleViewItem = (item) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  // Handle editing an item
  const handleEditItem = (item) => {
    setSelectedItem(item);
    setIsItemFormModalOpen(true);
  };

  // Handle confirming item deletion
  const handleConfirmDelete = (itemId) => {
    setItemToDelete(itemId);
    setIsDeleteModalOpen(true);
  };

  // Handle adding a transaction
  const handleAddTransaction = (item) => {
    setSelectedItem(item);
    setIsTransactionModalOpen(true);
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Get status badge color
  const getStatusBadgeColor = (item) => {
    return inventoryService.getStockStatusColor(item.stockStatus);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          <Button
            variant="primary"
            onClick={() => {
              setSelectedItem(null);
              setIsItemFormModalOpen(true);
            }}
          >
            <FaPlus className="mr-2" /> Add New Item
          </Button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-indigo-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900">Total Items</h2>
                  <p className="text-2xl font-semibold text-gray-700">{stats.totalItems}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-yellow-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900">Low Stock</h2>
                  <p className="text-2xl font-semibold text-gray-700">{stats.lowStockItems}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-red-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900">Out of Stock</h2>
                  <p className="text-2xl font-semibold text-gray-700">{stats.outOfStockItems}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900">Total Value</h2>
                  <p className="text-2xl font-semibold text-gray-700">{inventoryService.formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {successMessage && (
        <Alert
          variant="success"
          title="Success"
          message={successMessage}
          className="mb-4"
        />
      )}

      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
          className="mb-4"
        />
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              <option value="Medication">Medication</option>
              <option value="Medical Supply">Medical Supply</option>
              <option value="Equipment">Equipment</option>
              <option value="Office Supply">Office Supply</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Stock</option>
              <option value="lowStock">Low Stock</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">Loading inventory items...</div>
        ) : inventoryItems.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm || categoryFilter || stockFilter ? 'No items match your filters.' : 'No inventory items found. Add your first item!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryItems.map((item) => (
                  <tr key={item._id} className={!item.isActive ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.itemCode || 'No code'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.currentQuantity} {item.unitOfMeasure}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(item)}`}>
                        {item.stockStatus}
                      </span>
                      {!item.isActive && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inventoryService.formatCurrency(item.totalValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleViewItem(item)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleEditItem(item)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleAddTransaction(item)}
                      >
                        Transaction
                      </Button>
                      {item.isActive && (
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleConfirmDelete(item._id)}
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Low Stock Warning */}
      {stats && stats.lowStockItems > 0 && (
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Low Stock Alert:</strong> {stats.lowStockItems} items are below their reorder level. 
                <button 
                  onClick={() => setStockFilter('lowStock')} 
                  className="font-medium underline text-yellow-700 hover:text-yellow-600"
                >
                  View low stock items
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Item Form Modal */}
      <Modal
        isOpen={isItemFormModalOpen}
        onClose={() => setIsItemFormModalOpen(false)}
        title={selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        size="lg"
      >
        <InventoryItemForm
          onSubmit={handleSubmitItem}
          initialData={selectedItem}
          isLoading={isLoading}
          error={error}
        />
      </Modal>

      {/* Item Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Inventory Item Details"
        size="lg"
      >
        <InventoryDetail
          item={selectedItem}
          onEdit={handleEditItem}
          onDelete={handleConfirmDelete}
          onAddTransaction={handleAddTransaction}
          onBack={() => setIsDetailModalOpen(false)}
        />
      </Modal>

      {/* Transaction Modal */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title="Record Inventory Transaction"
        size="lg"
      >
        <InventoryTransactionForm
          onSubmit={handleSubmitTransaction}
          item={selectedItem}
          isLoading={isLoading}
          error={error}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="p-4">
          <p className="mb-4">Are you sure you want to delete this inventory item? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteItem}
              loading={isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryManagement;