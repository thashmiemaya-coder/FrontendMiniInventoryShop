import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, ShoppingCart, Truck, AlertTriangle, 
  TrendingUp, TrendingDown, Tag,
  Plus, FileText, Box, ArrowRight, 
  BarChart3, Clock, Users, Store
} from 'lucide-react';
import { itemService } from '../services/itemService';
import { categoryService } from '../services/categoryService';
import { supplierService } from '../services/supplierService';
import { stockService } from '../services/stockService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Sidebar from '../components/common/Layout/Sidebar'; // ✅ Sidebar imported

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    totalSuppliers: 0,
    lowStockItems: 0,
  });
  const [lowStockList, setLowStockList] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0, net: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [items, categories, suppliers, lowStock, stockBalance, allStockIns, allStockOuts] = await Promise.all([
        itemService.getAllItems(),
        categoryService.getAllCategories(),
        supplierService.getAllSuppliers(),
        stockService.getLowStockReport(),
        stockService.getStockBalance(),
        stockService.getAllStockIns(),
        stockService.getAllStockOuts(),
      ]);

      setStats({
        totalItems: items?.data?.length || 0,
        totalCategories: categories?.data?.length || 0,
        totalSuppliers: suppliers?.data?.length || 0,
        lowStockItems: lowStock?.data?.length || 0,
      });
      setLowStockList(lowStock?.data || []);

      // Process chart data
      const now = new Date();
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        last7Days.push({ date: dateStr, day: d.toLocaleDateString('en', { weekday: 'short' }) });
      }

      const stockInData = allStockIns?.data || [];
      const stockOutData = allStockOuts?.data || [];

      const inByDate = {};
      const outByDate = {};
      
      stockInData.forEach(item => {
        let dateKey = null;
        if (item.stockInDate) {
          const d = new Date(item.stockInDate);
          if (!isNaN(d)) {
            dateKey = d.toISOString().split('T')[0];
          }
        }
        if (dateKey) {
          inByDate[dateKey] = (inByDate[dateKey] || 0) + (item.quantity || 0);
        }
      });

      stockOutData.forEach(item => {
        let dateKey = null;
        if (item.stockOutDate) {
          const d = new Date(item.stockOutDate);
          if (!isNaN(d)) {
            dateKey = d.toISOString().split('T')[0];
          }
        }
        if (dateKey) {
          outByDate[dateKey] = (outByDate[dateKey] || 0) + (item.quantity || 0);
        }
      });

      const chartData = last7Days.map(({ date, day }) => ({
        day,
        inQty: inByDate[date] || 0,
        outQty: outByDate[date] || 0,
        net: (inByDate[date] || 0) - (outByDate[date] || 0)
      }));

      setChartData(chartData);

      const totalIn = chartData.reduce((sum, d) => sum + d.inQty, 0);
      const totalOut = chartData.reduce((sum, d) => sum + d.outQty, 0);
      const net = totalIn - totalOut;
      setSummary({ totalIn, totalOut, net });

      // Recent activities
      const activities = [];
      if (allStockIns?.data) {
        allStockIns.data.slice(0, 3).forEach(item => {
          activities.push({
            action: 'Stock In',
            item: item.itemName || 'Unknown Item',
            quantity: item.quantity || 0,
            time: item.stockInDate ? new Date(item.stockInDate).toLocaleDateString() : 'Today'
          });
        });
      }
      if (allStockOuts?.data) {
        allStockOuts.data.slice(0, 2).forEach(item => {
          activities.push({
            action: 'Stock Out',
            item: item.itemName || 'Unknown Item',
            quantity: item.quantity || 0,
            time: item.stockOutDate ? new Date(item.stockOutDate).toLocaleDateString() : 'Today'
          });
        });
      }
      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ✅ Sidebar rendered here */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Welcome Back 🎉</h1>
                  <p className="text-gray-500 mt-2 text-lg">Manage your grocery inventory efficiently with real-time stock tracking and supplier management.</p>
                </div>
                <div className="hidden md:block">
                  <Store className="w-16 h-16 text-gray-200" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => handleNavigate('/items/add')}
                className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow hover:border-green-400"
              >
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-7 h-7 text-green-500" />
                </div>
                <span className="text-sm font-medium text-gray-700 mt-2 block">Add Item</span>
              </button>
              <button 
                onClick={() => handleNavigate('/stock/in')}
                className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow hover:border-green-400"
              >
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingCart className="w-7 h-7 text-green-500" />
                </div>
                <span className="text-sm font-medium text-gray-700 mt-2 block">Stock In</span>
              </button>
              <button 
                onClick={() => handleNavigate('/stock/out')}
                className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow hover:border-orange-400"
              >
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="w-7 h-7 text-orange-500" />
                </div>
                <span className="text-sm font-medium text-gray-700 mt-2 block">Stock Out</span>
              </button>
              <button 
                onClick={() => handleNavigate('/reports/stock-balance')}
                className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow hover:border-purple-400"
              >
                <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7 text-purple-500" />
                </div>
                <span className="text-sm font-medium text-gray-700 mt-2 block">Reports</span>
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalItems}</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs text-green-500">▲ 12%</span>
                  <span className="text-xs text-gray-400">vs last month</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalCategories}</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs text-green-500">▲ 5%</span>
                  <span className="text-xs text-gray-400">vs last month</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-500">Suppliers</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalSuppliers}</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs text-green-500">▲ 8%</span>
                  <span className="text-xs text-gray-400">vs last month</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.lowStockItems}</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs text-orange-500">⚠️ Need reorder</span>
                </div>
              </div>
            </div>

            {/* Stock Overview Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Stock Overview
                  </h3>
                  <p className="text-xs text-gray-400">Last 7 days • Total stock movement</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    Stock In
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    Stock Out
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                    Net Balance
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3 text-center border border-green-200">
                  <p className="text-xs text-green-600 font-medium">📥 Stock In</p>
                  <p className="text-xl font-bold text-green-700">{summary.totalIn}</p>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-3 text-center border border-red-200">
                  <p className="text-xs text-red-600 font-medium">📤 Stock Out</p>
                  <p className="text-xl font-bold text-red-600">{summary.totalOut}</p>
                </div>
                <div className={`bg-gradient-to-r ${summary.net >= 0 ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'} rounded-xl p-3 text-center border`}>
                  <p className="text-xs font-medium text-gray-600">📊 Net Change</p>
                  <p className={`text-xl font-bold ${summary.net >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {summary.net >= 0 ? '+' : ''}{summary.net}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="h-64 flex items-end justify-between gap-2">
                  {chartData.map((day, i) => {
                    const maxVal = Math.max(
                      ...chartData.map(d => Math.max(d.inQty, d.outQty)),
                      1
                    );
                    const inHeight = maxVal > 0 ? (day.inQty / maxVal) * 100 : 0;
                    const outHeight = maxVal > 0 ? (day.outQty / maxVal) * 100 : 0;
                    const isPositive = day.net >= 0;

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div className="relative w-full flex flex-col items-center" style={{ height: '90%' }}>
                          <div className="flex items-end justify-center gap-1 w-full h-full">
                            <div 
                              className="w-1/3 bg-gradient-to-t from-green-400 via-green-500 to-green-600 rounded-t-lg transition-all duration-300 group-hover:scale-y-105 origin-bottom shadow-md"
                              style={{ height: `${Math.max(inHeight, 4)}%`, minHeight: '8px' }}
                            />
                            <div 
                              className="w-1/3 bg-gradient-to-t from-red-300 via-red-400 to-red-500 rounded-t-lg transition-all duration-300 group-hover:scale-y-105 origin-bottom shadow-md"
                              style={{ height: `${Math.max(outHeight, 4)}%`, minHeight: '8px' }}
                            />
                            <div 
                              className={`absolute -top-2 w-3 h-3 rounded-full transition-all duration-300 ${
                                isPositive ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-gray-400 shadow-lg shadow-gray-200'
                              } ${day.net !== 0 ? 'opacity-100' : 'opacity-30'}`}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-500 mt-3">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute bottom-8 left-0 right-0 border-t-2 border-dotted border-gray-200 opacity-50"></div>
              </div>

              <div className="mt-4 flex justify-center gap-6 text-xs text-gray-400">
                <span>📈 Total In: <span className="font-bold text-green-600">{summary.totalIn}</span></span>
                <span>📉 Total Out: <span className="font-bold text-red-500">{summary.totalOut}</span></span>
                <span>⚖️ Balance: <span className={`font-bold ${summary.net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {summary.net >= 0 ? '+' : ''}{summary.net}
                </span></span>
              </div>
            </div>

            {/* Low Stock & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">Low Stock Items</h3>
                  <button 
                    onClick={() => handleNavigate('/reports/low-stock')}
                    className="text-sm text-blue-500 hover:text-blue-700 font-medium"
                  >
                    View All →
                  </button>
                </div>
                {lowStockList.length === 0 ? (
                  <p className="text-gray-500 text-sm">All items well stocked! 🎉</p>
                ) : (
                  <div className="space-y-3">
                    {lowStockList.slice(0, 4).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{item.itemName || 'Unknown Item'}</p>
                          <p className="text-xs text-gray-500">Stock: {item.currentBalance || 0}</p>
                        </div>
                        <span className="text-xs bg-orange-200 text-orange-700 px-3 py-1 rounded-full font-medium">Critical</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">Recent Activities</h3>
                  <button 
                    onClick={() => handleNavigate('/reports/stock-balance')}
                    className="text-sm text-blue-500 hover:text-blue-700 font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {recentActivities.length === 0 ? (
                    <p className="text-gray-500 text-sm">No recent activities</p>
                  ) : (
                    recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${activity.action === 'Stock In' ? 'bg-green-100' : 'bg-orange-100'}`}>
                            {activity.action === 'Stock In' ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {activity.action}: {activity.quantity}x {activity.item}
                            </p>
                            <p className="text-xs text-gray-400">{activity.time}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
