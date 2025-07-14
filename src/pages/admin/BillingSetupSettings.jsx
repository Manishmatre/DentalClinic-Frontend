import React from 'react';

const BillingSetupSettings = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Billing & Invoice Settings</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">General Billing Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="USD" selected>USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter tax rate"
              value="7.5"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Prefix
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., INV-"
              value="DC-INV-"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Starting Number
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 1001"
              value="1001"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Footer Text
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="3"
            placeholder="Enter text to appear at the bottom of all invoices"
            value="Thank you for choosing our dental clinic. Payment is due within 30 days of service."
          ></textarea>
        </div>
        
        <div className="flex items-center mb-6">
          <input 
            type="checkbox" 
            id="auto_invoice" 
            className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            checked 
          />
          <label htmlFor="auto_invoice" className="ml-2 text-sm text-gray-700">
            Automatically generate invoices after appointments
          </label>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="cash_payment" 
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              checked 
            />
            <label htmlFor="cash_payment" className="ml-2 text-sm text-gray-700">
              Cash
            </label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="credit_card_payment" 
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              checked 
            />
            <label htmlFor="credit_card_payment" className="ml-2 text-sm text-gray-700">
              Credit Card
            </label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="debit_card_payment" 
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              checked 
            />
            <label htmlFor="debit_card_payment" className="ml-2 text-sm text-gray-700">
              Debit Card
            </label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="insurance_payment" 
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              checked 
            />
            <label htmlFor="insurance_payment" className="ml-2 text-sm text-gray-700">
              Insurance
            </label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="bank_transfer_payment" 
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              checked 
            />
            <label htmlFor="bank_transfer_payment" className="ml-2 text-sm text-gray-700">
              Bank Transfer
            </label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="online_payment" 
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              checked 
            />
            <label htmlFor="online_payment" className="ml-2 text-sm text-gray-700">
              Online Payment
            </label>
          </div>
        </div>
        
        <h4 className="text-md font-medium mb-3">Online Payment Integration</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Gateway
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select a payment gateway</option>
              <option value="stripe" selected>Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="square">Square</option>
              <option value="authorize">Authorize.net</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter API key"
              value="sk_test_*****************"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Insurance Providers</h3>
        
        <div className="mb-4">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            Add Insurance Provider
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Provider Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Contact Information</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-white">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Delta Dental</td>
                <td className="px-4 py-3 text-sm text-gray-700">contact@deltadental.com</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Cigna Dental</td>
                <td className="px-4 py-3 text-sm text-gray-700">support@cignadental.com</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Aetna</td>
                <td className="px-4 py-3 text-sm text-gray-700">providers@aetna.com</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          type="button"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Save Billing Settings
        </button>
      </div>
    </div>
  );
};

export default BillingSetupSettings;
