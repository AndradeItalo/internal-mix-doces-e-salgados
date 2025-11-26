import { useState } from 'react';
import { mockEncomendas } from '../../lib/mockData';
import { DollarSign, Calendar, CreditCard } from 'lucide-react';

export function PaymentsPage() {
  const [filter, setFilter] = useState<'todos' | 'pendentes' | 'recebidos'>('todos');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const pagamentosPendentes = mockEncomendas
    .filter(e => e.valorPendente > 0)
    .map(e => ({
      encomendaId: e.id,
      cliente: e.cliente,
      valor: e.valorPendente,
      dataEntrega: e.dataEntrega,
      status: 'pendente' as const
    }));

  const pagamentosRecebidos = mockEncomendas
    .flatMap(e => 
      e.pagamentos.map(p => ({
        encomendaId: e.id,
        cliente: e.cliente,
        valor: p.valor,
        data: p.data,
        formaPagamento: p.formaPagamento,
        observacao: p.observacao,
        status: 'recebido' as const
      }))
    )
    .filter(p => {
      const date = new Date(p.data);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

  const pagamentosAtrasados = mockEncomendas
    .filter(e => e.valorPendente > 0 && new Date(e.dataEntrega) < new Date())
    .map(e => ({
      encomendaId: e.id,
      cliente: e.cliente,
      valor: e.valorPendente,
      dataEntrega: e.dataEntrega,
      status: 'atrasado' as const
    }));

  const allPagamentos = [...pagamentosPendentes, ...pagamentosRecebidos, ...pagamentosAtrasados];

  const filteredPagamentos = allPagamentos.filter(p => {
    if (filter === 'todos') return true;
    if (filter === 'pendentes') return p.status === 'pendente' || p.status === 'atrasado';
    if (filter === 'recebidos') return p.status === 'recebido';
    return true;
  });

  const totalPendente = pagamentosPendentes.reduce((acc, p) => acc + p.valor, 0);
  const totalRecebido = pagamentosRecebidos.reduce((acc, p) => acc + p.valor, 0);
  const totalAtrasado = pagamentosAtrasados.reduce((acc, p) => acc + p.valor, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Pagamentos</h1>
        <p className="text-gray-600">Controle de pagamentos e recebimentos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-gray-600">Pendentes</p>
          </div>
          <p className="text-gray-900">R$ {totalPendente.toFixed(2)}</p>
          <p className="text-gray-600 mt-1">{pagamentosPendentes.length} pagamentos</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-600">Recebidos (Mês)</p>
          </div>
          <p className="text-gray-900">R$ {totalRecebido.toFixed(2)}</p>
          <p className="text-gray-600 mt-1">{pagamentosRecebidos.length} pagamentos</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-gray-600">Atrasados</p>
          </div>
          <p className="text-gray-900">R$ {totalAtrasado.toFixed(2)}</p>
          <p className="text-gray-600 mt-1">{pagamentosAtrasados.length} pagamentos</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('todos')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'todos'
                ? 'bg-pink-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('pendentes')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pendentes'
                ? 'bg-pink-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter('recebidos')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'recebidos'
                ? 'bg-pink-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Recebidos
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h3 className="text-gray-900 mb-4">Lista de Pagamentos</h3>
          
          {filteredPagamentos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum pagamento encontrado</p>
          ) : (
            <div className="space-y-3">
              {filteredPagamentos.map((pagamento, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    pagamento.status === 'recebido' ? 'bg-green-50 border-green-500' :
                    pagamento.status === 'atrasado' ? 'bg-red-50 border-red-500' :
                    'bg-orange-50 border-orange-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-gray-900">{pagamento.cliente}</p>
                      <div className="flex items-center gap-4 text-gray-600 mt-1">
                        {pagamento.status === 'recebido' ? (
                          <>
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-4 h-4" />
                              {(pagamento as any).formaPagamento}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date((pagamento as any).data).toLocaleDateString('pt-BR')}
                            </span>
                            {(pagamento as any).observacao && (
                              <span>{(pagamento as any).observacao}</span>
                            )}
                          </>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Entrega: {new Date((pagamento as any).dataEntrega).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-gray-900 ${
                        pagamento.status === 'recebido'
                          ? 'text-green-700'
                          : pagamento.status === 'atrasado'
                          ? 'text-red-700'
                          : 'text-orange-700'
                      }`}>
                        R$ {pagamento.valor.toFixed(2)}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 rounded text-white ${
                          pagamento.status === 'recebido'
                            ? 'bg-green-500'
                            : pagamento.status === 'atrasado'
                            ? 'bg-red-500'
                            : 'bg-orange-500'
                        }`}
                      >
                        {pagamento.status === 'recebido'
                          ? 'Recebido'
                          : pagamento.status === 'atrasado'
                          ? 'Atrasado'
                          : 'Pendente'}
                      </span>
                    </div>
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
