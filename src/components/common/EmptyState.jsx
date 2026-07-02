import React from 'react';

const EmptyState = ({ message = 'No data found' }) => {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default EmptyState;