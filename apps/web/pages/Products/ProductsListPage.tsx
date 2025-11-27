import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productsApi, type Product } from '../../lib/products';

export function ProductsListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await productsApi.list();
        setProducts(data);
        setError(null);
      } catch (e) {
        setError('Falha ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = products.filter(p => (
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
    || String(p.price).includes(searchTerm)
    || String(p.stock).includes(searchTerm)
  ));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Produtos</h1>
          <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
        </div>
        <button
          onClick={() => navigate('/products/new')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Adicionar Produto
        </button>
      </div>

      {/* Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, preço ou estoque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-gray-700">Nome</th>
                <th className="text-left px-6 py-4 text-gray-700">Preço</th>
                <th className="text-left px-6 py-4 text-gray-700">Estoque</th>
                <th className="text-left px-6 py-4 text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-red-500">{error}</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum produto encontrado</td>
                </tr>
              ) : (
                filtered.map((produto) => (
                  <tr key={produto.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{produto.name}</td>
                    <td className="px-6 py-4 text-gray-900">R$ {produto.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-600">{produto.stock}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/products/${produto.id}/edit`)}
                        className="flex items-center gap-2 px-3 py-1 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
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
