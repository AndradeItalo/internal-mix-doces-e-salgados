import { useState } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
import { mockEncomendas, mockClientes } from '../lib/mockData';

interface EncomendasProps {
  onNavigate: (page: string, id?: string) => void;
}

export function Encomendas({ onNavigate }: EncomendasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [mesFilter, setMesFilter] = useState('todos');

  const statuses = ['todos', 'pendente', 'parcial', 'pago', 'cancelado'];
  const meses = ['todos', 'Novembro', 'Dezembro'];

  const filteredEncomendas = mockEncomendas.filter(encomenda => {
    const matchesSearch = encomenda.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || encomenda.status === statusFilter;
    const matchesMes = mesFilter === 'todos' || true; // Simplified for demo
    return matchesSearch && matchesStatus && matchesMes;
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
          onClick={() => onNavigate('nova-encomenda')}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
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
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'todos' ? 'Todos os Status' : getStatusLabel(status)}
            </option>
          ))}
        </select>

        <select
          value={mesFilter}
          onChange={(e) => setMesFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          {meses.map(mes => (
            <option key={mes} value={mes}>
              {mes === 'todos' ? 'Todos os Meses' : mes}
            </option>
          ))}
        </select>
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
              {filteredEncomendas.map((encomenda) => (
                <tr key={encomenda.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{encomenda.cliente}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(encomenda.dataEntrega).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full ${getStatusColor(encomenda.status)}`}>
                      {getStatusLabel(encomenda.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">R$ {encomenda.valorTotal.toFixed(2)}</td>
                  <td className="px-6 py-4 text-green-600">R$ {encomenda.valorPago.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={encomenda.valorPendente > 0 ? 'text-orange-600' : 'text-gray-600'}>
                      R$ {encomenda.valorPendente.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onNavigate('encomenda-detalhes', encomenda.id)}
                      className="flex items-center gap-2 px-3 py-1 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEncomendas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma encomenda encontrada</p>
        </div>
      )}
    </div>
  );
}
