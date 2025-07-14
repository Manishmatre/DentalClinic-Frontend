import React, { useMemo } from 'react';
import { FaChartBar, FaBox, FaExclamationTriangle, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import KpiCard from '../dashboard/KpiCard';
import Card from '../ui/Card';

const InventoryStats = ({ items }) => {
  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const lowStockItems = items.filter(item => item.quantity <= item.minimumStock);
    const expiringItems = items.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      const today = new Date();
      const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysRemaining <= 30;
    });

    // Category distribution
    const categoryDistribution = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    // Value by category
    const valueByCategory = items.reduce((acc, item) => {
      const value = item.price * item.quantity;
      acc[item.category] = (acc[item.category] || 0) + value;
      return acc;
    }, {});

    // Top items by value
    const topItemsByValue = [...items]
      .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
      .slice(0, 5);

    return {
      totalItems,
      totalValue,
      lowStockItems,
      expiringItems,
      categoryDistribution,
      valueByCategory,
      topItemsByValue,
    };
  }, [items]);

  const totalCategories = Array.from(new Set(items.map(i => i.category).filter(Boolean))).length;

  return (
    <div className="space-y-8">
      {/* Stats Cards - Patient Management Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <FaBox className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Total Items</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalItems}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="p-4 flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <FaExclamationTriangle className="text-yellow-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Low Stock Items</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="p-4 flex items-center">
            <div className="rounded-full bg-red-100 p-3 mr-4">
              <FaCalendarAlt className="text-red-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Expiring Soon</h3>
              <p className="text-2xl font-bold text-red-600">{stats.expiringItems.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="p-4 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <FaDollarSign className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Total Inventory Value</h3>
              <p className="text-2xl font-bold text-green-600">{stats.totalValue.toLocaleString()} <span className="text-base">₹</span></p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Distribution */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
        <div className="space-y-4">
          {Object.entries(stats.categoryDistribution).map(([category, count]) => (
            <div key={category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{category}</span>
                <span className="font-medium text-gray-900">{count} items</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${(count / stats.totalItems) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Value by Category */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Value by Category</h3>
        <div className="space-y-4">
          {Object.entries(stats.valueByCategory).map(([category, value]) => (
            <div key={category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{category}</span>
                <span className="font-medium text-gray-900">
                  ${value.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${(value / stats.totalValue) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Items by Value */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Items by Value</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.topItemsByValue.map((item) => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.quantity} {item.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${(item.price * item.quantity).toLocaleString()}
                    </div>
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

export default InventoryStats; 