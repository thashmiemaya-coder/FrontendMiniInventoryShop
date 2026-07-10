import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout/Layout';
import DashboardPage from './pages/DashboardPage';
import ItemListPage from './pages/ItemListPage';
import ItemFormPage from './pages/ItemFormPage';
import StockInPage from './pages/StockInPage';
import StockOutPage from './pages/StockOutPage';
import StockBalancePage from './pages/StockBalancePage';
import LowStockPage from './pages/LowStockPage';
import CategoryPage from './pages/CategoryPage';
import SupplierPage from './pages/SupplierPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="items" element={<ItemListPage />} />
          <Route path="items/add" element={<ItemFormPage />} />
          <Route path="items/edit/:id" element={<ItemFormPage />} />
          <Route path="stock/in" element={<StockInPage />} />
          <Route path="stock/out" element={<StockOutPage />} />
          <Route path="reports/stock-balance" element={<StockBalancePage />} />
          <Route path="reports/low-stock" element={<LowStockPage />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="suppliers" element={<SupplierPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;