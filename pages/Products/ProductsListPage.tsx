import { useState } from 'react';
import { Plus, Search, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockProdutos } from '../../lib/mockData';

export function ProductsListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('todos');

  const categorias = ['todos', ...Array.from(new Set(mockProdutos.map(p => p.categoria)))];

  const filteredProdutos = mockProdutos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFilter === 'todos' || produto.categoria === categoriaFilter;
    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Produtos</h1>
          <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
        </div>
        <button
          onClick={() => navigate('/products/new')}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Adicionar Produto
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        <select
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          {categorias.map(categoria => (
            <option key={categoria} value={categoria}>
              {categoria === 'todos' ? 'Todas as Categorias' : categoria}
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
                <th className="text-left px-6 py-4 text-gray-700">Nome</th>
                <th className="text-left px-6 py-4 text-gray-700">Categoria</th>
                <th className="text-left px-6 py-4 text-gray-700">Preço</th>
                <th className="text-left px-6 py-4 text-gray-700">Unidade</th>
                <th className="text-left px-6 py-4 text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProdutos.map((produto) => (
                <tr key={produto.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{produto.nome}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full">
                      {produto.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">R$ {produto.preco.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-600">{produto.unidade}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/products/${produto.id}/edit`)}
                      className="flex items-center gap-2 px-3 py-1 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProdutos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
}
