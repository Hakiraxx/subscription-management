import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, PieChart, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  exportSubscriptionsToPDF,
  exportSubscriptionsToExcel,
  exportChartDataToExcel,
  exportFinancialReportPDF
} from '../utils/exportService';

const ExportDropdown = ({ subscriptions, stats, chartData = null }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (exportType) => {
    setIsExporting(true);
    try {
      console.log('Exporting:', exportType, { subscriptions, user, stats });
      
      switch (exportType) {
        case 'pdf-basic':
          console.log('Starting PDF export...');
          exportSubscriptionsToPDF(subscriptions, user, stats);
          console.log('PDF export completed');
          break;
        case 'excel-basic':
          console.log('Starting Excel export...');
          exportSubscriptionsToExcel(subscriptions, user, stats);
          console.log('Excel export completed');
          break;
        case 'excel-charts':
          if (chartData) {
            console.log('Starting Chart Excel export...');
            exportChartDataToExcel(chartData);
            console.log('Chart Excel export completed');
          } else {
            console.warn('No chart data available for export');
          }
          break;
        case 'pdf-financial':
          console.log('Starting Financial PDF export...');
          exportFinancialReportPDF(subscriptions, user, stats, chartData);
          console.log('Financial PDF export completed');
          break;
        default:
          console.warn('Unknown export type:', exportType);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
      >
        <Download className="w-4 h-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="py-2">
            <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              Export Options
            </div>
            
            {/* PDF Options */}
            <button
              onClick={() => handleExport('pdf-basic')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <FileText className="w-4 h-4 mr-3 text-red-500" />
              Basic PDF Report
            </button>
            
            <button
              onClick={() => handleExport('pdf-financial')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <TrendingUp className="w-4 h-4 mr-3 text-blue-500" />
              Financial PDF Report
            </button>
            
            {/* Excel Options */}
            <button
              onClick={() => handleExport('excel-basic')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <FileSpreadsheet className="w-4 h-4 mr-3 text-green-500" />
              Excel Spreadsheet
            </button>
            
            {/* Only show chart data export if chartData exists */}
            {chartData && (
              <button
                onClick={() => handleExport('excel-charts')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <PieChart className="w-4 h-4 mr-3 text-purple-500" />
                Chart Data Excel
              </button>
            )}
          </div>
          
          <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            Files will be downloaded automatically
          </div>
        </div>
      )}
      
      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ExportDropdown;
