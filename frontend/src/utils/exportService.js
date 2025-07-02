import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from './helpers';

// Export Subscriptions to PDF
export const exportSubscriptionsToPDF = (subscriptions, userInfo, stats) => {
  try {
    console.log('Starting PDF export with data:', { subscriptions, userInfo, stats });
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Subscription Management Report', 20, 20);
    
    // User Info
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated for: ${userInfo?.fullName || 'User'}`, 20, 35);
    doc.text(`Email: ${userInfo?.email || 'N/A'}`, 20, 45);
    doc.text(`Report Date: ${new Date().toLocaleDateString('vi-VN')}`, 20, 55);
    
    // Summary Statistics
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Summary Statistics', 20, 75);
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Subscriptions: ${stats?.total || 0}`, 20, 90);
    doc.text(`Active Subscriptions: ${stats?.active || 0}`, 20, 100);
    doc.text(`Expired Subscriptions: ${stats?.expired || 0}`, 20, 110);
    doc.text(`Monthly Total Cost: ${formatCurrency(stats?.totalAmount || 0, 'VND')}`, 20, 120);
    
    // Subscriptions Table
    if (subscriptions && subscriptions.length > 0) {
      const tableData = subscriptions.map(sub => [
        sub.serviceName || 'N/A',
        sub.description || 'N/A',
        formatCurrency(sub.cost || 0, sub.currency || 'VND'),
        sub.billingCycle === 'monthly' ? 'Monthly' : 
        sub.billingCycle === 'yearly' ? 'Yearly' : 
        sub.billingCycle === 'weekly' ? 'Weekly' : sub.billingCycle || 'N/A',
        formatDate(sub.startDate) || 'N/A',
        formatDate(sub.nextPaymentDate) || 'N/A',
        sub.isActive ? 'Active' : 'Inactive'
      ]);
      
      console.log('Table data prepared:', tableData);
      
      doc.autoTable({
        head: [['Service', 'Description', 'Cost', 'Billing Cycle', 'Start Date', 'Next Payment', 'Status']],
        body: tableData,
        startY: 140,
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
      });
    } else {
      // No subscriptions message
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('No subscriptions found.', 20, 150);
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 50,
        doc.internal.pageSize.getHeight() - 10
      );
    }
    
    // Save PDF
    const fileName = `subscriptions-report-${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('Saving PDF as:', fileName);
    doc.save(fileName);
    console.log('PDF saved successfully');
    
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error(`PDF export failed: ${error.message}`);
  }
};

// Export Subscriptions to Excel
export const exportSubscriptionsToExcel = (subscriptions, userInfo, stats) => {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Summary Sheet
  const summaryData = [
    ['Report Information', ''],
    ['Generated for', userInfo?.fullName || 'User'],
    ['Email', userInfo?.email || 'N/A'],
    ['Report Date', new Date().toLocaleDateString('vi-VN')],
    ['', ''],
    ['Summary Statistics', ''],
    ['Total Subscriptions', stats.total],
    ['Active Subscriptions', stats.active],
    ['Expired Subscriptions', stats.expired],
    ['Monthly Total Cost (VND)', stats.totalAmount],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Style summary sheet
  summarySheet['!cols'] = [{ width: 25 }, { width: 20 }];
  
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
  
  // Subscriptions Sheet
  const subscriptionsData = [
    ['Service Name', 'Description', 'Cost', 'Currency', 'Billing Cycle', 'Start Date', 'Next Payment', 'Status', 'Active'],
    ...subscriptions.map(sub => [
      sub.serviceName,
      sub.description || '',
      sub.cost,
      sub.currency,
      sub.billingCycle,
      formatDate(sub.startDate),
      formatDate(sub.nextPaymentDate),
      sub.isActive ? 'Active' : 'Inactive',
      sub.isActive
    ])
  ];
  
  const subscriptionsSheet = XLSX.utils.aoa_to_sheet(subscriptionsData);
  
  // Auto-width columns
  subscriptionsSheet['!cols'] = [
    { width: 20 }, // Service Name
    { width: 30 }, // Description
    { width: 15 }, // Cost
    { width: 10 }, // Currency
    { width: 15 }, // Billing Cycle
    { width: 15 }, // Start Date
    { width: 15 }, // Next Payment
    { width: 10 }, // Status
    { width: 10 }, // Active
  ];
  
  XLSX.utils.book_append_sheet(wb, subscriptionsSheet, 'Subscriptions');
  
  // Monthly Analysis Sheet (sample data)
  const monthlyAnalysisData = [
    ['Month', 'Total Amount', 'Number of Subscriptions'],
    ['January', 1500000, 5],
    ['February', 1650000, 6],
    ['March', 1800000, 7],
    ['April', 1700000, 6],
    ['May', 1900000, 8],
    ['June', 2100000, 9],
  ];
  
  const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyAnalysisData);
  monthlySheet['!cols'] = [{ width: 15 }, { width: 20 }, { width: 25 }];
  
  XLSX.utils.book_append_sheet(wb, monthlySheet, 'Monthly Analysis');
  
  // Save Excel file
  const fileName = `subscriptions-report-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

// Export Chart Data to Excel
export const exportChartDataToExcel = (chartData) => {
  const wb = XLSX.utils.book_new();
  
  // Monthly Spending Data
  if (chartData.monthlyData) {
    const monthlySheet = XLSX.utils.json_to_sheet(chartData.monthlyData);
    XLSX.utils.book_append_sheet(wb, monthlySheet, 'Monthly Spending');
  }
  
  // Category Data
  if (chartData.categoryData) {
    const categorySheet = XLSX.utils.json_to_sheet(chartData.categoryData);
    XLSX.utils.book_append_sheet(wb, categorySheet, 'Category Breakdown');
  }
  
  // Cost Trend Data
  if (chartData.costTrendData) {
    const trendSheet = XLSX.utils.json_to_sheet(chartData.costTrendData);
    XLSX.utils.book_append_sheet(wb, trendSheet, 'Cost Trends');
  }
  
  const fileName = `chart-data-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

// Generate and download a comprehensive financial report (PDF)
export const exportFinancialReportPDF = (subscriptions, userInfo, stats, chartData) => {
  const doc = new jsPDF();
  
  // Title Page
  doc.setFontSize(24);
  doc.setTextColor(40, 40, 40);
  doc.text('Financial Report', 20, 30);
  doc.text('Subscription Management', 20, 45);
  
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated for: ${userInfo?.fullName || 'User'}`, 20, 70);
  doc.text(`Report Period: ${new Date().getFullYear()}`, 20, 85);
  doc.text(`Generated on: ${new Date().toLocaleDateString('vi-VN')}`, 20, 100);
  
  // Executive Summary
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text('Executive Summary', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  const summaryText = [
    `This report provides a comprehensive overview of your subscription management for ${new Date().getFullYear()}.`,
    '',
    `Key Highlights:`,
    `• Total active subscriptions: ${stats.active}`,
    `• Monthly spending: ${formatCurrency(stats.totalAmount, 'VND')}`,
    `• Annual projected cost: ${formatCurrency(stats.totalAmount * 12, 'VND')}`,
    `• Average cost per subscription: ${formatCurrency(stats.totalAmount / stats.total, 'VND')}`,
    '',
    `Recommendations:`,
    `• Review unused subscriptions quarterly`,
    `• Consider annual billing for discounts`,
    `• Set up spending alerts for better control`,
  ];
  
  let yPosition = 50;
  summaryText.forEach(line => {
    doc.text(line, 20, yPosition);
    yPosition += 8;
  });
  
  // Detailed Subscriptions
  doc.addPage();
  doc.setFontSize(18);
  doc.text('Detailed Subscription List', 20, 30);
  
  const detailedTableData = subscriptions.map(sub => [
    sub.serviceName,
    formatCurrency(sub.cost, sub.currency),
    sub.billingCycle,
    formatDate(sub.nextPaymentDate),
    sub.isActive ? 'Active' : 'Inactive'
  ]);
  
  doc.autoTable({
    head: [['Service', 'Cost', 'Billing', 'Next Payment', 'Status']],
    body: detailedTableData,
    startY: 50,
    styles: { fontSize: 11 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  const fileName = `financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
