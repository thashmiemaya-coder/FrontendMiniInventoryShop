import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, EyeOff, CheckCircle } from 'lucide-react';
import { stockService } from '../services/stockService';
import { supplierService } from '../services/supplierService';
import { itemService } from '../services/itemService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const StockInPage = () => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [stockInRecords, setStockInRecords] = useState([]);
  const [tableSearch, setTableSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    supplierId: '',
    stockInDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ===== API CALLS =====
  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAllSuppliers();
      setSuppliers(response?.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await itemService.getAllItems();
      setItems(response?.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchStockInRecords = async () => {
    try {
      const response = await stockService.getAllStockIns();
      setStockInRecords(response?.data || []);
    } catch (error) {
      console.error('Error fetching stock in records:', error);
    }
  };

  // ===== FETCH DATA ON LOAD =====
  useEffect(() => {
    fetchSuppliers();
    fetchItems();
    fetchStockInRecords();
  }, []);

  // ===== FILTER RECORDS FOR TABLE =====
  const filteredRecords = useMemo(() => {
    if (!tableSearch) return stockInRecords;
    return stockInRecords.filter(record =>
      record.itemName?.toLowerCase().includes(tableSearch.toLowerCase()) ||
      record.supplierName?.toLowerCase().includes(tableSearch.toLowerCase())
    );
  }, [tableSearch, stockInRecords]);

  // ===== FORM HANDLERS =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addItemToStock = (item) => {
    // Prevent duplicates
    if (stockItems.some(si => si.itemId === item.itemId)) {
      alert('Item already added!');
      return;
    }
    setStockItems([
      ...stockItems,
      {
        id: Date.now(),
        itemId: item.itemId,
        itemName: item.itemName,
        costPrice: item.costPrice || 0,
        quantity: 1,
        total: item.costPrice || 0,
      },
    ]);
  };

  const updateQuantity = (index, quantity) => {
    const updated = [...stockItems];
    updated[index].quantity = parseInt(quantity) || 0;
    updated[index].total = updated[index].quantity * updated[index].costPrice;
    setStockItems(updated);
  };

  const removeItem = (index) => {
    setStockItems(stockItems.filter((_, i) => i !== index));
  };

  // ===== SUBMIT FORM =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.supplierId) {
      alert('Please select a supplier');
      return;
    }
    if (stockItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      setLoading(true);
      for (const item of stockItems) {
        await stockService.addStockIn({
          itemId: item.itemId,
          supplierId: parseInt(formData.supplierId),
          quantity: item.quantity,
          costPrice: item.costPrice,
          stockInDate: formData.stockInDate,
        });
      }

      // Reset form
      setStockItems([]);
      setShowForm(false);
      setFormData({
        ...formData,
        supplierId: '',
        notes: '',
      });

      // Refresh the table
      await fetchStockInRecords();

      // Show success toast (NO browser alert)
      setSuccessMessage('✅ Stock In saved successfully!');

    } catch (error) {
      console.error('Error saving stock in:', error);
      alert('Error saving stock in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== CALCULATIONS =====
  const totalItems = stockItems.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = stockItems.reduce((sum, item) => sum + item.total, 0);

  // ===== LOADING =====
  if (loading) return <LoadingSpinner />;

  // ===== RENDER =====
  return (
    <div>
      {/* ===== SUCCESS TOAST ===== */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Stock In</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          {showForm ? (
            <>
              <EyeOff className="w-4 h-4" />
              Hide Form
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Stock In
            </>
          )}
        </button>
      </div>

      {/* ===== SEARCH BAR FOR HISTORY ===== */}
      <div className="mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search history..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            className="pl-4 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
      </div>

      {/* ===== STOCK IN FORM (TOGGLE) ===== */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Stock In</h2>
          <form onSubmit={handleSubmit}>
            {/* Supplier & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((sup) => (
                    <option key={sup.supplierId} value={sup.supplierId}>
                      {sup.supplierName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="stockInDate"
                  value={formData.stockInDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* ===== DROPDOWN FOR ITEMS ===== */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Item
              </label>
              <div className="flex gap-2">
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                  onChange={(e) => {
                    const itemId = parseInt(e.target.value);
                    if (itemId) {
                      const item = items.find(i => i.itemId === itemId);
                      if (item) addItemToStock(item);
                      e.target.value = ""; // Reset dropdown
                    }
                  }}
                >
                  <option value="">Select an item...</option>
                  {items.map((item) => (
                    <option key={item.itemId} value={item.itemId}>
                      {item.itemCode} - {item.itemName}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Select an item to add it to the list below
              </p>
            </div>

            {/* ===== CURRENT STOCK ITEMS TABLE ===== */}
            <div className="mt-6 overflow-x-auto">
              {stockItems.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">No items added yet</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stockItems.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm">{index + 1}</td>
                        <td className="px-4 py-2 text-sm">{item.itemName}</td>
                        <td className="px-4 py-2 text-sm">
                          <input
                            type="number"
                            value={item.costPrice}
                            onChange={(e) => {
                              const updated = [...stockItems];
                              updated[index].costPrice = parseFloat(e.target.value) || 0;
                              updated[index].total = updated[index].quantity * updated[index].costPrice;
                              setStockItems(updated);
                            }}
                            className="w-24 px-2 py-1 border border-gray-300 rounded"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(index, e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded"
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm">Rs. {item.total.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ===== TOTALS ===== */}
            <div className="mt-4 flex items-center justify-end gap-6">
              <div>
                <span className="text-sm text-gray-500">Total Items:</span>
                <span className="ml-2 font-bold">{totalItems}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Grand Total:</span>
                <span className="ml-2 font-bold text-green-600">Rs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* ===== NOTES ===== */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                placeholder="Enter notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ===== FORM BUTTONS ===== */}
            <div className="mt-6 flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Stock In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStockItems([]);
                  setShowForm(false);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== STOCK IN HISTORY TABLE ===== */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">Stock In History</h2>
            <span className="text-sm text-gray-500">{filteredRecords.length} records</span>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No stock in records found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              + Add your first stock in
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.slice(0, 10).map((record, index) => (
                  <tr key={record.stockInId || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-700">
                      {record.itemName || 'Unknown Item'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {record.supplierName || 'Unknown Supplier'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{record.quantity || 0}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      Rs. {(record.costPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-700">
                      Rs. {(record.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {record.stockInDate
                        ? new Date(record.stockInDate).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockInPage;