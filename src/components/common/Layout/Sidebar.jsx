import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Tags, 
  Users, 
  Package, 
  ShoppingCart, 
  Truck, 
  BarChart3, 
  AlertTriangle,
  LogOut,
  Store
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/categories', icon: Tags, label: 'Categories' },
    { path: '/suppliers', icon: Users, label: 'Suppliers' },
    { path: '/items', icon: Package, label: 'Items' },
    { path: '/stock/in', icon: ShoppingCart, label: 'Stock In' },
    { path: '/stock/out', icon: Truck, label: 'Stock Out' },
    { path: '/reports/stock-balance', icon: BarChart3, label: 'Stock Balance' },
    { path: '/reports/low-stock', icon: AlertTriangle, label: 'Low Stock' },
  ];

  return (
    <aside className="w-64 bg-red-700 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-red-600">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6" />
          <h1 className="text-xl font-bold">Grocery</h1>
        </div>
        <p className="text-sm text-red-200 mt-1 pl-8">Inventory System</p>
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
                  ? 'bg-red-800 text-white'
                  : 'hover:bg-red-800/50 text-red-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-red-600">
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-red-800/50 text-red-100 w-full">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;