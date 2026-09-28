import React from 'react';

const Badge = ({ status }) => {
  let colorClass = 'bg-gray-100 text-gray-800';
  
  switch (status?.toLowerCase()) {
    case 'pending':
      colorClass = 'bg-yellow-100 text-yellow-800';
      break;
    case 'confirmed':
      colorClass = 'bg-blue-100 text-blue-800';
      break;
    case 'completed':
      colorClass = 'bg-green-100 text-green-800';
      break;
    case 'cancelled':
      colorClass = 'bg-red-100 text-red-800';
      break;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
};

export default Badge;
