import { useEffect, useState } from 'react';
import { Plus, Search, Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clientsApi, type Client } from '../../lib/clients';

export function ClientsListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await clientsApi.list();
        setClients(data);
        setError(null);
      } catch (e) {
        setError('Falha ao carregar clientes');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-red-500">{error}</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum cliente encontrado</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 text-gray-600">{c.phone || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">—</td>
                    <td className="px-6 py-4">—</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/clients/${c.id}`)}
                        className="flex items-center gap-2 px-3 py-1 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalhes
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
