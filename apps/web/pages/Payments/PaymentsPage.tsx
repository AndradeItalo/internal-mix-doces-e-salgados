import { useEffect, useMemo, useState } from 'react';
import { DollarSign, Calendar, CreditCard, Loader2, Package, ShoppingCart, User } from 'lucide-react';
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
                    <div className="text-gray-900 font-medium">R$ {p.amount.toFixed(2)}</div>
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
    </div>
  );
}
