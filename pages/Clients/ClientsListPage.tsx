import { useState } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockClientes } from '../../lib/mockData';

export function ClientsListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClientes = mockClientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm)
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes</p>
        </div>
        <button
          onClick={() => navigate('/clients/new')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Adicionar Cliente
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-gray-700">Nome</th>
                <th className="text-left px-6 py-4 text-gray-700">Telefone</th>
                <th className="text-left px-6 py-4 text-gray-700">Total Encomendas</th>
                <th className="text-left px-6 py-4 text-gray-700">Total em Aberto</th>
                <th className="text-left px-6 py-4 text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{cliente.nome}</td>
                  <td className="px-6 py-4 text-gray-600">{cliente.telefone}</td>
                  <td className="px-6 py-4 text-gray-600">{cliente.totalEncomendas}</td>
                  <td className="px-6 py-4">
                    <span className={cliente.totalAberto > 0 ? 'text-orange-600' : 'text-green-600'}>
                      R$ {cliente.totalAberto.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/clients/${cliente.id}`)}
                      className="flex items-center gap-2 px-3 py-1 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredClientes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum cliente encontrado</p>
        </div>
      )}
    </div>
  );
}
