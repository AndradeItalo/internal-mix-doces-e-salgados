import { useEffect, useState } from 'react';
import { Plus, Search, Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ordersApi, type Order } from '../../lib/orders';

export function OrdersListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statuses = ['todos', 'pendente', 'parcial', 'pago', 'cancelado'];
  
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await ordersApi.list();
        setOrders(data);
        setError(null);
      } catch (e) {
        setError('Falha ao carregar encomendas');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = orders.filter(o => {
    const matchesSearch = o.clientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-700';
      case 'parcial': return 'bg-yellow-100 text-yellow-700';
      case 'pendente': return 'bg-orange-100 text-orange-700';
      case 'cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'parcial': return 'Parcial';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Encomendas</h1>
          <p className="text-gray-600">Gerencie todas as encomendas</p>
        </div>
        <button
          onClick={() => navigate('/orders/new')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Encomenda
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'todos' ? 'Todos os Status' : getStatusLabel(status)}
            </option>
          ))}
        </select>

        <div />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-gray-700">Cliente</th>
                <th className="text-left px-6 py-4 text-gray-700">Data Entrega</th>
                <th className="text-left px-6 py-4 text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-gray-700">Valor Total</th>
                <th className="text-left px-6 py-4 text-gray-700">Valor Pago</th>
                <th className="text-left px-6 py-4 text-gray-700">Valor Pendente</th>
                <th className="text-left px-6 py-4 text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-red-500">{error}</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Nenhuma encomenda encontrada</td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{o.clientId}</td>
                    <td className="px-6 py-4 text-gray-600">{o.deliveryAt ? new Date(o.deliveryAt).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full ${getStatusColor(o.status)}`}>
                        {getStatusLabel(o.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">R$ {o.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-600">—</td>
                    <td className="px-6 py-4 text-gray-600">—</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/orders/${o.id}`)}
                        className="flex items-center gap-2 px-3 py-1 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
