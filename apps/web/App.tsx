import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

import { LoginPage } from './pages/Auth/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { ClientsListPage } from './pages/Clients/ClientsListPage';
import { ClientFormPage } from './pages/Clients/ClientFormPage';
import { ClientDetailsPage } from './pages/Clients/ClientDetailsPage';
import { ProductsListPage } from './pages/Products/ProductsListPage';
import { ProductFormPage } from './pages/Products/ProductFormPage';
import { OrdersListPage } from './pages/Orders/OrdersListPage';
import { OrderFormPage } from './pages/Orders/OrderFormPage';
import { OrderDetailsPage } from './pages/Orders/OrderDetailsPage';
import { PaymentsPage } from './pages/Payments/PaymentsPage';
import { QuickSalesPage } from './pages/QuickSales/QuickSalesPage';
import { HistoryPage } from './pages/History/HistoryPage';
import { RemindersPage } from './pages/Reminders/RemindersPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { Sidebar } from './components/Sidebar';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (email: string, password: string) => {
    if (email && password) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const PrivateLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
      setIsSidebarOpen(false);
    }, [location.pathname]);

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar fixa em telas md+ */}
        <div className="hidden md:flex">
          <Sidebar onLogout={handleLogout} />
        </div>

        {/* Drawer mobile */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="relative z-50 w-64 h-full bg-white shadow-xl">
              <Sidebar onLogout={handleLogout} />
            </div>
          </div>
        )}

        <main className="flex-1 flex flex-col overflow-auto">
          {/* Topbar mobile com botão de menu */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-white">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-medium text-gray-900">Menu</span>
          </div>

          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        <Route element={<PrivateLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Clients */}
          <Route path="/clients" element={<ClientsListPage />} />
          <Route path="/clients/new" element={<ClientFormPage />} />
          <Route path="/clients/:id" element={<ClientDetailsPage />} />
          <Route path="/clients/:id/edit" element={<ClientFormPage />} />

          {/* Products */}
          <Route path="/products" element={<ProductsListPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />

          {/* Orders */}
          <Route path="/orders" element={<OrdersListPage />} />
          <Route path="/orders/new" element={<OrderFormPage />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
          <Route path="/orders/:id/edit" element={<OrderFormPage />} />

          {/* Payments */}
          <Route path="/payments" element={<PaymentsPage />} />

          {/* Quick Sales */}
          <Route path="/quick-sales" element={<QuickSalesPage />} />

          {/* History */}
          <Route path="/history" element={<HistoryPage />} />

          {/* Reminders */}
          <Route path="/reminders" element={<RemindersPage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* End of protected routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
