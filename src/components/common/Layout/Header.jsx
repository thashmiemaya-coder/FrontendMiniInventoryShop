import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { stockService } from '../../../services/stockService';

const Header = () => {
  const navigate = useNavigate();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchLowStockCount();
    const name = localStorage.getItem('userName') || 'User';
    const role = localStorage.getItem('userRole') || 'Guest';
    setUserName(name);
    setUserRole(role);
  }, []);

  const fetchLowStockCount = async () => {
    try {
      const response = await stockService.getLowStockReport();
      const items = response?.data || [];
      setLowStockCount(items.length);
    } catch (error) {
      console.error('Error fetching low stock count:', error);
      setLowStockCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = () => {
    navigate('/reports/low-stock');
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

          <button
            onClick={handleNotificationClick}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {!loading && lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {lowStockCount}
              </span>
            )}
          </button>

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