import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsApi, type Client } from '../../lib/clients';
import { productsApi, type Product } from '../../lib/products';
import { ordersApi, type Order, type OrderItem } from '../../lib/orders';
import { paymentsApi } from '../../lib/payments';

interface ItemTemp {
  produtoId: string;
  produto: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export function OrderFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [clienteId, setClienteId] = useState('');
  const [items, setItems] = useState<ItemTemp[]>([]);
  const [dataEntrega, setDataEntrega] = useState('');
  const [valorPagamento, setValorPagamento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProdutoId, setSelectedProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('1');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [c, p] = await Promise.all([clientsApi.list(), productsApi.list()]);
        setClients(c);
        setProducts(p);
        setError(null);

        // Se tiver ID, carregar dados da encomenda para edição
        if (id) {
          const order = await ordersApi.get(id);
          setClienteId(order.clientId || '');
          setDataEntrega(order.deliveryAt ? new Date(order.deliveryAt).toISOString().split('T')[0] : '');
          
          // Carregar itens da encomenda
          if (order.items) {
            const mappedItems = order.items.map((item: OrderItem) => ({
              produtoId: item.productId,
              produto: item.product?.name || '',
              quantidade: item.quantity,
              valorUnitario: item.price,
              valorTotal: item.quantity * item.price
            }));
            setItems(mappedItems);
          }
        }
      } catch (e) {
        setError('Falha ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddItem = () => {
    if (!selectedProdutoId || !quantidade) return;

    const produto = products.find(p => p.id === selectedProdutoId);
    if (!produto) return;

    const qtd = parseFloat(quantidade);
    const newItem: ItemTemp = {
      produtoId: produto.id,
      produto: produto.name,
      quantidade: qtd,
      valorUnitario: produto.price,
      valorTotal: qtd * produto.price,
    };

    setItems([...items, newItem]);
    setSelectedProdutoId('');
    setQuantidade('1');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const valorTotalEncomenda = items.reduce((acc, item) => acc + item.valorTotal, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload = {
        clientId: clienteId,
        deliveryAt: dataEntrega || undefined,
        status: 'pendente',
        items: items.map(it => ({ productId: it.produtoId, quantity: it.quantidade, price: it.valorUnitario })),
      };
      
      let order;
      if (id) {
        // Modo edição
        order = await ordersApi.update(id, payload as any);
      } else {
        // Modo criação
        order = await ordersApi.create(payload as any);
        const amount = parseFloat((valorPagamento || '').replace(',', '.'));
        if (!isNaN(amount) && amount > 0) {
          await paymentsApi.create({ orderId: order.id, amount, method: formaPagamento, paidAt: new Date().toISOString() });
        }
      }
      
      navigate('/orders');
    } catch (e) {
      setError('Erro ao salvar encomenda');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/orders');
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
        <h1 className="text-gray-900 mb-2">
          {id ? 'Editar Encomenda' : 'Nova Encomenda'}
        </h1>
        <p className="text-gray-600">
          {id ? 'Atualize as informações da encomenda' : 'Crie uma nova encomenda'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente e Data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-900 mb-4">Informações Gerais</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="cliente" className="block text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                id="cliente"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>{cliente.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dataEntrega" className="block text-gray-700 mb-2">
                Data de Entrega *
              </label>
              <input
                id="dataEntrega"
                type="date"
                value={dataEntrega}
                onChange={(e) => setDataEntrega(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Produtos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-900 mb-4">Produtos</h3>

          {/* Adicionar produto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <label htmlFor="produto" className="block text-gray-700 mb-2">
                Produto
              </label>
              <select
                id="produto"
                value={selectedProdutoId}
                onChange={(e) => setSelectedProdutoId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Selecione um produto</option>
                {products.map(produto => (
                  <option key={produto.id} value={produto.id}>
                    {produto.name} - R$ {produto.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="quantidade" className="block text-gray-700 mb-2">
                  Quantidade
                </label>
                <input
                  id="quantidade"
                  type="number"
                  min="1"
                  step="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de produtos */}
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-gray-900">{item.produto}</p>
                    <p className="text-gray-600">
                      {item.quantidade} x R$ {item.valorUnitario.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-gray-900">R$ {item.valorTotal.toFixed(2)}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-gray-900">Valor Total</p>
                  <p className="text-gray-900">R$ {valorTotalEncomenda.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum produto adicionado</p>
          )}
        </div>

        {/* Pagamento Inicial */}
        {!id && items.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-900 mb-4">Pagamento Inicial (Opcional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="valorPagamento" className="block text-gray-700 mb-2">
                  Valor do Pagamento
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">R$</span>
                  <input
                    id="valorPagamento"
                    type="number"
                    step="0.01"
                    min="0"
                    max={valorTotalEncomenda}
                    value={valorPagamento}
                    onChange={(e) => setValorPagamento(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="formaPagamento" className="block text-gray-700 mb-2">
                  Forma de Pagamento
                </label>
                <select
                  id="formaPagamento"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Crédito">Crédito</option>
                  <option value="Débito">Débito</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={items.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {id ? 'Atualizar Encomenda' : 'Salvar Encomenda'}
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
  );
}
