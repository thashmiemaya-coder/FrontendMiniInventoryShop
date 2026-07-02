import React, { useState, useEffect } from 'react';
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

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalItems: 245,
    totalCategories: 18,
    totalSuppliers: 42,
    lowStockItems: 12,
  });
  const [lowStockList, setLowStockList] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [items, categories, suppliers, lowStock] = await Promise.all([
        itemService.getAllItems(),
        categoryService.getAllCategories(),
        supplierService.getAllSuppliers(),
        stockService.getLowStockReport(),
      ]);

      setStats({
        totalItems: items?.data?.length || 245,
        totalCategories: categories?.data?.length || 18,
        totalSuppliers: suppliers?.data?.length || 42,
        lowStockItems: lowStock?.data?.length || 12,
      });
      setLowStockList(lowStock?.data || []);
      
      setRecentActivities([
        { action: 'Stock In', item: 'Fresh Tomatoes', quantity: 50, time: '2 hours ago' },
        { action: 'Stock Out', item: 'Whole Milk', quantity: 20, time: '4 hours ago' },
        { action: 'Stock In', item: 'Basmati Rice', quantity: 100, time: '6 hours ago' },
        { action: 'Stock Out', item: 'Sugar 1kg', quantity: 15, time: '8 hours ago' },
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Welcome Section - FreshMart Style */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back 🥰</h1>
            <p className="text-gray-500 mt-2 text-lg">Manage your grocery inventory efficiently with real-time stock tracking and supplier management.</p>
          </div>
          <div className="hidden md:block">
            <Store className="w-16 h-16 text-gray-200" />
          </div>
        </div>
      </div>

      {/* Quick Action Buttons - FreshMart Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow hover:border-blue-400">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
            <Plus className="w-7 h-7 text-blue-500" />
          </div>
          <span className="text-sm font-medium text-gray-700 mt-2 block">Add Item</span>
        </button>
        <button className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow hover:border-green-400">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <ShoppingCart className="w-7 h-7 text-green-500" />
          </div>
          <span className="text-sm font-medium text-gray-700 mt-2 block">Stock In</span>
        </button>
        <button className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow hover:border-orange-400">
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
            <Truck className="w-7 h-7 text-orange-500" />
          </div>
          <span className="text-sm font-medium text-gray-700 mt-2 block">Stock Out</span>
        </button>
        <button className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow hover:border-purple-400">
          <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7 text-purple-500" />
          </div>
          <span className="text-sm font-medium text-gray-700 mt-2 block">Reports</span>
        </button>
      </div>

      {/* Summary Cards - FreshMart Style */}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Overview Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-700">Stock Overview</h3>
            <span className="text-sm text-gray-400">Last 12 months</span>
          </div>
          <div className="h-52 flex items-end justify-between gap-2">
            {[65, 45, 75, 55, 80, 60, 90, 70, 85, 50, 95, 70].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div 
                  className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg transition-all hover:opacity-80 hover:scale-y-105 origin-bottom"
                  style={{ height: `${height}%`, minHeight: '20px' }}
                />
                <span className="text-xs text-gray-400 mt-2">
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Low Stock Items</h3>
            <span className="text-sm text-orange-500 font-medium">Critical</span>
          </div>
          {lowStockList.length === 0 ? (
            <p className="text-gray-500 text-sm">All items well stocked! 🎉</p>
          ) : (
            <div className="space-y-3">
              {lowStockList.slice(0, 4).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.itemName || 'White Rice 5kg'}</p>
                    <p className="text-xs text-gray-500">Stock: {item.currentBalance || 5}</p>
                  </div>
                  <span className="text-xs bg-orange-200 text-orange-700 px-3 py-1 rounded-full font-medium">Critical</span>
                </div>
              ))}
              {lowStockList.length === 0 && (
                <>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div>
                      <p className="text-sm font-medium text-gray-700">White Rice 5kg</p>
                      <p className="text-xs text-gray-500">Stock: 5</p>
                    </div>
                    <span className="text-xs bg-orange-200 text-orange-700 px-3 py-1 rounded-full font-medium">Critical</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Granulated Sugar</p>
                      <p className="text-xs text-gray-500">Stock: 12</p>
                    </div>
                    <span className="text-xs bg-orange-200 text-orange-700 px-3 py-1 rounded-full font-medium">Critical</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Recent Activities</h3>
          <span className="text-sm text-blue-500 cursor-pointer hover:text-blue-700 font-medium">View All</span>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;