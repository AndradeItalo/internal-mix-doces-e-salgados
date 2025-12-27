import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { ordersApi, type Order } from '../../lib/orders';

export function OrdersAgendaPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await ordersApi.list();
        setOrders(data);
        setError(null);
      } catch (e) {
        setError('Erro ao carregar encomendas');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'entregue':
        return 'bg-blue-100 text-blue-700';
      case 'pago':
        return 'bg-green-100 text-green-700';
      case 'parcial':
        return 'bg-yellow-100 text-yellow-700';
      case 'pendente':
        return 'bg-orange-100 text-orange-700';
      case 'cancelado':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'entregue':
        return 'Entregue';
      case 'pago':
        return 'Pago';
      case 'parcial':
        return 'Parcial';
      case 'pendente':
        return 'Pendente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const sorted = useMemo(() => {
    const toSortKey = (o: Order) => {
      if (!o.deliveryAt) return Number.POSITIVE_INFINITY;

      const d = new Date(o.deliveryAt);
      const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const hhmm = (o.deliveryHour || '').trim();
      const [hh, mm] = hhmm.split(':');
      const minutes = Number.isFinite(Number(hh)) && Number.isFinite(Number(mm)) ? Number(hh) * 60 + Number(mm) : 0;
      return midnight + minutes * 60_000;
    };

    return [...orders].sort((a, b) => toSortKey(a) - toSortKey(b));
  }, [orders]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">Agenda de Encomendas</h1>
            <p className="text-gray-600">Ordenado por data e horário de entrega</p>
          </div>

          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Ver lista
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
          Carregando...
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : sorted.length === 0 ? (
        <div className="text-gray-600">Nenhuma encomenda encontrada</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((o) => (
            <button
              key={o.id}
              onClick={() => navigate(`/orders/${o.id}`)}
              className="text-left bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-orange-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-gray-900 font-medium">
                    {o.client?.name || o.clientId}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-gray-600 text-sm">
                    <CalendarDays className="w-4 h-4" />
                    <span>
                      {o.deliveryAt ? new Date(o.deliveryAt).toLocaleDateString('pt-BR') : 'Sem data'}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-gray-600 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{o.deliveryHour ? o.deliveryHour : '—'}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(o.status)}`}>
                  {getStatusLabel(o.status)}
                </div>
                <div className="text-gray-900">R$ {o.total.toFixed(2)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
