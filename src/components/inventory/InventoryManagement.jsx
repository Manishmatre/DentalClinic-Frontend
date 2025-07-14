import React, { useState, useEffect } from 'react';
import Tabs from '../ui/Tabs';
import InventoryStats from './InventoryStats';
import InventoryList from './InventoryList';
import StockAlerts from './StockAlerts';
import TransactionHistory from './TransactionHistory';
import inventoryService from '../../services/inventoryService';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BarChart from '../dashboard/BarChart';
import PieChart from '../dashboard/PieChart';
import ChartCard from '../dashboard/ChartCard';
import { FaBox, FaExclamationTriangle, FaCalendarAlt, FaDollarSign, FaTruck, FaHistory, FaFileExport, FaBell, FaPlus, FaTags, FaChartBar, FaExchangeAlt } from 'react-icons/fa';
import KpiCard from '../dashboard/KpiCard';
import Card from '../ui/Card';
import LineChart from '../dashboard/LineChart';
import Categories from './Categories';
import UsageAnalytics from './UsageAnalytics';
import Suppliers from './Suppliers';

const TAB_DASHBOARD = 'dashboard';
const TAB_ITEMS = 'items';
const TAB_CATEGORIES = 'categories';
const TAB_ALERTS = 'alerts';
const TAB_TRANSACTIONS = 'transactions';
const TAB_SUPPLIERS = 'suppliers';
const TAB_USAGE = 'usage';
const TAB_REPORTS = 'reports';

const tabList = [
  { id: TAB_DASHBOARD, label: 'Dashboard', icon: <FaBox /> },
  { id: TAB_ITEMS, label: 'Items', icon: <FaBox /> },
  { id: TAB_CATEGORIES, label: 'Categories', icon: <FaTags /> },
  { id: TAB_ALERTS, label: 'Stock Alerts', icon: <FaExclamationTriangle /> },
  { id: TAB_TRANSACTIONS, label: 'Transactions', icon: <FaExchangeAlt /> },
  { id: TAB_SUPPLIERS, label: 'Suppliers', icon: <FaTruck /> },
  { id: TAB_USAGE, label: 'Usage Analytics', icon: <FaChartBar /> },
  { id: TAB_REPORTS, label: 'Reports', icon: <FaFileExport /> },
];

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState(TAB_DASHBOARD);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const { auth } = useAuth();
  const clinicId = auth?.clinic?._id || auth?.clinicId || auth?.user?.clinicId || null;
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line
  }, [clinicId]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsData, statsData, transactionsData] = await Promise.all([
        inventoryService.getInventoryItems(clinicId ? { clinicId } : {}),
        inventoryService.getInventoryStats(clinicId ? { clinicId } : {}),
        inventoryService.getInventoryTransactions(clinicId ? { clinicId } : {}),
      ]);
      setItems(itemsData || []);
      setStats(statsData || {});
      setTransactions(transactionsData || []);
      setLowStockItems((itemsData || []).filter(item => item.quantity <= item.minimumStock));
      setExpiringItems((itemsData || []).filter(item => {
        if (!item.expiryDate) return false;
        const expiryDate = new Date(item.expiryDate);
        const today = new Date();
        const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysRemaining <= 30;
      }));
    } catch (err) {
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Top suppliers
  const topSuppliers = Array.from(new Set(items.map(i => i.supplier?.name).filter(Boolean)))
    .map(name => ({
      name,
      count: items.filter(i => i.supplier?.name === name).length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Helper: Recent inventory transactions (show last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Helper: Value over time (mocked for now)
  const valueOverTime = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Inventory Value',
      data: [120000, 130000, 125000, 140000, 135000, 150000],
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaBox className="mr-2 text-indigo-600" />
            Inventory Management
          </h1>
          <p className="text-gray-500">Manage all inventory, suppliers, and stock for your clinic</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow"
          onClick={() => navigate('/admin/inventory/add')}
        >
          <FaPlus className="mr-2" /> Add Item
        </Button>
      </div>
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabList.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      {/* KPI Cards */}
      {activeTab === TAB_DASHBOARD && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            title="Total Items"
            value={items.length}
            icon={<FaBox />}
            color="primary"
          />
          <KpiCard
            title="Low Stock Items"
            value={lowStockItems.length}
            icon={<FaExclamationTriangle />}
            color="warning"
          />
          <KpiCard
            title="Expiring Soon"
            value={expiringItems.length}
            icon={<FaCalendarAlt />}
            color="danger"
          />
          <KpiCard
            title="Total Inventory Value"
            value={items.reduce((sum, item) => sum + ((item.price || item.unitCost || 0) * (item.quantity || item.currentQuantity || 0)), 0).toLocaleString()}
            unit="₹"
            icon={<FaDollarSign />}
            color="success"
          />
        </div>
      )}
      {/* Charts Section */}
      {activeTab === TAB_DASHBOARD && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <ChartCard title="Inventory Value Over Time">
            <LineChart data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Inventory Value',
                data: [120000, 130000, 125000, 140000, 135000, 150000],
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.4
              }]
            }} />
          </ChartCard>
          <ChartCard title="Category Distribution">
            <PieChart data={{
              labels: Array.from(new Set(items.map(i => i.category).filter(Boolean))),
              datasets: [{
                label: 'Items',
                data: Array.from(new Set(items.map(i => i.category).filter(Boolean))).map(
                  cat => items.filter(i => i.category === cat).length
                ),
                backgroundColor: [
                  '#3b82f6', '#f59e42', '#10b981', '#ef4444', '#6366f1', '#fbbf24', '#a78bfa', '#f472b6',
                ],
              }],
            }} />
          </ChartCard>
          <ChartCard title="Top 5 Items by Value">
            <LineChart data={{
              labels: items
                .sort((a, b) => ((b.price || b.unitCost || 0) * (b.quantity || b.currentQuantity || 0)) - ((a.price || a.unitCost || 0) * (a.quantity || a.currentQuantity || 0)))
                .slice(0, 5)
                .map(i => i.name),
              datasets: [{
                label: 'Value',
                data: items
                  .sort((a, b) => ((b.price || b.unitCost || 0) * (b.quantity || b.currentQuantity || 0)) - ((a.price || a.unitCost || 0) * (a.quantity || a.currentQuantity || 0)))
                  .slice(0, 5)
                  .map(i => (i.price || i.unitCost || 0) * (i.quantity || i.currentQuantity || 0)),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
              }]
            }} />
          </ChartCard>
        </div>
      )}
      {/* Recent Inventory Changes Table */}
      {activeTab === TAB_DASHBOARD && (
        <Card title="Recent Inventory Changes">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.slice(0, 5).length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">No recent inventory changes.</td>
                  </tr>
                )}
                {transactions.slice(0, 5).map(tx => (
                  <tr key={tx._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.itemName || tx.itemId?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.transactionType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.date ? new Date(tx.date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.performedBy || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {/* Quick Actions */}
      {activeTab === TAB_DASHBOARD && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <div className="flex flex-col items-center p-6">
              <FaPlus className="text-3xl text-indigo-600 mb-2" />
              <h3 className="font-semibold text-lg mb-1">Add Inventory Item</h3>
              <p className="text-gray-500 mb-4 text-center">Add a new item to your inventory.</p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700" onClick={() => navigate('/admin/inventory/add')}>Add Item</button>
            </div>
          </Card>
          <Card>
            <div className="flex flex-col items-center p-6">
              <FaTruck className="text-3xl text-green-600 mb-2" />
              <h3 className="font-semibold text-lg mb-1">Order Supplies</h3>
              <p className="text-gray-500 mb-4 text-center">Order new supplies from your top suppliers.</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => navigate('/admin/suppliers')}>Order Supplies</button>
            </div>
          </Card>
          <Card>
            <div className="flex flex-col items-center p-6">
              <FaFileExport className="text-3xl text-yellow-600 mb-2" />
              <h3 className="font-semibold text-lg mb-1">Export Inventory</h3>
              <p className="text-gray-500 mb-4 text-center">Export your inventory data to CSV or Excel.</p>
              <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600" onClick={() => exportToCSV(items)}>Export</button>
            </div>
          </Card>
        </div>
      )}
      {/* Tab Content */}
      {activeTab === TAB_ITEMS && (
        <InventoryList items={items} categories={[]} onUpdateStock={fetchAllData} onRefresh={fetchAllData} />
      )}
      {activeTab === TAB_CATEGORIES && (
        <Categories />
      )}
      {activeTab === TAB_ALERTS && (
        <StockAlerts lowStockItems={lowStockItems} expiringItems={expiringItems} />
      )}
      {activeTab === TAB_TRANSACTIONS && (
        <TransactionHistory transactions={transactions} />
      )}
      {activeTab === TAB_SUPPLIERS && (
        <Suppliers />
      )}
      {activeTab === TAB_USAGE && (
        <UsageAnalytics />
      )}
      {activeTab === TAB_REPORTS && (
        <div className="text-center py-12 text-lg text-gray-500">Inventory reports coming soon...</div>
      )}
    </div>
  );
};

export default InventoryManagement;
