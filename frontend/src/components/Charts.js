import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../utils/helpers';

// Sample data - trong thực tế sẽ lấy từ API
const monthlyData = [
  { month: 'Jan', amount: 1500000, subscriptions: 5 },
  { month: 'Feb', amount: 1650000, subscriptions: 6 },
  { month: 'Mar', amount: 1800000, subscriptions: 7 },
  { month: 'Apr', amount: 1700000, subscriptions: 6 },
  { month: 'May', amount: 1900000, subscriptions: 8 },
  { month: 'Jun', amount: 2100000, subscriptions: 9 },
];

const categoryData = [
  { name: 'Entertainment', value: 650000, color: '#8884d8' },
  { name: 'Software', value: 800000, color: '#82ca9d' },
  { name: 'Cloud Storage', value: 300000, color: '#ffc658' },
  { name: 'News & Media', value: 250000, color: '#ff7c7c' },
  { name: 'Others', value: 200000, color: '#8dd1e1' },
];

const costTrendData = [
  { month: 'Jan', total: 1500000, entertainment: 600000, software: 700000, others: 200000 },
  { month: 'Feb', total: 1650000, entertainment: 650000, software: 750000, others: 250000 },
  { month: 'Mar', total: 1800000, entertainment: 700000, software: 800000, others: 300000 },
  { month: 'Apr', total: 1700000, entertainment: 650000, software: 750000, others: 300000 },
  { month: 'May', total: 1900000, entertainment: 750000, software: 850000, others: 300000 },
  { month: 'Jun', total: 2100000, entertainment: 800000, software: 900000, others: 400000 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-gray-900 dark:text-white font-medium">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.dataKey}: ${typeof entry.value === 'number' ? formatCurrency(entry.value, 'VND') : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const MonthlySpendingChart = ({ data = monthlyData }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-200">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Monthly Spending Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }} 
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            className="text-gray-600 dark:text-gray-400"
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#3B82F6"
            fillOpacity={1}
            fill="url(#colorAmount)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryPieChart = ({ data = categoryData }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-200">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Spending by Category
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CostTrendChart = ({ data = costTrendData }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-200">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Cost Breakdown Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }} 
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            className="text-gray-600 dark:text-gray-400"
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#3B82F6" 
            strokeWidth={3}
            name="Total"
          />
          <Line 
            type="monotone" 
            dataKey="entertainment" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Entertainment"
          />
          <Line 
            type="monotone" 
            dataKey="software" 
            stroke="#F59E0B" 
            strokeWidth={2}
            name="Software"
          />
          <Line 
            type="monotone" 
            dataKey="others" 
            stroke="#EF4444" 
            strokeWidth={2}
            name="Others"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ComparisonChart = ({ currentMonth, previousMonth }) => {
  const comparisonData = [
    {
      category: 'Entertainment',
      current: currentMonth?.entertainment || 800000,
      previous: previousMonth?.entertainment || 750000
    },
    {
      category: 'Software',
      current: currentMonth?.software || 900000,
      previous: previousMonth?.software || 850000
    },
    {
      category: 'Cloud Storage',
      current: currentMonth?.cloudStorage || 300000,
      previous: previousMonth?.cloudStorage || 300000
    },
    {
      category: 'Others',
      current: currentMonth?.others || 400000,
      previous: previousMonth?.others || 300000
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-200">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Current vs Previous Month
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={comparisonData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            type="number" 
            tick={{ fontSize: 12 }} 
            className="text-gray-600 dark:text-gray-400"
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <YAxis 
            type="category" 
            dataKey="category" 
            tick={{ fontSize: 12 }} 
            className="text-gray-600 dark:text-gray-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="current" 
            stroke="#3B82F6" 
            strokeWidth={3}
            name="Current Month"
          />
          <Line 
            type="monotone" 
            dataKey="previous" 
            stroke="#6B7280" 
            strokeWidth={2}
            name="Previous Month"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
