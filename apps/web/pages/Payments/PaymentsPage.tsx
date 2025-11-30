import { useEffect, useMemo, useState } from 'react';
import { DollarSign, Calendar, CreditCard, Loader2, Package, ShoppingCart, User, Edit2, X, Save } from 'lucide-react';
import { paymentsApi, type Payment } from '../../lib/payments';
import { quickSalePaymentsApi, type QuickSalePayment } from '../../lib/quicksales';

interface CombinedPayment {
  id: string;
  amount: number;
  method: string;
  paidAt?: string;
  createdAt: string;
  type: 'order' | 'quickSale';
  orderId?: string;
  quickSaleId?: string;
  clientName?: string;
  client?: {
    id: string;
    name: string;
  };
}

export function PaymentsPage() {
  const [orderPayments, setOrderPayments] = useState<Payment[]>([]);
  const [quickSalePayments, setQuickSalePayments] = useState<QuickSalePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'todos' | 'recebidos'>('todos');
  
  // Estados para edição
  const [editingPayment, setEditingPayment] = useState<CombinedPayment | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editMethod, setEditMethod] = useState('');
  const [editPaidAt, setEditPaidAt] = useState('');
  const [saving, setSaving] = useState(false);

  const paymentMethods = ['dinheiro', 'cartão', 'pix', 'transferência'];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [orderData, quickSaleData] = await Promise.all([
          paymentsApi.list(),
          quickSalePaymentsApi.list()
        ]);
        setOrderPayments(orderData);
        setQuickSalePayments(quickSaleData);
        setError(null);
      } catch (e) {
        setError('Falha ao carregar pagamentos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Combinar todos os pagamentos
  const allPayments = useMemo(() => {
    const combined: CombinedPayment[] = [
      ...orderPayments.map(p => ({
        ...p,
        type: 'order' as const,
        orderId: p.orderId,
        clientName: p.order?.client?.name || 'Cliente não identificado'
      })),
      ...quickSalePayments.map(p => ({
        ...p,
        type: 'quickSale' as const,
        quickSaleId: p.quickSaleId,
        clientName: p.quickSale?.client?.name || 'Cliente não identificado'
      }))
    ];

    // Ordenar por data de pagamento (ou criação se não tiver paidAt)
    return combined.sort((a, b) => {
      const dateA = a.paidAt ? new Date(a.paidAt).getTime() : new Date(a.createdAt).getTime();
      const dateB = b.paidAt ? new Date(b.paidAt).getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [orderPayments, quickSalePayments]);

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const received = useMemo(() => allPayments.filter(p => !!p.paidAt), [allPayments]);
  const receivedThisMonth = useMemo(() => received.filter(p => {
    const d = new Date(p.paidAt!);
    return d.getMonth() === month && d.getFullYear() === year;
  }), [received, month, year]);

  const filtered = filter === 'recebidos' ? receivedThisMonth : allPayments;

  const totalRecebidoMes = receivedThisMonth.reduce((acc, p) => acc + p.amount, 0);

  // Funções de edição
  const handleEdit = (payment: CombinedPayment) => {
    setEditingPayment(payment);
    setEditAmount(payment.amount.toString());
    setEditMethod(payment.method);
    setEditPaidAt(payment.paidAt ? new Date(payment.paidAt).toISOString().split('T')[0] : '');
  };

  const handleSaveEdit = async () => {
    if (!editingPayment) return;
    
    try {
      setSaving(true);
      const updateData = {
        amount: parseFloat(editAmount),
        method: editMethod,
        paidAt: editPaidAt ? new Date(editPaidAt + 'T12:00:00').toISOString() : undefined
      };

      if (editingPayment.type === 'order') {
        await paymentsApi.update(editingPayment.id, updateData);
      } else {
        await quickSalePaymentsApi.update(editingPayment.id, updateData);
      }

      // Recarregar dados
      const [orderData, quickSaleData] = await Promise.all([
        paymentsApi.list(),
        quickSalePaymentsApi.list()
      ]);
      setOrderPayments(orderData);
      setQuickSalePayments(quickSaleData);
      
      setEditingPayment(null);
    } catch (e) {
      setError('Falha ao atualizar pagamento');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    setEditAmount('');
    setEditMethod('');
    setEditPaidAt('');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Pagamentos</h1>
        <p className="text-gray-600">Controle de pagamentos e recebimentos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-600">Recebidos (Mês)</p>
          </div>
          <p className="text-gray-900">R$ {totalRecebidoMes.toFixed(2)}</p>
          <p className="text-gray-600 mt-1">{receivedThisMonth.length} pagamentos</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('todos')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'todos'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('recebidos')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'recebidos'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Recebidos (Mês)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h3 className="text-gray-900 mb-4">Lista de Pagamentos</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum pagamento encontrado</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <div key={p.id} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {/* Tipo de pagamento */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        p.type === 'order' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {p.type === 'order' ? (
                          <Package className="w-4 h-4" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                      </div>
                      
                      {/* Informações do pedido/venda */}
                      <div>
                        <div className="text-gray-900 font-medium">
                          {p.type === 'order' ? 'Encomenda' : 'Venda Rápida'}: #{p.orderId || p.quickSaleId}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <User className="w-3 h-3" />
                          {p.clientName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-gray-900 font-medium">R$ {p.amount.toFixed(2)}</div>
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar pagamento"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4" /> {p.method}
                    </span>
                    {p.paidAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {new Date(p.paidAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-medium">
                Editar Pagamento - {editingPayment.type === 'order' ? 'Encomenda' : 'Venda Rápida'} #{editingPayment.orderId || editingPayment.quickSaleId}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Valor do Pagamento</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Forma de Pagamento</label>
                <select
                  value={editMethod}
                  onChange={(e) => setEditMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Data do Pagamento</label>
                <input
                  type="date"
                  value={editPaidAt}
                  onChange={(e) => setEditPaidAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
