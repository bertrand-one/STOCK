import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStockIn: 0,
    totalStockOut: 0,
    lowStockProducts: []
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch current stock
        const stockResponse = await axios.get('http://localhost:5000/api/reports/current-stock', {
          withCredentials: true
        });
        
        // Fetch recent stock movements
        const stockInResponse = await axios.get('http://localhost:5000/api/stockin', {
          withCredentials: true
        });
        
        const stockOutResponse = await axios.get('http://localhost:5000/api/stockout', {
          withCredentials: true
        });
        
        // Process data
        const products = stockResponse.data;
        const stockIn = stockInResponse.data;
        const stockOut = stockOutResponse.data;
        
        // Calculate stats
        const totalProducts = products.length;
        const totalStockIn = stockIn.reduce((sum, item) => sum + item.quantity, 0);
        const totalStockOut = stockOut.reduce((sum, item) => sum + item.quantity, 0);
        
        // Find low stock products (less than 10 items)
        const lowStockProducts = products.filter(product => product.quantity < 10);
        
        setStats({
          totalProducts,
          totalStockIn,
          totalStockOut,
          lowStockProducts
        });
        
        // Combine and sort recent activity
        const combinedActivity = [
          ...stockIn.map(item => ({
            ...item,
            type: 'in',
            date: new Date(item.date)
          })),
          ...stockOut.map(item => ({
            ...item,
            type: 'out',
            date: new Date(item.date)
          }))
        ];
        
        combinedActivity.sort((a, b) => b.date - a.date);
        
        setRecentActivity(combinedActivity.slice(0, 10)); // Get 10 most recent activities
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-md text-red-800">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Package size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/products" className="text-sm text-blue-600 hover:text-blue-800">
              View all products →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <ArrowDownToLine size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Stock In</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStockIn}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/stock-in" className="text-sm text-green-600 hover:text-green-800">
              Add stock →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <ArrowUpFromLine size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Stock Out</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStockOut}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/stock-out" className="text-sm text-orange-600 hover:text-orange-800">
              Remove stock →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Low Stock Alert */}
      {stats.lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Low Stock Alert:</span> {stats.lowStockProducts.length} products have low stock levels.
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <ul className="divide-y divide-gray-200">
                {stats.lowStockProducts.map(product => (
                  <li key={product.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.pname}</p>
                        <p className="text-xs text-gray-500">Code: {product.pcode}</p>
                      </div>
                      <div className="text-sm font-semibold text-red-600">
                        {product.quantity} in stock
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="border-t border-gray-200">
          {recentActivity.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentActivity.map(activity => (
                <li key={`${activity.type}-${activity.id}`} className="px-4 py-3">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {activity.type === 'in' ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type === 'in' ? 'Added' : 'Removed'} {activity.quantity} units of {activity.pname}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.date.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 text-center text-gray-500">
              No recent activity found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
