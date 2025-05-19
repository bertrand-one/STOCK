import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileBarChart, ArrowDownToLine, ArrowUpFromLine, Calendar, Search, X } from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

    // Set default end date to today
    setEndDate(formattedToday);

    // Set default start date to 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Generate report
  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate dates for custom report
      if (reportType === 'custom') {
        if (!startDate || !endDate) {
          setError('Please select both start and end dates');
          setLoading(false);
          return;
        }

        if (new Date(startDate) > new Date(endDate)) {
          setError('Start date cannot be after end date');
          setLoading(false);
          return;
        }
      }

      // Build query parameters
      const params = { reportType };
      if (reportType === 'custom') {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await axios.get('http://localhost:5000/api/reports/stock-movement', {
        params,
        withCredentials: true
      });

      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Filter report details based on search term
  const filteredDetails = reportData?.details.filter(item =>
    !searchTerm ||
    item.pname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.pcode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      {/* Report Controls */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily (Today)</option>
              <option value="monthly">Monthly (Current Month)</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {reportType === 'custom' && (
            <>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              <FileBarChart size={16} className="mr-1" />
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6">
          {/* Report Header */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Stock Movement Report
              </h2>
              <div className="flex items-center text-gray-500">
                <Calendar size={16} className="mr-1" />
                <span className="text-sm">
                  {reportType === 'daily' ? 'Today' :
                   reportType === 'monthly' ? 'Current Month' :
                   `${startDate} to ${endDate}`}
                </span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Products</h3>
                <p className="text-2xl font-semibold text-gray-900">{reportData.summary.length}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-green-700 mb-1">Total Stock In</h3>
                <p className="text-2xl font-semibold text-green-900">
                  {reportData.summary.reduce((sum, item) => sum + (parseInt(item.total_stock_in) || 0), 0)}
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-orange-700 mb-1">Total Stock Out</h3>
                <p className="text-2xl font-semibold text-orange-900">
                  {reportData.summary.reduce((sum, item) => sum + (parseInt(item.total_stock_out) || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Product Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Change
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.summary.map((item) => (
                    <tr key={item.product_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.pcode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.pname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          +{parseInt(item.total_stock_in) || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          -{parseInt(item.total_stock_out) || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                          const netChange = parseInt(item.net_change) || 0;
                          return (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              netChange > 0
                                ? 'bg-green-100 text-green-800'
                                : netChange < 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {netChange > 0 ? '+' : ''}{netChange}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Movements */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Detailed Movements</h3>

              {/* Search bar */}
              <div className="mt-3 relative">
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
            </div>

            {filteredDetails.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDetails.map((item) => (
                      <tr key={`${item.movement_type}-${item.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{item.pname}</div>
                          <div className="text-xs text-gray-500">{item.pcode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.movement_type === 'IN' ? (
                            <div className="flex items-center text-green-600">
                              <ArrowDownToLine size={16} className="mr-1" />
                              <span>Stock In</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-orange-600">
                              <ArrowUpFromLine size={16} className="mr-1" />
                              <span>Stock Out</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.movement_type === 'IN'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.movement_type === 'IN' ? '+' : '-'}{item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {item.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No movements match your search' : 'No movements found in this period'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
