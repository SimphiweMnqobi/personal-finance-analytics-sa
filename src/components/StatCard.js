import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, change, isPositive, trend }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
        {change && (
          <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend && (isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />)}
            <span className="ml-1 text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
      <div className="ml-4">
        <Icon className="h-8 w-8 text-blue-500" />
      </div>
    </div>
  </div>
);

export default StatCard;