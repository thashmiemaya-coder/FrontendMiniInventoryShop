import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, AlertTriangle, ShoppingCart } from 'lucide-react';
import { stockService } from '../../../services/stockService';

const Header = () => {
  const navigate = useNavigate();
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'User';
    const role = localStorage.getItem('userRole') || 'Guest';
    setUserName(name);
    setUserRole(role);
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    try {
      const response = await stockService.getLowStockReport();
      setLowStockItems(response?.data || []);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      setLowStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewAll = () => {
    setShowDropdown(false);
    navigate('/reports/low-stock');
  };

  const handleRestock = (itemId) => {
    setShowDropdown(false);
    navigate('/stock/in', { state: { preselectedItemId: itemId } });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          <span className="text-gray-700 font-medium">Home</span>
          <span className="mx-2">/</span>
          <span>Dashboard</span>
        </div>

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

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Low Stock Alerts
                  </span>
                  <button
                    onClick={handleViewAll}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View All
                  </button>
                </div>
                {lowStockItems.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No low stock items
                  </div>
                ) : (
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
                )}
                {lowStockItems.length > 5 && (
                  <div className="p-2 text-center text-xs text-gray-400 border-t border-gray-100">
                    + {lowStockItems.length - 5} more items
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700">{userName}</p>
              <p className="text-xs text-gray-400">{userRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-1 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
