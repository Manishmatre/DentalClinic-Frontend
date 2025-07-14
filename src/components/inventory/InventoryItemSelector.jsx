import React, { useState, useEffect } from 'react';
import inventoryService from '../../api/inventory/inventoryService';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { FaSearch, FaPlus } from 'react-icons/fa';

const InventoryItemSelector = ({ 
  onItemSelect, 
  selectedItems = [],
  excludeIds = [] 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch inventory items based on search term
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        
        const data = await inventoryService.getInventoryItems(params);
        
        // Filter out already selected items and items with zero quantity
        const filteredItems = data.filter(item => 
          !excludeIds.includes(item._id) && 
          !selectedItems.some(selected => selected.itemId === item._id) &&
          item.currentQuantity > 0
        );
        
        setInventoryItems(filteredItems);
      } catch (err) {
        console.error('Error fetching inventory items:', err);
        setError('Failed to load inventory items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [searchTerm, selectedItems, excludeIds]);

  // Handle selecting an item
  const handleSelectItem = (item) => {
    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (quantity > item.currentQuantity) {
      setError(`Only ${item.currentQuantity} ${item.unitOfMeasure} available`);
      return;
    }

    onItemSelect(item, quantity);
    setQuantity(1); // Reset quantity after selection
  };

  return (
    <div className="space-y-4">
      {/* Search Box */}
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Input
            label="Search Inventory Items"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name or category"
            icon={<FaSearch className="text-gray-400" />}
          />
        </div>
        <div className="w-24">
          <Input
            label="Quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>
      </div>
      
      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}
      
      {/* Items List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="p-4 text-center">Loading items...</div>
        ) : inventoryItems.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No matching items found' : 'No items available'}
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {inventoryItems.map(item => (
                <li 
                  key={item._id} 
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                      <div className="text-xs text-gray-500">
                        Available: {item.currentQuantity} {item.unitOfMeasure}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900 mr-2">
                        {inventoryService.formatCurrency(item.unitCost)}
                      </div>
                      <Button 
                        variant="primary" 
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(item);
                        }}
                      >
                        <FaPlus className="mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryItemSelector;
