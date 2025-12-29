import { useEffect, useState } from 'react';
import { Plus, X, Loader2, Search, Eye, ArrowRight } from 'lucide-react';
import { quickSalesApi, type QuickSale } from '../../lib/quicksales';
import { productsApi, type Product } from '../../lib/products';
import { clientsApi, type Client } from '../../lib/clients';
import { useNavigate } from 'react-router-dom';

interface ItemTemp {
  productId: string;
  variantId: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
}

export function QuickSalesPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickSales, setQuickSales] = useState<QuickSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ItemTemp[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantidade, setQuantidade] = useState('1');

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [salesData, productsData, clientsData] = await Promise.all([
          quickSalesApi.list(),
          productsApi.list(),
          clientsApi.list()
        ]);
        setQuickSales(salesData);
        setProducts(productsData);
        setClients(clientsData);
        setError(null);
      } catch (e) {
        setError('Falha ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filtered = quickSales.filter(sale => {
    const productName = sale.items?.map(item => {
      const base = item.variant?.product?.name || item.product?.name || '';
      const flavor = item.variant?.flavor ? ` - ${item.variant.flavor}` : '';
      return `${base}${flavor}`.trim();
    }).join(', ') || '';
    return productName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const hoje = new Date().toISOString().split('T')[0];
  const vendasHoje = filtered.filter(v => v.createdAt.startsWith(hoje));
  const totalVendasHoje = vendasHoje.reduce((acc, v) => acc + v.total, 0);

  const handleAddItem = () => {
    if (!selectedProductId || !selectedVariantId || !quantidade) return;

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const variant = product.variants?.find(v => v.id === selectedVariantId);
    if (!variant) return;

    const qtd = parseFloat(quantidade);
    const newItem: ItemTemp = {
      productId: product.id,
      variantId: variant.id,
      product: `${product.name} - ${variant.flavor}`,
      quantity: qtd,
      price: variant.price,
      total: qtd * variant.price,
    };

    setItems([...items, newItem]);
    setSelectedProductId('');
    setSelectedVariantId('');
    setQuantidade('1');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const valorTotalVenda = items.reduce((acc, item) => acc + item.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      if (items.length === 0) {
        setError('Adicione pelo menos um produto');
        return;
      }

      await quickSalesApi.create({
        clientId: clienteId || undefined,
        total: valorTotalVenda,
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price
        }))
      } as any);
      
      // Reload data
      const [salesData, productsData, clientsData] = await Promise.all([
        quickSalesApi.list(),
        productsApi.list(),
        clientsApi.list()
      ]);
      setQuickSales(salesData);
      setProducts(productsData);
      setClients(clientsData);
      
      setShowModal(false);
      setItems([]);
      setClienteId('');
      setSelectedProductId('');
      setSelectedVariantId('');
      setQuantidade('1');
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      setError('Falha ao registrar venda');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Vendas Rápidas</h1>
          <p className="text-gray-600">Registre vendas do dia sem ser encomenda</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Registrar Venda
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-600 mb-2">Vendas de Hoje</h3>
          <p className="text-2xl font-bold text-gray-900">R$ {totalVendasHoje.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-600 mb-2">Quantidade Hoje</h3>
          <p className="text-2xl font-bold text-gray-900">{vendasHoje.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-600 mb-2">Total de Vendas</h3>
          <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-gray-700">Cliente</th>
                <th className="text-left px-6 py-4 text-gray-700">Produtos</th>
                <th className="text-left px-6 py-4 text-gray-700">Total</th>
                <th className="text-left px-6 py-4 text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-gray-700">Data</th>
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
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhuma venda encontrada</td>
                </tr>
              ) : (
                filtered.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{sale.client?.name || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="space-y-1">
                        {sale.items?.map((item, index) => (
                          <div key={item.id} className="text-sm">
                            <span className="text-gray-900">
                              {(item.variant?.product?.name || item.product?.name || '—')}
                              {item.variant?.flavor ? ` - ${item.variant.flavor}` : ''}
                            </span>
                            <span className="text-gray-500 ml-2">x{item.quantity}</span>
                          </div>
                        )) || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">R$ {sale.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getPaymentStatus(sale))}`}>
                        {getStatusLabel(getPaymentStatus(sale))}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{new Date(sale.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4">
                      <button
                      onClick={() => navigate(`/quick-sales/${sale.id}`)}
                      className="flex items-center gap-1 text-orange-600 hover:text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                      title="Ver detalhes da venda"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Detalhes</span>
                    </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="cliente" className="block text-gray-700 mb-2">
                  Cliente
                </label>
                <select
                  id="cliente"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Adicionar Produtos</label>
                <div className="flex gap-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Selecione um produto</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - R$ {product.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={!selectedProductId}
                  >
                    <option value="">Sabor</option>
                    {(products.find(p => p.id === selectedProductId)?.variants || []).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.flavor}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    step={products.find(p => p.id === selectedProductId)?.unit === 'KG' ? '0.001' : '1'}
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Qtd"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {items.length > 0 && (
                <div>
                  <label className="block text-gray-700 mb-2">Itens da Venda</label>
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-gray-900">{item.product}</span>
                          <span className="text-gray-500 ml-2">x{item.quantity}</span>
                          <span className="text-gray-600 ml-2">R$ {item.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-medium">R$ {item.total.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">R$ {valorTotalVenda.toFixed(2)}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registrando...
                    </div>
                  ) : (
                    'Registrar Venda'
                  )}
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
