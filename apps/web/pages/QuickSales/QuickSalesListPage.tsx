import { useEffect, useState } from 'react';
import { Plus, Search, Eye, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { quickSalesApi, type QuickSale } from '../../lib/quicksales';

export function QuickSalesListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [quickSales, setQuickSales] = useState<QuickSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statuses = ['todos', 'pago', 'pendente', 'parcial'];
  
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await quickSalesApi.list();
        setQuickSales(data);
        setError(null);
      } catch (e) {
        setError('Falha ao carregar vendas rápidas');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getPaymentStatus = (quickSale: QuickSale) => {
    if (!quickSale.payments || quickSale.payments.length === 0) {
      return 'pendente';
    }
    
    const totalPaid = quickSale.payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    if (totalPaid >= quickSale.total) {
      return 'pago';
    } else if (totalPaid > 0) {
      return 'parcial';
    }
    
    return 'pendente';
  };

  const filtered = quickSales.filter(qs => {
    const clientName = qs.client?.name || qs.clientId || 'Sem cliente';
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getPaymentStatus(qs);
    const matchesStatus = statusFilter === 'todos' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-700';
      case 'parcial': return 'bg-yellow-100 text-yellow-700';
      case 'pendente': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'parcial': return 'Parcial';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  };

  const getTotalPaid = (quickSale: QuickSale) => {
    if (!quickSale.payments || quickSale.payments.length === 0) {
      return 0;
    }
    return quickSale.payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getPendingAmount = (quickSale: QuickSale) => {
    return quickSale.total - getTotalPaid(quickSale);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
            <span className="text-gray-600">Carregando vendas rápidas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500 text-center">
            <p className="text-lg font-medium mb-2">Erro ao carregar dados</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Vendas Rápidas</h1>
          <p className="text-gray-600">Gerencie suas vendas rápidas e pagamentos</p>
        </div>
        <button
          onClick={() => navigate('/quick-sales/new')}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Venda Rápida
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-2">Total de Vendas</p>
          <p className="text-gray-900 mb-1">R$ {quickSales.reduce((sum, qs) => sum + qs.total, 0).toFixed(2)}</p>
          <p className="text-gray-600">{quickSales.length} vendas</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-2">Valor Pago</p>
          <p className="text-gray-900 mb-1">
            R$ {quickSales.reduce((sum, qs) => sum + getTotalPaid(qs), 0).toFixed(2)}
          </p>
          <p className="text-gray-600">
            {quickSales.filter(qs => getPaymentStatus(qs) === 'pago').length} vendas pagas
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-2">Valor Pendente</p>
          <p className="text-gray-900 mb-1">
            R$ {quickSales.reduce((sum, qs) => sum + getPendingAmount(qs), 0).toFixed(2)}
          </p>
          <p className="text-gray-600">
            {quickSales.filter(qs => getPaymentStatus(qs) === 'pendente').length} vendas pendentes
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'todos' ? 'Todos os Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-gray-700">Cliente</th>
                <th className="text-left py-3 px-6 text-gray-700">Data</th>
                <th className="text-left py-3 px-6 text-gray-700">Total</th>
                <th className="text-left py-3 px-6 text-gray-700">Valor Pago</th>
                <th className="text-left py-3 px-6 text-gray-700">Valor Pendente</th>
                <th className="text-left py-3 px-6 text-gray-700">Status</th>
                <th className="text-left py-3 px-6 text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((quickSale) => {
                const status = getPaymentStatus(quickSale);
                const totalPaid = getTotalPaid(quickSale);
                const pendingAmount = getPendingAmount(quickSale);
                
                return (
                  <tr key={quickSale.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-6 text-gray-900">
                      {quickSale.client?.name || quickSale.clientId || 'Sem cliente'}
                    </td>
                    <td className="py-3 px-6 text-gray-600">
                      {new Date(quickSale.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-6 text-gray-900">R$ {quickSale.total.toFixed(2)}</td>
                    <td className="py-3 px-6 text-gray-600">R$ {totalPaid.toFixed(2)}</td>
                    <td className="py-3 px-6 text-gray-600">R$ {pendingAmount.toFixed(2)}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusLabel(status)}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <button
                        onClick={() => navigate(`/quick-sales/${quickSale.id}`)}
                        className="text-orange-600 hover:text-orange-700 p-1 rounded hover:bg-orange-50 transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma venda rápida encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
