import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsApi, type Product } from '../../lib/products';

export function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const p: Product = await productsApi.get(id);
        setName(p.name);
        setPrice(String(p.price));
        setStock(String(p.stock));
        setError(null);
      } catch (e) {
        setError('Falha ao carregar produto');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload = { name, price: parseFloat(price.replace(',', '.')), stock: parseInt(stock || '0', 10) };
      if (id) {
        await productsApi.update(id, payload);
      } else {
        await productsApi.create(payload as Omit<Product, 'id' | 'createdAt'>);
      }
      navigate('/products');
    } catch (e) {
      setError('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/products');
  };

  return (
    <div className="p-8">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">{id ? 'Editar Produto' : 'Novo Produto'}</h1>
        <p className="text-gray-600">
          {id ? 'Atualize as informações do produto' : 'Adicione um novo produto ao catálogo'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        {error && (
          <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-gray-700 mb-2">
              Nome do Produto *
            </label>
            <input
              id="nome"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ex: Brigadeiro Gourmet"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="stock" className="block text-gray-700 mb-2">
                Estoque *
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-60"
              disabled={loading}
            >
              <Save className="w-5 h-5" />
              Salvar Produto
            </button>
            <button
              type="button"
              onClick={handleBack}
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
