import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Loader2, DollarSign, Calendar, User, Package } from 'lucide-react';
import { quickSalesApi, quickSalePaymentsApi, type QuickSale, type QuickSalePayment } from '../../lib/quicksales';

export function QuickSaleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [quickSale, setQuickSale] = useState<QuickSale | null>(null);
  const [payments, setPayments] = useState<QuickSalePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({ amount: '', method: 'dinheiro' });

  const paymentMethods = ['dinheiro', 'cartão', 'pix', 'transferência'];

  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const [quickSaleData, paymentsData] = await Promise.all([
          quickSalesApi.get(id),
          quickSalePaymentsApi.getByQuickSale(id)
        ]);
        
        setQuickSale(quickSaleData);
        setPayments(paymentsData);
        setError(null);
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
        setError('Falha ao carregar detalhes da venda rápida');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const getTotalPaid = () => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getPendingAmount = () => {
    if (!quickSale) return 0;
    return quickSale.total - getTotalPaid();
  };

  const getPaymentStatus = () => {
    if (!quickSale) return 'pendente';
    
    const totalPaid = getTotalPaid();
    
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

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quickSale || !id || !newPayment.amount) return;
    
    const amount = parseFloat(newPayment.amount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Valor do pagamento inválido');
      return;
    }
    
    if (getTotalPaid() + amount > quickSale.total) {
      setError('Valor do pagamento excede o total da venda');
      return;
    }
    
    try {
      const payment = await quickSalePaymentsApi.create({
        quickSaleId: id,
        amount,
        method: newPayment.method,
        paidAt: new Date().toISOString()
      });
      
      setPayments([...payments, payment]);
      setNewPayment({ amount: '', method: 'dinheiro' });
      setShowAddPayment(false);
      setError(null);
    } catch (e) {
      setError('Falha ao adicionar pagamento');
      console.error('Erro ao adicionar pagamento:', e);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await quickSalePaymentsApi.remove(paymentId);
      setPayments(payments.filter(p => p.id !== paymentId));
      setError(null);
    } catch (e) {
      setError('Falha ao excluir pagamento');
      console.error('Erro ao excluir pagamento:', e);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
            <span className="text-gray-600">Carregando detalhes...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quickSale) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500 text-center">
            <p className="text-lg font-medium mb-2">Erro ao carregar dados</p>
            <p className="text-sm">{error || 'Venda rápida não encontrada'}</p>
            <button
              onClick={() => navigate('/quick-sales')}
              className="mt-4 text-orange-600 hover:text-orange-700"
            >
              Voltar para lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = getPaymentStatus();

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/quick-sales')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Vendas Rápidas
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-gray-900 mb-2">Detalhes da Venda Rápida</h1>
            <p className="text-gray-600">
              {new Date(quickSale.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-medium">Informações da Venda</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="text-gray-900">
                    {quickSale.client?.name || quickSale.clientId || 'Sem cliente'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Data da Venda</p>
                  <p className="text-gray-900">
                    {new Date(quickSale.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-medium mb-4">Itens da Venda</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-2 text-gray-700">Produto</th>
                    <th className="text-left py-2 text-gray-700">Qtd</th>
                    <th className="text-left py-2 text-gray-700">Preço</th>
                    <th className="text-left py-2 text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quickSale.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900">
                        {item.variant?.product?.name || item.product?.name || item.productId || item.variantId}
                        {item.variant?.flavor ? ` - ${item.variant.flavor}` : ''}
                      </td>
                      <td className="py-2 text-gray-600">{item.quantity}</td>
                      <td className="py-2 text-gray-600">R$ {item.price.toFixed(2)}</td>
                      <td className="py-2 text-gray-900">R$ {(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">Total da Venda</span>
                <span className="text-gray-900 font-bold text-lg">R$ {quickSale.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-gray-900 font-medium mb-4">Resumo Financeiro</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total da Venda</span>
                <span className="text-gray-900">R$ {quickSale.total.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valor Pago</span>
                <span className="text-green-600">R$ {getTotalPaid().toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valor Pendente</span>
                <span className="text-orange-600">R$ {getPendingAmount().toFixed(2)}</span>
              </div>
            </div>
            
            {getPendingAmount() > 0 && (
              <button
                onClick={() => setShowAddPayment(true)}
                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Pagamento
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-medium mb-4">Pagamentos</h3>
            
            {payments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum pagamento registrado</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-900 font-medium">R$ {payment.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600 capitalize">{payment.method}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.paidAt || payment.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Excluir pagamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-gray-900 font-medium mb-4">Adicionar Pagamento</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleAddPayment}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Valor do Pagamento</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={getPendingAmount()}
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0,00"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Valor pendente: R$ {getPendingAmount().toFixed(2)}
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Método de Pagamento</label>
                <select
                  value={newPayment.method}
                  onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPayment(false);
                    setNewPayment({ amount: '', method: 'dinheiro' });
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
