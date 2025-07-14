import React, { useState } from 'react';
import { 
  FaUniversity, 
  FaCreditCard, 
  FaPaypal, 
  FaPlus, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';

/**
 * Payment Methods Tab Component
 * Allows users to manage their bank accounts and payment methods
 */
const PaymentMethodsTab = ({ formData, isEditing, handleInputChange, handleArrayInputChange }) => {
  // Initialize bank accounts and payment methods if they don't exist
  const bankAccounts = formData.bankAccounts || [];
  const paymentMethods = formData.paymentMethods || [];
  
  // State for showing/hiding sensitive information
  const [showAccountNumbers, setShowAccountNumbers] = useState({});
  const [showCardNumbers, setShowCardNumbers] = useState({});
  
  // Add a new bank account
  const addBankAccount = () => {
    const newBankAccounts = [...bankAccounts, { 
      bankName: '', 
      accountNumber: '', 
      accountType: 'Savings', // Default to Savings account which is common in India
      routingNumber: '', // IFSC code in India
      accountHolderName: '',
      branch: '',
      isDefault: bankAccounts.length === 0 // Make default if it's the first account
    }];
    handleArrayInputChange('bankAccounts', newBankAccounts);
  };
  
  // Remove a bank account
  const removeBankAccount = (index) => {
    const newBankAccounts = [...bankAccounts];
    const isRemovingDefault = newBankAccounts[index].isDefault;
    
    newBankAccounts.splice(index, 1);
    
    // If we removed the default account and there are other accounts, make the first one default
    if (isRemovingDefault && newBankAccounts.length > 0) {
      newBankAccounts[0].isDefault = true;
    }
    
    handleArrayInputChange('bankAccounts', newBankAccounts);
  };
  
  // Update a bank account
  const updateBankAccount = (index, field, value) => {
    const newBankAccounts = [...bankAccounts];
    
    // If setting a new default, unset the current default
    if (field === 'isDefault' && value === true) {
      newBankAccounts.forEach((account, i) => {
        if (i !== index) {
          account.isDefault = false;
        }
      });
    }
    
    newBankAccounts[index][field] = value;
    handleArrayInputChange('bankAccounts', newBankAccounts);
  };
  
  // Add a new payment method
  const addPaymentMethod = () => {
    const newPaymentMethods = [...paymentMethods, { 
      type: 'credit', 
      cardNumber: '', 
      nameOnCard: '', 
      expiryDate: '', 
      cvv: '',
      cardType: '',
      isDefault: paymentMethods.length === 0, // Make default if it's the first method
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    }];
    handleArrayInputChange('paymentMethods', newPaymentMethods);
  };
  
  // Add a new UPI ID (India-specific payment method)
  const addUpiPaymentMethod = () => {
    const newPaymentMethods = [...paymentMethods, { 
      type: 'upi', 
      upiId: '', 
      phoneNumber: '',
      isDefault: paymentMethods.length === 0 // Make default if it's the first method
    }];
    handleArrayInputChange('paymentMethods', newPaymentMethods);
  };
  
  // Remove a payment method
  const removePaymentMethod = (index) => {
    const newPaymentMethods = [...paymentMethods];
    const isRemovingDefault = newPaymentMethods[index].isDefault;
    
    newPaymentMethods.splice(index, 1);
    
    // If we removed the default method and there are other methods, make the first one default
    if (isRemovingDefault && newPaymentMethods.length > 0) {
      newPaymentMethods[0].isDefault = true;
    }
    
    handleArrayInputChange('paymentMethods', newPaymentMethods);
  };
  
  // Update a payment method
  const updatePaymentMethod = (index, field, value) => {
    const newPaymentMethods = [...paymentMethods];
    
    // If setting a new default, unset the current default
    if (field === 'isDefault' && value === true) {
      newPaymentMethods.forEach((method, i) => {
        if (i !== index) {
          method.isDefault = false;
        }
      });
    }
    
    newPaymentMethods[index][field] = value;
    handleArrayInputChange('paymentMethods', newPaymentMethods);
  };
  
  // Toggle visibility of account number
  const toggleAccountNumberVisibility = (index) => {
    setShowAccountNumbers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Toggle visibility of card number
  const toggleCardNumberVisibility = (index) => {
    setShowCardNumbers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Format account number for display (show only last 4 digits)
  const formatAccountNumber = (accountNumber, showFull) => {
    if (!accountNumber) return '';
    return showFull ? accountNumber : `•••• ${accountNumber.slice(-4)}`;
  };
  
  // Format card number for display (show only last 4 digits)
  const formatCardNumber = (cardNumber, showFull) => {
    if (!cardNumber) return '';
    return showFull ? cardNumber : `•••• •••• •••• ${cardNumber.slice(-4)}`;
  };
  
  // Get card icon based on type
  const getCardIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'visa':
        return <FaCreditCard className="text-blue-700" />;
      case 'mastercard':
        return <FaCreditCard className="text-red-600" />;
      case 'amex':
        return <FaCreditCard className="text-blue-500" />;
      case 'paypal':
        return <FaPaypal className="text-blue-600" />;
      default:
        return <FaCreditCard className="text-gray-600" />;
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Bank Accounts Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Bank Accounts</h3>
          {isEditing && (
            <button
              type="button"
              onClick={addBankAccount}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-1" /> Add Account
            </button>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Manage your bank accounts for receiving payments and reimbursements.
        </p>
        
        {bankAccounts.length === 0 && !isEditing ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No bank accounts added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bankAccounts.map((account, index) => (
              <div key={index} className={`p-4 rounded-lg border ${account.isDefault ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'} shadow-sm`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-100">
                      <FaUniversity className="text-blue-600" />
                    </div>
                    
                    <div>
                      {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label htmlFor={`bankName-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                              Bank Name
                            </label>
                            <select
                              id={`bankName-${index}`}
                              value={account.bankName || ''}
                              onChange={(e) => updateBankAccount(index, 'bankName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Bank</option>
                              <option value="State Bank of India">State Bank of India</option>
                              <option value="HDFC Bank">HDFC Bank</option>
                              <option value="ICICI Bank">ICICI Bank</option>
                              <option value="Axis Bank">Axis Bank</option>
                              <option value="Punjab National Bank">Punjab National Bank</option>
                              <option value="Bank of Baroda">Bank of Baroda</option>
                              <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                              <option value="Yes Bank">Yes Bank</option>
                              <option value="IndusInd Bank">IndusInd Bank</option>
                              <option value="Canara Bank">Canara Bank</option>
                              <option value="Union Bank of India">Union Bank of India</option>
                              <option value="IDBI Bank">IDBI Bank</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor={`accountType-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                              Account Type
                            </label>
                            <select
                              id={`accountType-${index}`}
                              value={account.accountType || ''}
                              onChange={(e) => updateBankAccount(index, 'accountType', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Type</option>
                              <option value="Savings">Savings</option>
                              <option value="Current">Current</option>
                              <option value="Salary">Salary</option>
                              <option value="Fixed Deposit">Fixed Deposit</option>
                              <option value="Recurring Deposit">Recurring Deposit</option>
                              <option value="NRI">NRI</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor={`accountHolderName-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                              Account Holder Name
                            </label>
                            <input
                              type="text"
                              id={`accountHolderName-${index}`}
                              value={account.accountHolderName || ''}
                              onChange={(e) => updateBankAccount(index, 'accountHolderName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor={`accountNumber-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                              Account Number
                            </label>
                            <div className="relative">
                              <input
                                type={showAccountNumbers[index] ? "text" : "password"}
                                id={`accountNumber-${index}`}
                                value={account.accountNumber || ''}
                                onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => toggleAccountNumberVisibility(index)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                              >
                                {showAccountNumbers[index] ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor={`routingNumber-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                              IFSC Code
                            </label>
                            <input
                              type="text"
                              id={`routingNumber-${index}`}
                              value={account.routingNumber || ''}
                              onChange={(e) => updateBankAccount(index, 'routingNumber', e.target.value)}
                              placeholder="e.g., SBIN0001234"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">Indian Financial System Code - 11 character code that identifies the bank branch</p>
                          </div>
                          
                          <div>
                            <label htmlFor={`branch-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                              Branch
                            </label>
                            <input
                              type="text"
                              id={`branch-${index}`}
                              value={account.branch || ''}
                              onChange={(e) => updateBankAccount(index, 'branch', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{account.bankName || 'Unknown Bank'}</h4>
                          <p className="text-sm text-gray-600">
                            {account.accountType || 'Unknown Type'} Account • 
                            <span className="ml-1">
                              {formatAccountNumber(account.accountNumber, showAccountNumbers[index])}
                              <button
                                type="button"
                                onClick={() => toggleAccountNumberVisibility(index)}
                                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                              >
                                {showAccountNumbers[index] ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                              </button>
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {account.accountHolderName && `${account.accountHolderName} • `}
                            {account.branch && `${account.branch}`}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={account.isDefault || false}
                            onChange={(e) => updateBankAccount(index, 'isDefault', e.target.checked)}
                            disabled={!isEditing || account.isDefault}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">Default account</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeBankAccount(index)}
                      className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                
                {account.isDefault && (
                  <div className="mt-2 flex items-center text-sm text-blue-600">
                    <FaCheck className="mr-1" /> Default account for receiving payments
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Payment Methods Section */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
          {isEditing && (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={addPaymentMethod}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaPlus className="mr-1" /> Add Card
              </button>
              <button
                type="button"
                onClick={addUpiPaymentMethod}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaPlus className="mr-1" /> Add UPI
              </button>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Manage your payment methods for making payments and subscriptions.
        </p>
        
        {paymentMethods.length === 0 && !isEditing ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No payment methods added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {method.type === 'upi' ? 'UPI Payment' : (method.cardType || 'Card')} 
                      {method.isDefault && <span className="text-xs text-white bg-green-500 rounded-full px-2 py-1 ml-2">Default</span>}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {method.type === 'credit' ? 'Credit Card' : method.type === 'debit' ? 'Debit Card' : 'UPI ID'}
                    </p>
                  </div>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => updatePaymentMethod(index, 'isDefault', true)}
                        disabled={method.isDefault}
                        className={`text-xs ${method.isDefault ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
                      >
                        Make Default
                      </button>
                      <button
                        type="button"
                        onClick={() => removePaymentMethod(index)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                
                {/* UPI Payment Method */}
                {method.type === 'upi' ? (
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">UPI ID</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={method.upiId || ''}
                              onChange={(e) => updatePaymentMethod(index, 'upiId', e.target.value)}
                              placeholder="yourname@upi"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          ) : (
                            method.upiId
                          )}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={method.phoneNumber || ''}
                              onChange={(e) => updatePaymentMethod(index, 'phoneNumber', e.target.value)}
                              placeholder="+91 XXXXX XXXXX"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          ) : (
                            method.phoneNumber
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : (
                  /* Card Payment Method */
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Card Number</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                          {isEditing ? (
                            <input
                              type="text"
                              value={method.cardNumber}
                              onChange={(e) => updatePaymentMethod(index, 'cardNumber', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          ) : (
                            <>
                              {showCardNumbers[index] ? (
                                method.cardNumber
                              ) : (
                                <>•••• •••• •••• {method.cardNumber.slice(-4)}</>
                              )}
                              <button
                                type="button"
                                onClick={() => toggleCardNumberVisibility(index)}
                                className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                              >
                                {showCardNumbers[index] ? 'Hide' : 'Show'}
                              </button>
                            </>
                          )}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Name on Card</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={method.nameOnCard}
                              onChange={(e) => updatePaymentMethod(index, 'nameOnCard', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          ) : (
                            method.nameOnCard
                          )}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={method.expiryDate}
                              onChange={(e) => updatePaymentMethod(index, 'expiryDate', e.target.value)}
                              placeholder="MM/YY"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          ) : (
                            method.expiryDate
                          )}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Card Type</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {isEditing ? (
                            <select
                              value={method.cardType}
                              onChange={(e) => updatePaymentMethod(index, 'cardType', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            >
                              <option value="">Select Card Type</option>
                              <option value="Visa">Visa</option>
                              <option value="Mastercard">Mastercard</option>
                              <option value="RuPay">RuPay</option>
                              <option value="American Express">American Express</option>
                            </select>
                          ) : (
                            method.cardType
                          )}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Payment Type</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {isEditing ? (
                            <select
                              value={method.type}
                              onChange={(e) => updatePaymentMethod(index, 'type', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            >
                              <option value="credit">Credit Card</option>
                              <option value="debit">Debit Card</option>
                            </select>
                          ) : (
                            method.type === 'credit' ? 'Credit Card' : method.type === 'debit' ? 'Debit Card' : ''
                          )}
                        </dd>
                      </div>
                      {isEditing && (
                        <>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">CVV</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              <input
                                type="password"
                                value={method.cvv}
                                onChange={(e) => updatePaymentMethod(index, 'cvv', e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </dd>
                          </div>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Billing Address</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  placeholder="Street Address"
                                  value={method.billingAddress?.street || ''}
                                  onChange={(e) => {
                                    const updatedMethod = {...method};
                                    if (!updatedMethod.billingAddress) {
                                      updatedMethod.billingAddress = {};
                                    }
                                    updatedMethod.billingAddress.street = e.target.value;
                                    const newPaymentMethods = [...paymentMethods];
                                    newPaymentMethods[index] = updatedMethod;
                                    handleArrayInputChange('paymentMethods', newPaymentMethods);
                                  }}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    placeholder="City"
                                    value={method.billingAddress?.city || ''}
                                    onChange={(e) => {
                                      const updatedMethod = {...method};
                                      if (!updatedMethod.billingAddress) {
                                        updatedMethod.billingAddress = {};
                                      }
                                      updatedMethod.billingAddress.city = e.target.value;
                                      const newPaymentMethods = [...paymentMethods];
                                      newPaymentMethods[index] = updatedMethod;
                                      handleArrayInputChange('paymentMethods', newPaymentMethods);
                                    }}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  />
                                  <input
                                    type="text"
                                    placeholder="State/Province"
                                    value={method.billingAddress?.state || ''}
                                    onChange={(e) => {
                                      const updatedMethod = {...method};
                                      if (!updatedMethod.billingAddress) {
                                        updatedMethod.billingAddress = {};
                                      }
                                      updatedMethod.billingAddress.state = e.target.value;
                                      const newPaymentMethods = [...paymentMethods];
                                      newPaymentMethods[index] = updatedMethod;
                                      handleArrayInputChange('paymentMethods', newPaymentMethods);
                                    }}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    placeholder="Zip/Postal Code"
                                    value={method.billingAddress?.zipCode || ''}
                                    onChange={(e) => {
                                      const updatedMethod = {...method};
                                      if (!updatedMethod.billingAddress) {
                                        updatedMethod.billingAddress = {};
                                      }
                                      updatedMethod.billingAddress.zipCode = e.target.value;
                                      const newPaymentMethods = [...paymentMethods];
                                      newPaymentMethods[index] = updatedMethod;
                                      handleArrayInputChange('paymentMethods', newPaymentMethods);
                                    }}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Country"
                                    value={method.billingAddress?.country || ''}
                                    onChange={(e) => {
                                      const updatedMethod = {...method};
                                      if (!updatedMethod.billingAddress) {
                                        updatedMethod.billingAddress = {};
                                      }
                                      updatedMethod.billingAddress.country = e.target.value;
                                      const newPaymentMethods = [...paymentMethods];
                                      newPaymentMethods[index] = updatedMethod;
                                      handleArrayInputChange('paymentMethods', newPaymentMethods);
                                    }}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                            </dd>
                          </div>
                        </>
                      )}
                    </dl>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Payment Preferences */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Preferences</h3>
        
        <div className="bg-yellow-50 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Payment Information Security</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your payment information is securely stored and encrypted. We comply with PCI DSS standards to ensure the highest level of security for your financial data.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Payment Currency
            </label>
            <select
              name="defaultCurrency"
              value={formData.defaultCurrency || 'USD'}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
              <option value="JPY">Japanese Yen (JPY)</option>
              <option value="CAD">Canadian Dollar (CAD)</option>
              <option value="AUD">Australian Dollar (AUD)</option>
              <option value="INR">Indian Rupee (INR)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Payment Method
            </label>
            <select
              name="preferredPaymentMethod"
              value={formData.preferredPaymentMethod || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Preferred Method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="check">Check</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Address
            </label>
            <textarea
              name="billingAddress"
              rows={3}
              value={formData.billingAddress || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax ID / VAT Number
            </label>
            <input
              type="text"
              name="taxId"
              value={formData.taxId || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsTab;
