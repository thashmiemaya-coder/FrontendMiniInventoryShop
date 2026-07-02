import React, { useState, useEffect } from 'react';
import { Search, FileDown } from 'lucide-react';
import { stockService } from '../services/stockService';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const StockBalancePage = () => {
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  useEffect(() => {
    fetchStockBalance();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, stockData]);

  const fetchStockBalance = async () => {
    try {
      const response = await stockService.getStockBalance();
      setStockData(response?.data || []);
      setFilteredData(response?.data || []);
    } catch (error) {
      console.error('Error fetching stock balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (!searchTerm) {
      setFilteredData(stockData);
      return;
    }
    const filtered = stockData.filter((item) =>
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stock Balance Report</h1>
          <p className="text-gray-500 text-sm mt-1">View current stock status</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <FileDown className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Item Code or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm mt-6 overflow-hidden">
        {currentItems.length === 0 ? (
          <EmptyState message="No stock data found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item, index) => {
                  const status = item.stockStatus || 
                    (item.currentBalance <= 0 ? 'Out of Stock' : 
                     item.currentBalance <= item.reorderLevel ? 'Low Stock' : 'Good Stock');
                  return (
                    <tr key={item.itemId || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">{item.itemCode || '-'}</td>
                      <td className="px-4 py-3 text-sm">{item.itemName || '-'}</td>
                      <td className="px-4 py-3 text-sm">{item.categoryName || '-'}</td>
                      <td className="px-4 py-3 text-sm">{item.totalStockIn || 0}</td>
                      <td className="px-4 py-3 text-sm">{item.totalStockOut || 0}</td>
                      <td className="px-4 py-3 text-sm font-bold">{item.currentBalance || 0}</td>
                      <td className="px-4 py-3 text-sm">{item.reorderLevel || 0}</td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default StockBalancePage;