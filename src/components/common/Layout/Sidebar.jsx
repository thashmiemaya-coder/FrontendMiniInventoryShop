import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  FileText, 
  Tags,
  Users,
  AlertTriangle,
  LogOut,
  BookOpen
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/items', icon: Package, label: 'Item List' },
    { path: '/stock/in', icon: ShoppingCart, label: 'Stock In' },
    { path: '/stock/out', icon: Truck, label: 'Stock Out' },
    { path: '/reports/stock-balance', icon: FileText, label: 'Stock Balance' },
    { path: '/categories', icon: Tags, label: 'Categories' },
    { path: '/suppliers', icon: Users, label: 'Suppliers' },
    { path: '/reports/low-stock', icon: AlertTriangle, label: 'Low Stock' },
    { path: '/api-docs', icon: BookOpen, label: 'API Docs' },
  ];

  return (
    <aside className="w-64 bg-green-700 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-green-600">
        <h1 className="text-xl font-bold">🍏 Grocery</h1>
        <p className="text-sm text-green-200">Inventory System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors mb-1 ${
                isActive
                  ? 'bg-green-800 text-white'
                  : 'hover:bg-green-800/50 text-green-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-green-600">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-green-800/50 text-green-100 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;