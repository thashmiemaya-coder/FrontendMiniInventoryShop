const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Active': { color: 'bg-green-100 text-green-800' },
    'Inactive': { color: 'bg-gray-100 text-gray-800' },
    'Good Stock': { color: 'bg-green-100 text-green-800' },
    'Low Stock': { color: 'bg-orange-100 text-orange-800' },
    'Out of Stock': { color: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status] || statusConfig['Active'];

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {status}
    </span>
  );
};

export default StatusBadge;