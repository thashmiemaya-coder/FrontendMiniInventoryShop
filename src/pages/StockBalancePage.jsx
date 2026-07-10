import { useState, useEffect, useMemo } from 'react';
import { Search, FileDown, Printer } from 'lucide-react';
import { stockService } from '../services/stockService';
import { categoryService } from '../services/categoryService';
import { supplierService } from '../services/supplierService';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StockBalancePage = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const fetchFilters = async () => {
    try {
      const [catRes, supRes] = await Promise.all([
        categoryService.getAllCategories(),
        supplierService.getAllSuppliers(),
      ]);
      setCategories(catRes?.data || []);
      setSuppliers(supRes?.data || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchStockBalance = async () => {
    try {
      setLoading(true);
      const response = await stockService.getStockBalance();
      setStockData(response?.data || []);
    } catch (error) {
      console.error('Error fetching stock balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
    fetchStockBalance();
  }, []);

  const filteredData = useMemo(() => {
    let data = [...stockData];

    if (searchTerm) {
      data = data.filter(item =>
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      data = data.filter(item => item.categoryId === parseInt(selectedCategory));
    }

    if (selectedSupplier) {
      data = data.filter(item => item.supplierId === parseInt(selectedSupplier));
    }

    return data;
  }, [stockData, searchTerm, selectedCategory, selectedSupplier]);

  const totals = filteredData.reduce(
    (acc, item) => {
      acc.totalIn += item.totalStockIn || 0;
      acc.totalOut += item.totalStockOut || 0;
      acc.balance += item.currentBalance || 0;
      return acc;
    },
    { totalIn: 0, totalOut: 0, balance: 0 }
  );

  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      alert('No data to export!');
      return;
    }

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.text('Stock Balance Report', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(100);
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      let subtitle = `Generated on: ${today}`;
      if (selectedCategory) {
        const cat = categories.find(c => c.categoryId === parseInt(selectedCategory));
        if (cat) subtitle += ` | Category: ${cat.categoryName}`;
      }
      if (selectedSupplier) {
        const sup = suppliers.find(s => s.supplierId === parseInt(selectedSupplier));
        if (sup) subtitle += ` | Supplier: ${sup.supplierName}`;
      }
      doc.text(subtitle, pageWidth / 2, 28, { align: 'center' });

      const tableColumn = [
        'Item Code',
        'Item Name',
        'Category',
        'Total In',
        'Total Out',
        'Balance',
        'Reorder Level',
        'Status',
      ];

      const tableRows = filteredData.map(item => [
        item.itemCode || '-',
        item.itemName || '-',
        item.categoryName || '-',
        item.totalStockIn || 0,
        item.totalStockOut || 0,
        item.currentBalance || 0,
        item.reorderLevel || 0,
        item.stockStatus || 'Good Stock',
      ]);

      if (filteredData.length > 0) {
        tableRows.push([
          '',
          'TOTAL',
          '',
          totals.totalIn,
          totals.totalOut,
          totals.balance,
          '',
          '',
        ]);
      }

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

      doc.save('StockBalanceReport.pdf');
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="stock-balance-page">
      {/* Header - Title always visible, buttons hidden on print */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stock Balance Report</h1>
          <p className="text-gray-500 text-sm mt-1">View and export current stock status</p>
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

      {/* Filters - hidden on print */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Item Code or Name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.categoryName}
            </option>
          ))}
        </select>

        <select
          value={selectedSupplier}
          onChange={(e) => {
            setSelectedSupplier(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Suppliers</option>
          {suppliers.map(sup => (
            <option key={sup.supplierId} value={sup.supplierId}>
              {sup.supplierName}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('');
            setSelectedSupplier('');
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Summary Cards - hidden on print */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 print:hidden">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-xl font-bold">{filteredData.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Total Stock In</p>
          <p className="text-xl font-bold">{totals.totalIn}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <p className="text-sm text-gray-500">Total Stock Out</p>
          <p className="text-xl font-bold">{totals.totalOut}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="text-xl font-bold">{totals.balance}</p>
        </div>
      </div>

      {/* Table - always visible, will be the main content on print */}
      <div className="bg-white rounded-lg shadow-sm mt-6 overflow-hidden">
        {currentItems.length === 0 ? (
          <EmptyState message="No stock data found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item, index) => (
                  <tr key={item.itemId || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium">{item.itemCode || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.itemName || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.categoryName || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.totalStockIn || 0}</td>
                    <td className="px-4 py-3 text-sm">{item.totalStockOut || 0}</td>
                    <td className="px-4 py-3 text-sm font-bold">{item.currentBalance || 0}</td>
                    <td className="px-4 py-3 text-sm">{item.reorderLevel || 0}</td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={item.stockStatus || 'Good Stock'} />
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="px-4 py-3 text-sm" colSpan="3">TOTAL</td>
                  <td className="px-4 py-3 text-sm"></td>
                  <td className="px-4 py-3 text-sm">{totals.totalIn}</td>
                  <td className="px-4 py-3 text-sm">{totals.totalOut}</td>
                  <td className="px-4 py-3 text-sm">{totals.balance}</td>
                  <td className="px-4 py-3 text-sm" colSpan="2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination - hidden on print */}
      <div className="print:hidden">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Hide everything on the page */
          body * {
            visibility: hidden !important;
          }
          /* Show only the main container and its children */
          .stock-balance-page, 
          .stock-balance-page * {
            visibility: visible !important;
          }
          .stock-balance-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
          }
          /* Hide the buttons and other UI elements inside the container */
          .stock-balance-page .print\\:hidden {
            display: none !important;
          }
          /* Improve table readability */
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
          .bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
          /* Keep the title visible */
          h1 {
            visibility: visible !important;
          }
          .text-gray-500 {
            visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StockBalancePage;