import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsApi, type Product, type ProductVariant, type ProductUpsert } from '../../lib/products';

export function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [name, setName] = useState('');
  const [unit, setUnit] = useState<'UN' | 'KG'>('UN');

  const [variants, setVariants] = useState<Array<{
    id?: string;
    flavor: string;
    price: string;
    stock: string;
  }>>([{ flavor: 'Padrão', price: '', stock: '0' }]);

  const [newFlavor, setNewFlavor] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('0');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const p: Product = await productsApi.get(id);
        setName(p.name);
        setUnit(p.unit || 'UN');

        if (Array.isArray(p.variants) && p.variants.length > 0) {
          setVariants(
            p.variants.map((v: ProductVariant) => ({
              id: v.id,
              flavor: v.flavor,
              price: String(v.price),
              stock: String(v.stock),
            }))
          );
        } else {
          setVariants([{ flavor: 'Padrão', price: String(p.price ?? ''), stock: String(p.stock ?? 0) }]);
        }
        setError(null);
      } catch (e) {
        setError('Falha ao carregar produto');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddVariant = () => {
    const flavor = newFlavor.trim();
    if (!flavor) return;

    setVariants([
      ...variants,
      { flavor, price: newPrice, stock: newStock || '0' },
    ]);

    setNewFlavor('');
    setNewPrice('');
    setNewStock('0');
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleChangeVariant = (index: number, patch: Partial<(typeof variants)[number]>) => {
    setVariants(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const normalizedVariants: ProductUpsert['variants'] = variants
        .map((v) => ({
          id: v.id,
          flavor: v.flavor.trim(),
          price: parseFloat(String(v.price).replace(',', '.')),
          stock: parseInt(String(v.stock || '0'), 10),
        }))
        .filter((v) => v.flavor !== '' && Number.isFinite(v.price) && Number.isFinite(v.stock));

      if (normalizedVariants.length === 0) {
        setError('Adicione pelo menos um sabor com preço e estoque');
        return;
      }

      const payload: ProductUpsert = { name, unit, variants: normalizedVariants };
      if (id) {
        await productsApi.update(id, payload);
      } else {
        await productsApi.create(payload);
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

          <div>
            <label htmlFor="unit" className="block text-gray-700 mb-2">
              Unidade de Venda *
            </label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'UN' | 'KG')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="UN">Unidade (UN)</option>
              <option value="KG">Peso (KG)</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Sabores (variações) *</label>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={v.id ?? `${v.flavor}-${idx}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-gray-700 mb-2">Sabor</label>
                    <input
                      type="text"
                      value={v.flavor}
                      onChange={(e) => handleChangeVariant(idx, { flavor: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ex: Chocolate"
                      required
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-gray-700 mb-2">Preço</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={v.price}
                        onChange={(e) => handleChangeVariant(idx, { price: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-gray-700 mb-2">Estoque</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={v.stock}
                      onChange={(e) => handleChangeVariant(idx, { stock: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="md:col-span-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={variants.length <= 1}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end pt-2">
                <div className="md:col-span-1">
                  <label className="block text-gray-700 mb-2">Novo sabor</label>
                  <input
                    type="text"
                    value={newFlavor}
                    onChange={(e) => setNewFlavor(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Ex: Morango"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-gray-700 mb-2">Preço</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-gray-700 mb-2">Estoque</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-1">
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
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
