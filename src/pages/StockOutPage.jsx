import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, EyeOff, CheckCircle } from 'lucide-react';
import { stockService } from '../services/stockService';
import { itemService } from '../services/itemService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const StockOutPage = () => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [stockOutRecords, setStockOutRecords] = useState([]);
  const [tableSearch, setTableSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    stockOutDate: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
  });

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchItems = async () => {
    try {
      const response = await itemService.getAllItems();
      setItems(response?.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchStockOutRecords = async () => {
    try {
      const response = await stockService.getAllStockOuts();
      setStockOutRecords(response?.data || []);
    } catch (error) {
      console.error('Error fetching stock out records:', error);
    }
  };

  // ===== FETCH DATA =====
  useEffect(() => {
    fetchItems();
    fetchStockOutRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    if (!tableSearch) return stockOutRecords;
    return stockOutRecords.filter(record =>
      record.itemName?.toLowerCase().includes(tableSearch.toLowerCase()) ||
      record.reason?.toLowerCase().includes(tableSearch.toLowerCase())
    );
  }, [tableSearch, stockOutRecords]);

  // ===== FORM HANDLERS =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ===== ADD ITEM WITH AVAILABLE STOCK CHECK =====
  const addItemToStock = (item) => {
    const availableStock = item.currentStock || 0;

    if (availableStock <= 0) {
      alert(`This item (${item.itemName}) is out of stock!`);
      return;
    }

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
        availableStock: availableStock,
        quantity: 1,
        unitPrice: item.sellingPrice || 0,
        total: item.sellingPrice || 0,
      },
    ]);
  };

  const updateQuantity = (index, quantity) => {
    const updated = [...stockItems];
    const newQty = parseInt(quantity) || 0;
    if (newQty > updated[index].availableStock) {
      alert(`Only ${updated[index].availableStock} items available!`);
      return;
    }
    updated[index].quantity = newQty;
    updated[index].total = newQty * updated[index].unitPrice;
    setStockItems(updated);
  };

  const removeItem = (index) => {
    setStockItems(stockItems.filter((_, i) => i !== index));
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reason) {
      alert('Please select a reason for stock out');
      return;
    }
    if (stockItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    for (const item of stockItems) {
      if (item.quantity > item.availableStock) {
        alert(`Insufficient stock for ${item.itemName}. Available: ${item.availableStock}`);
        return;
      }
    }

    try {
      setLoading(true);
      for (const item of stockItems) {
        await stockService.addStockOut({
          itemId: item.itemId,
          quantity: item.quantity,
          reason: formData.reason,
          stockOutDate: formData.stockOutDate,
        });
      }

      setStockItems([]);
      setShowForm(false);
      setFormData({
        ...formData,
        reason: '',
        notes: '',
      });

      await fetchStockOutRecords();
      setSuccessMessage('✅ Stock Out saved successfully!');

    } catch (error) {
      console.error('Error saving stock out:', error);
      alert(error.message || 'Error saving stock out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalItems = stockItems.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = stockItems.reduce((sum, item) => sum + item.total, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Success Toast */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Stock Out</h1>
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
              Add Stock Out
            </>
          )}
        </button>
      </div>

      {/* Search Bar */}
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

      {/* Stock Out Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Stock Out</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="stockOutDate"
                  value={formData.stockOutDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Reason</option>
                  <option value="Sale">Sale</option>
                  <option value="Damage">Damage</option>
                  <option value="Internal Use">Internal Use</option>
                  <option value="Return to Supplier">Return to Supplier</option>
                  <option value="Expired">Expired</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Item Dropdown */}
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
                      {item.itemCode} - {item.itemName} (Stock: {item.currentStock || 0})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Select an item to add it to the list below. Only items with stock &gt; 0 can be added.
              </p>
            </div>

            {/* Added Items Table */}
            <div className="mt-6 overflow-x-auto">
              {stockItems.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">No items added yet</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
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
                        <td className="px-4 py-2 text-sm font-bold text-blue-600">{item.availableStock}</td>
                        <td className="px-4 py-2 text-sm">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const updated = [...stockItems];
                              updated[index].unitPrice = parseFloat(e.target.value) || 0;
                              updated[index].total = updated[index].quantity * updated[index].unitPrice;
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
                            max={item.availableStock}
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

            {/* Totals */}
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

            {/* Notes */}
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

            {/* Buttons */}
            <div className="mt-6 flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Stock Out'}
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

      {/* Stock Out History Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">Stock Out History</h2>
            <span className="text-sm text-gray-500">{filteredRecords.length} records</span>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No stock out records found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              + Add your first stock out
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.slice(0, 10).map((record, index) => (
                  <tr key={record.stockOutId || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-700">
                      {record.itemName || 'Unknown Item'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{record.quantity || 0}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {record.reason || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {record.stockOutDate
                        ? new Date(record.stockOutDate).toLocaleDateString()
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

export default StockOutPage;