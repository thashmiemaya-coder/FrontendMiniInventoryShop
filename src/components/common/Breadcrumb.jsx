import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeNames = {
    dashboard: 'Dashboard',
    items: 'Items',
    'stock/in': 'Stock In',
    'stock/out': 'Stock Out',
    'reports/stock-balance': 'Stock Balance Report',
    categories: 'Categories',
    suppliers: 'Suppliers',
    add: 'Add Item',
    edit: 'Edit Item',
  };

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500">
      <span className="text-gray-700 font-medium">Home</span>
      {pathnames.length > 0 && <span className="text-gray-300">/</span>}
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNames[name] || name.charAt(0).toUpperCase() + name.slice(1);

        return (
          <React.Fragment key={routeTo}>
            {isLast ? (
              <span className="text-gray-700 font-medium">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-green-600">
                {displayName}
              </Link>
            )}
            {!isLast && <span className="text-gray-300">/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;