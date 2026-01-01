import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

import { LoginPage } from './src/views/Auth/LoginPage';
import { ClientsListPage } from './src/views/Clients/ClientsListPage';
import { ClientFormPage } from './src/views/Clients/ClientFormPage';
import { ClientDetailsPage } from './src/views/Clients/ClientDetailsPage';
import { ProductsListPage } from './src/views/Products/ProductsListPage';
import { ProductFormPage } from './src/views/Products/ProductFormPage';
import { OrdersListPage } from './src/views/Orders/OrdersListPage';
import { OrdersAgendaPage } from './src/views/Orders/OrdersAgendaPage';
import { OrderFormPage } from './src/views/Orders/OrderFormPage';
import { OrderDetailsPage } from './src/views/Orders/OrderDetailsPage';
import { PaymentsPage } from './src/views/Payments/PaymentsPage';
import { HistoryPage } from './src/views/History/HistoryPage';
import { SettingsPage } from './src/views/Settings/SettingsPage';
import { Sidebar } from './src/components/Sidebar';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (password: string) => {
    if (password) {
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
              <Navigate to="/orders" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        <Route element={<PrivateLayout />}>
          <Route path="/" element={<Navigate to="/orders" replace />} />

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
          <Route path="/orders/agenda" element={<OrdersAgendaPage />} />
          <Route path="/orders/new" element={<OrderFormPage />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
          <Route path="/orders/:id/edit" element={<OrderFormPage />} />

          {/* Payments */}
          <Route path="/payments" element={<PaymentsPage />} />

          {/* History */}
          <Route path="/history" element={<HistoryPage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* End of protected routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
