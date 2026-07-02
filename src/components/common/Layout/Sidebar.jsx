import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  FileText, 
  Tags,
  Users,
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/items', icon: Package, label: 'Item List' },
    { path: '/stock/in', icon: ShoppingCart, label: 'Stock In' },
    { path: '/stock/out', icon: Truck, label: 'Stock Out' },
    { path: '/reports/stock-balance', icon: FileText, label: 'Stock Balance' },
    { path: '/categories', icon: Tags, label: 'Categories' },
    { path: '/suppliers', icon: Users, label: 'Suppliers' },
  ];

  return (
    <aside className="w-64 bg-red-700 text-white flex flex-col">
      <div className="p-4 border-b border-red-600">
        <h1 className="text-xl font-bold">🍏 Grocery</h1>
        <p className="text-sm text-red-200">Inventory System</p>
      </div>

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