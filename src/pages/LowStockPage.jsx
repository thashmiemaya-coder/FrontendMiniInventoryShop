import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Package, FileDown, Printer, ShoppingCart } from 'lucide-react';
import { stockService } from '../services/stockService';
import { itemService } from '../services/itemService';
import { supplierService } from '../services/supplierService';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LowStockPage = () => {
  const navigate = useNavigate();
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchLowStockItems();
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAllSuppliers();
      setSuppliers(response?.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      const response = await stockService.getLowStockReport();
      // Ensure we have a list of items with low stock or out of stock
      const items = response?.data || [];
      // Enhance with supplier name if missing
      const enhanced = items.map(item => ({
        ...item,
        supplierName: item.supplierName || 
          suppliers.find(s => s.supplierId === item.supplierId)?.supplierName || 'Unknown'
      }));
      setLowStockItems(enhanced);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== PDF EXPORT =====
  const handleExportPDF = () => {
    if (lowStockItems.length === 0) {
      alert('No low stock items to export!');
      return;
    }

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.text('Low Stock Report', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(100);
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.text(`Generated on: ${today}`, pageWidth / 2, 28, { align: 'center' });

      // Table columns
      const tableColumn = [
        'Item Name',
        'Category',
        'Current Stock',
        'Reorder Level',
        'Supplier',
        'Status',
      ];

      const tableRows = lowStockItems.map(item => [
        item.itemName || '-',
        item.categoryName || '-',
        item.currentBalance || 0,
        item.reorderLevel || 0,
        item.supplierName || 'Unknown',
        item.stockStatus || 'Low Stock',
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 9 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 35 },
        didDrawPage: function (data) {
          const pageCount = doc.internal.getNumberOfPages();
          const pageNumber = data.pageNumber;
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Page ${pageNumber} of ${pageCount} - Grocery Inventory System`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
        },
      });

      doc.save('LowStockReport.pdf');
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  // ===== PRINT =====
  const handlePrint = () => {
    window.print();
  };

  // ===== RESTOCK ACTION =====
  const handleRestock = (itemId, itemName) => {
    // Navigate to Stock In with item pre‑selected (via state)
    navigate('/stock/in', { state: { preselectedItemId: itemId, preselectedItemName: itemName } });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="low-stock-page">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-2">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Low Stock Report</h1>
            <p className="text-gray-500 text-sm">Items that need reordering</p>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm mt-6 overflow-hidden">
        {lowStockItems.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">All Items Well Stocked!</h3>
            <p className="text-gray-500">No items are currently below reorder level.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lowStockItems.map((item, index) => (
                  <tr key={item.itemId || index} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-700">{item.itemName || 'Unknown'}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{item.categoryName || '-'}</td>
                    <td className="px-6 py-3 text-sm font-bold text-orange-600">{item.currentBalance || 0}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{item.reorderLevel || 0}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{item.supplierName || 'Unknown'}</td>
                    <td className="px-6 py-3 text-sm">
                      <StatusBadge status={item.stockStatus || 'Low Stock'} />
                    </td>
                    <td className="px-6 py-3 text-sm print:hidden">
                      <button
                        onClick={() => handleRestock(item.itemId, item.itemName)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .low-stock-page,
          .low-stock-page * {
            visibility: visible !important;
          }
          .low-stock-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
          }
          .low-stock-page .print\\:hidden {
            display: none !important;
          }
          table {
            font-size: 12px;
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            padding: 6px 8px;
            border: 1px solid #ddd;
          }
          th {
            background-color: #f3f4f6 !important;
            font-weight: bold;
          }
        }
      `}</style>
    </div>
  );
};

export default LowStockPage;