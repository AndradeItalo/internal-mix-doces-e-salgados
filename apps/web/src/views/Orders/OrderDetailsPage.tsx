import { useEffect, useState } from 'react';
import { ArrowLeft, Edit, CheckCircle, XCircle, DollarSign, Package, Check, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ordersApi, type Order } from '../../lib/orders';
import { paymentsApi } from '../../lib/payments';

export function OrderDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [valorPagamento, setValorPagamento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [observacaoPagamento, setObservacaoPagamento] = useState('');

  const [showCancelModal, setShowCancelModal] = useState(false);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await ordersApi.get(id);
        setOrder(data);
        setError(null);
      } catch (e) {
        setError('Encomenda não encontrada');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <p className="text-gray-600">{error || 'Encomenda não encontrada'}</p>
        <button onClick={() => navigate('/orders')} className="text-orange-600 hover:text-orange-700 mt-4">
          Voltar
        </button>
      </div>
    );
  }

  const handleRegistrarPagamento = async () => {
    if (!order) return;
    const amount = parseFloat(valorPagamento.replace(',', '.'));
    if (!amount || amount <= 0) return;
    try {
      await paymentsApi.create({
        orderId: order.id,
        amount,
        method: formaPagamento,
        paidAt: new Date().toISOString(),
      });
      const refreshed = await ordersApi.get(order.id);
      setOrder(refreshed);
      setShowPagamentoModal(false);
      setValorPagamento('');
      setObservacaoPagamento('');
    } catch (e) {
      console.error('Erro ao registrar pagamento', e);
    }
  };

  const handleMarcarEntregue = async () => {
    if (!order) return;
    
    try {
      // Atualizar o status para 'entregue'
      await ordersApi.update(order.id, { status: 'entregue' });
      
      // Recarregar os dados da encomenda
      const updatedOrder = await ordersApi.get(order.id);
      setOrder(updatedOrder);
      
      // Mostrar feedback de sucesso
      setSuccessMessage('Encomenda marcada como entregue com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao marcar como entregue:', error);
      setError('Erro ao marcar encomenda como entregue. Tente novamente.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCancelar = async () => {
    if (!order) return;
    
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!order) return;
    
    try {
      // Atualizar o status para 'cancelado'
      await ordersApi.update(order.id, { status: 'cancelado' });
      
      // Recarregar os dados da encomenda
      const updatedOrder = await ordersApi.get(order.id);
      setOrder(updatedOrder);
      
      // Mostrar feedback de sucesso
      setSuccessMessage('Encomenda cancelada com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowCancelModal(false);
    } catch (e) {
      setError('Erro ao cancelar encomenda. Tente novamente.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const cancelCancel = () => {
    setShowCancelModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'entregue': return 'bg-blue-100 text-blue-700';
      case 'pago': return 'bg-green-100 text-green-700';
      case 'parcial': return 'bg-yellow-100 text-yellow-700';
      case 'pendente': return 'bg-orange-100 text-orange-700';
      case 'cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'entregue': return 'Encomenda Entregue';
      case 'pago': return 'Pago';
      case 'parcial': return 'Parcialmente Pago';
      case 'pendente': return 'Pagamento Pendente';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="p-8">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">Detalhes da Encomenda</h1>
            <p className="text-gray-600">Encomenda #{order.id}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/orders/${order.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-5 h-5" />
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* Status e informações principais */}
      <div className="mb-6">
        <span className={`inline-flex px-4 py-2 rounded-full text-white ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-600">Valor Total</p>
          </div>
          <p className="text-gray-900">R$ {order.total.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-1">Cliente (ID)</p>
          <p className="text-gray-900">{order.clientId}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-1">Entrega</p>
          <p className="text-gray-900">{order.deliveryAt ? new Date(order.deliveryAt).toLocaleDateString('pt-BR') : '—'}</p>
        </div>
      </div>

      {/* Produtos da Encomenda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-gray-900 mb-4">Produtos</h3>
        {!order.items || order.items.length === 0 ? (
          <p className="text-gray-500">Nenhum produto registrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-700">Produto</th>
                  <th className="text-left px-4 py-3 text-gray-700">Qtd</th>
                  <th className="text-left px-4 py-3 text-gray-700">Valor Unit.</th>
                  <th className="text-left px-4 py-3 text-gray-700">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-gray-900">
                      {it.variant?.product?.name || it.product?.name || it.productId || it.variantId}
                      {it.variant?.flavor ? ` - ${it.variant.flavor}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{it.quantity}</td>
                    <td className="px-4 py-3 text-gray-600">R$ {it.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-900">R$ {(it.quantity * it.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Histórico de Pagamentos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-gray-900 mb-4">Histórico de Pagamentos</h3>
        {!order.payments || order.payments.length === 0 ? (
          <p className="text-gray-500">Nenhum pagamento registrado</p>
        ) : (
          <div className="space-y-2">
            {order.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-900">R$ {p.amount.toFixed(2)}</div>
                <div className="text-gray-600 text-sm">
                  {p.method} {p.paidAt ? `• ${new Date(p.paidAt).toLocaleDateString('pt-BR')}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowPagamentoModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <DollarSign className="w-5 h-5" />
          Registrar Pagamento
        </button>

        {(order.status !== 'cancelado' && order.status !== 'entregue') && (
          <button
            onClick={handleMarcarEntregue}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Marcar como Entregue
          </button>
        )}

        {order.status !== 'cancelado' && (
          <button
            onClick={handleCancelar}
            className="flex items-center gap-2 px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <XCircle className="w-5 h-5" />
            Cancelar Encomenda
          </button>
        )}
      </div>

      {/* Modal de Pagamento */}
      {showPagamentoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-gray-900 mb-4">Registrar Pagamento</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="valor" className="block text-gray-700 mb-2">
                  Valor *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">R$</span>
                  <input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    // max could be computed from outstanding balance once available
                    value={valorPagamento}
                    onChange={(e) => setValorPagamento(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={`Valor do pagamento`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="forma" className="block text-gray-700 mb-2">
                  Forma de Pagamento *
                </label>
                <select
                  id="forma"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus-border-transparent"
                >
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Crédito">Crédito</option>
                  <option value="Débito">Débito</option>
                </select>
              </div>

              <div>
                <label htmlFor="obs" className="block text-gray-700 mb-2">
                  Observação
                </label>
                <input
                  id="obs"
                  type="text"
                  value={observacaoPagamento}
                  onChange={(e) => setObservacaoPagamento(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: Parcela 2 de 3"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRegistrarPagamento}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowPagamentoModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold">Confirmar Cancelamento</h3>
                <p className="text-gray-600 text-sm">Tem certeza que deseja cancelar esta encomenda?</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-gray-700 text-sm">
                Esta ação não pode ser desfeita. A encomenda será marcada como cancelada e não poderá mais ser entregue.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmCancel}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Sim, Cancelar
              </button>
              <button
                onClick={cancelCancel}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
