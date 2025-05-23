import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

const ServiceForm = ({ onSubmit, initialData, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    price: '',
    duration: 30,
    status: 'active',
    maxPatients: 1,
    requiresDoctor: true,
    requiredEquipment: [],
    preparationInstructions: '',
    aftercareInstructions: '',
    tax: 0,
    discountable: true,
    availableInBranches: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Service Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="general">General</option>
            <option value="consultation">Consultation</option>
            <option value="diagnostic">Diagnostic</option>
            <option value="treatment">Treatment</option>
            <option value="surgery">Surgery</option>
            <option value="therapy">Therapy</option>
            <option value="preventive">Preventive Care</option>
          </select>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Duration (minutes) *
          </label>
          <select
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {[15, 30, 45, 60, 90, 120, 180, 240].map(duration => (
              <option key={duration} value={duration}>{duration} minutes</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="tax" className="block text-sm font-medium text-gray-700">
            Tax Rate (%)
          </label>
          <input
            type="number"
            id="tax"
            name="tax"
            value={formData.tax}
            onChange={handleInputChange}
            min="0"
            max="100"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="maxPatients" className="block text-sm font-medium text-gray-700">
            Max Patients per Slot
          </label>
          <input
            type="number"
            id="maxPatients"
            name="maxPatients"
            value={formData.maxPatients}
            onChange={handleInputChange}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="seasonal">Seasonal</option>
          </select>
        </div>

        <div className="col-span-2">
          <label htmlFor="preparationInstructions" className="block text-sm font-medium text-gray-700">
            Preparation Instructions
          </label>
          <textarea
            id="preparationInstructions"
            name="preparationInstructions"
            value={formData.preparationInstructions}
            onChange={handleInputChange}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="col-span-2">
          <label htmlFor="aftercareInstructions" className="block text-sm font-medium text-gray-700">
            Aftercare Instructions
          </label>
          <textarea
            id="aftercareInstructions"
            name="aftercareInstructions"
            value={formData.aftercareInstructions}
            onChange={handleInputChange}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="col-span-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requiresDoctor"
                name="requiresDoctor"
                checked={formData.requiresDoctor}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="requiresDoctor" className="ml-2 block text-sm text-gray-700">
                Requires Doctor
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="discountable"
                name="discountable"
                checked={formData.discountable}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="discountable" className="ml-2 block text-sm text-gray-700">
                Can be Discounted
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="submit"
          loading={isLoading}
        >
          {initialData ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;
