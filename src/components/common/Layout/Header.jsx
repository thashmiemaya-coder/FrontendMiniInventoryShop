import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, AlertTriangle, ShoppingCart } from 'lucide-react';
import { stockService } from '../../../services/stockService';

const Header = () => {
  const navigate = useNavigate();
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  // Fetch low stock items
  const fetchLowStockItems = async () => {
    try {
      const response = await stockService.getLowStockReport();
      const items = response?.data || [];
      setLowStockItems(items);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      setLowStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (lowStockItems.length > 0) {
      setShowDropdown(!showDropdown);
    } else {
      // If no low stock items, maybe show a toast or just ignore
      // For now, we'll just ignore the click.
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigate to low stock report (from "View All")
  const handleViewAll = () => {
    setShowDropdown(false);
    navigate('/reports/low-stock');
  };

  // Navigate to stock in with pre-selected item (optional)
  const handleRestock = (itemId) => {
    setShowDropdown(false);
    navigate('/stock/in', { state: { preselectedItemId: itemId } });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 relative">
      <div className="flex items-center justify-between">
        {/* Breadcrumb placeholder */}
        <div className="text-sm text-gray-500">
          <span className="text-gray-700 font-medium">Home</span>
          <span className="mx-2">/</span>
          <span>Dashboard</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          </div>

          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {!loading && lowStockItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {lowStockItems.length}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showDropdown && lowStockItems.length > 0 && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-700">⚠️ Low Stock Alerts</span>
                  <button
                    onClick={handleViewAll}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View All
                  </button>
                </div>
                <ul className="divide-y divide-gray-100">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <li key={item.itemId} className="p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.itemName}</p>
                          <p className="text-xs text-gray-500">
                            Stock: <span className="font-bold text-orange-600">{item.currentBalance}</span> / Reorder: {item.reorderLevel}
                          </p>
                          <p className="text-xs text-gray-400">{item.categoryName || 'No category'}</p>
                        </div>
                        <button
                          onClick={() => handleRestock(item.itemId)}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          Restock
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                {lowStockItems.length > 5 && (
                  <div className="p-2 text-center text-xs text-gray-400 border-t border-gray-100">
                    + {lowStockItems.length - 5} more items
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User avatar */}
          <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;