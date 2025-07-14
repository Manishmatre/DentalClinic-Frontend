import React, { useState, useEffect } from 'react';
import inventoryService from '../../api/inventory/inventoryService';

const DentalCategorySelector = ({ 
  selectedCategory, 
  selectedSubcategory, 
  onCategoryChange, 
  onSubcategoryChange 
}) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await inventoryService.getDentalCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching dental categories:', err);
        setError('Failed to load categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // For now, we'll use hardcoded subcategories until we implement subcategory API
  // In a real implementation, this would fetch subcategories from the API
  useEffect(() => {
    if (selectedCategory) {
      // This is a placeholder - in a real implementation, you would fetch subcategories
      // based on the selected category from the API
      setSubcategories(['Shade A1', 'Shade A2', 'Shade A3', 'Shade B1', 'Shade B2']);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category *
        </label>
        <select
          id="category"
          value={selectedCategory || ''}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="">Select a category</option>
          {loading ? (
            <option disabled>Loading categories...</option>
          ) : error ? (
            <option disabled>Error loading categories</option>
          ) : (
            categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))
          )}
        </select>
      </div>

      {subcategories.length > 0 && (
        <div>
          <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory
          </label>
          <select
            id="subcategory"
            value={selectedSubcategory || ''}
            onChange={(e) => onSubcategoryChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select a subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default DentalCategorySelector;
