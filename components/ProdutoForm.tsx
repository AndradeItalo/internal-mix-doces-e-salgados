import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { mockProdutos } from '../lib/mockData';

interface ProdutoFormProps {
  produtoId: string | null;
  onBack: () => void;
}

export function ProdutoForm({ produtoId, onBack }: ProdutoFormProps) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preco, setPreco] = useState('');
  const [unidade, setUnidade] = useState('unidade');
  const [observacoes, setObservacoes] = useState('');

  const categorias = ['Doce', 'Salgado', 'Torta', 'Bolo', 'Outro'];
  const unidades = ['unidade', 'kg', 'bandeja', 'cento', 'dúzia'];

  useEffect(() => {
    if (produtoId) {
      const produto = mockProdutos.find(p => p.id === produtoId);
      if (produto) {
        setNome(produto.nome);
        setCategoria(produto.categoria);
        setPreco(produto.preco.toString());
        setUnidade(produto.unidade);
        setObservacoes(produto.observacoes || '');
      }
    }
  }, [produtoId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would save to backend
    console.log('Salvando produto:', { nome, categoria, preco, unidade, observacoes });
    onBack();
  };

  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">
          {produtoId ? 'Editar Produto' : 'Novo Produto'}
        </h1>
        <p className="text-gray-600">
          {produtoId ? 'Atualize as informações do produto' : 'Adicione um novo produto ao catálogo'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-gray-700 mb-2">
              Nome do Produto *
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Ex: Brigadeiro Gourmet"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="categoria" className="block text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              >
                <option value="">Selecione...</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="unidade" className="block text-gray-700 mb-2">
                Unidade *
              </label>
              <select
                id="unidade"
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              >
                {unidades.map(un => (
                  <option key={un} value={un}>{un}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="preco" className="block text-gray-700 mb-2">
              Preço *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">R$</span>
              <input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="observacoes" className="block text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Informações adicionais sobre o produto"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              Salvar Produto
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
