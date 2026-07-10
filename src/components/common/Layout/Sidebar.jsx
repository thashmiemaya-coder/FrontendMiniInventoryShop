import { useState } from 'react';
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
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const [userRole] = useState(() => localStorage.getItem('userRole') || 'Cashier');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Manager', 'Clerk', 'Cashier'] },
    { path: '/items', icon: Package, label: 'Items', roles: ['Admin', 'Manager', 'Clerk'] },
    { path: '/stock/in', icon: ShoppingCart, label: 'Stock In', roles: ['Admin', 'Manager', 'Clerk'] },
    { path: '/stock/out', icon: Truck, label: 'Stock Out', roles: ['Admin', 'Manager', 'Clerk'] },
    { path: '/reports/stock-balance', icon: FileText, label: 'Stock Balance', roles: ['Admin', 'Manager', 'Clerk', 'Cashier'] },
    { path: '/categories', icon: Tags, label: 'Categories', roles: ['Admin', 'Manager'] },
    { path: '/suppliers', icon: Users, label: 'Suppliers', roles: ['Admin', 'Manager'] },
    { path: '/reports/low-stock', icon: AlertTriangle, label: 'Low Stock', roles: ['Admin', 'Manager', 'Clerk'] },
   
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-green-700 text-white flex flex-col">
      <div className="p-4 border-b border-green-600">
        <h1 className="text-xl font-bold">🍏 Grocery</h1>
        <p className="text-sm text-green-200">Inventory System</p>
        <div className="mt-1 text-xs text-green-300 bg-green-800/50 px-2 py-0.5 rounded inline-block">
          {userRole}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {filteredItems.map((item) => (
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