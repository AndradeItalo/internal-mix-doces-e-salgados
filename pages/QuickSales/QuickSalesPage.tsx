import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { mockVendasRapidas, mockProdutos } from '../../lib/mockData';

export function QuickSalesPage() {
  const [showModal, setShowModal] = useState(false);
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [cliente, setCliente] = useState('');

  const hoje = new Date().toISOString().split('T')[0];
  const vendasHoje = mockVendasRapidas.filter(v => v.data === hoje);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const produto = mockProdutos.find(p => p.id === produtoId);
    if (produto) {
      console.log('Registrando venda:', {
        produtoId,
        produto: produto.nome,
        quantidade: parseFloat(quantidade),
        valorTotal: parseFloat(quantidade) * produto.preco,
        cliente: cliente || undefined,
        data: hoje
      });
      setShowModal(false);
      setProdutoId('');
      setQuantidade('1');
      setCliente('');
    }
  };

  const totalVendasHoje = vendasHoje.reduce((acc, v) => acc + v.valorTotal, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Vendas Rápidas</h1>
          <p className="text-gray-600">Registre vendas do dia sem ser encomenda</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Registrar Venda
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-gray-900 mb-4">Vendas de Hoje</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 mb-1">Total de Vendas</p>
            <p className="text-gray-900">R$ {totalVendasHoje.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Quantidade de Vendas</p>
            <p className="text-gray-900">{vendasHoje.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h3 className="text-gray-900 mb-4">Histórico de Vendas Rápidas</h3>
          
          {mockVendasRapidas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma venda registrada</p>
          ) : (
            <div className="space-y-3">
              {mockVendasRapidas.map((venda) => (
                <div key={venda.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-gray-900">{venda.produto}</p>
                    <div className="flex items-center gap-4 text-gray-600 mt-1">
                      <span>Quantidade: {venda.quantidade}</span>
                      <span>Data: {new Date(venda.data).toLocaleDateString('pt-BR')}</span>
                      {venda.cliente && <span>Cliente: {venda.cliente}</span>}
                    </div>
                  </div>
                  <p className="text-gray-900">R$ {venda.valorTotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">Registrar Venda Rápida</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="produto" className="block text-gray-700 mb-2">
                  Produto *
                </label>
                <select
                  id="produto"
                  value={produtoId}
                  onChange={(e) => setProdutoId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {mockProdutos.map(produto => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome} - R$ {produto.preco.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quantidade" className="block text-gray-700 mb-2">
                  Quantidade *
                </label>
                <input
                  id="quantidade"
                  type="number"
                  min="1"
                  step="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="cliente" className="block text-gray-700 mb-2">
                  Cliente (opcional)
                </label>
                <input
                  id="cliente"
                  type="text"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Nome do cliente"
                />
              </div>

              {produtoId && quantidade && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">Valor Total</p>
                  <p className="text-gray-900">
                    R$ {(parseFloat(quantidade) * (mockProdutos.find(p => p.id === produtoId)?.preco || 0)).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Registrar Venda
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
