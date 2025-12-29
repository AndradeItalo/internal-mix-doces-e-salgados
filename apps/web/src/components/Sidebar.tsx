import { 
  Users, 
  Package, 
  ShoppingBag, 
  CreditCard, 
  CalendarDays,
  Clock, 
  LogOut,
  Cake
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/clients', label: 'Clientes', icon: Users },
    { path: '/products', label: 'Produtos', icon: Package },
    { path: '/orders', label: 'Encomendas', icon: ShoppingBag },
    { path: '/orders/agenda', label: 'Agenda', icon: CalendarDays },
    { path: '/payments', label: 'Pagamentos', icon: CreditCard },
    { path: '/history', label: 'Histórico', icon: Clock },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/images/logo-mix-doces.png" alt="Logo Mix Doces" />
          </div>
          <div>
            <h2 className="text-gray-900">Mix Doces e Salgados</h2>
            <p className="text-gray-500">Gestão</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
