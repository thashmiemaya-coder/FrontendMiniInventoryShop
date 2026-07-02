import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Search } from 'lucide-react';
import { stockService } from '../services/stockService';
import { supplierService } from '../services/supplierService';
import { itemService } from '../services/itemService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const StockInPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    stockInDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchSuppliers();
    fetchItems();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(item =>
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  }, [searchTerm, items]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addItemToStock = (item) => {
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
    setSearchTerm('');
    setFilteredItems([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      navigate('/items');
    } catch (error) {
      console.error('Error saving stock in:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = stockItems.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = stockItems.reduce((sum, item) => sum + item.total, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Stock In</h1>
      <p className="text-gray-500 text-sm mt-1">Record incoming stock from suppliers</p>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Items
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search item by Code, Barcode or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                />
              </div>
            </div>

            {filteredItems.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                {filteredItems.map((item) => (
                  <div
                    key={item.itemId}
                    onClick={() => addItemToStock(item)}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-medium">{item.itemCode}</span> - {item.itemName}
                  </div>
                ))}
              </div>
            )}
          </div>

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

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="Enter notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

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
              onClick={() => navigate('/items')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StockInPage;