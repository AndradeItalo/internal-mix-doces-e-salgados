import { ArrowLeft, Edit, MessageCircle, ShoppingBag, DollarSign } from 'lucide-react';
import { mockClientes, mockEncomendas } from '../lib/mockData';

interface ClienteDetalhesProps {
  clienteId: string | null;
  onBack: () => void;
  onNavigate: (page: string, id?: string) => void;
}

export function ClienteDetalhes({ clienteId, onBack, onNavigate }: ClienteDetalhesProps) {
  const cliente = mockClientes.find(c => c.id === clienteId);
  const encomendasCliente = mockEncomendas.filter(e => e.clienteId === clienteId);

  if (!cliente) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Cliente não encontrado</p>
        <button onClick={onBack} className="text-pink-600 hover:text-pink-700 mt-4">
          Voltar
        </button>
      </div>
    );
  }

  const totalPago = encomendasCliente.reduce((acc, e) => acc + e.valorPago, 0);
  const totalPendente = encomendasCliente.reduce((acc, e) => acc + e.valorPendente, 0);

  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">{cliente.nome}</h1>
            <p className="text-gray-600">{cliente.telefone}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => typeof window !== 'undefined' && window.open(`https://wa.me/${cliente.telefone.replace(/\D/g, '')}`, '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </button>
            <button
              onClick={() => onNavigate('editar-cliente', clienteId ?? undefined)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-5 h-5" />
              Editar
            </button>
          </div>
        </div>
      </div>

      {cliente.observacoes && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-900">
            <strong>Observações:</strong> {cliente.observacoes}
          </p>
        </div>
      )}

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-600">Total de Encomendas</p>
          </div>
          <p className="text-gray-900">{cliente.totalEncomendas}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-600">Total Pago</p>
          </div>
          <p className="text-gray-900">R$ {totalPago.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-gray-600">Total Pendente</p>
          </div>
          <p className="text-gray-900">R$ {totalPendente.toFixed(2)}</p>
        </div>
      </div>

      {/* Encomendas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-gray-900 mb-4">Histórico de Encomendas</h2>
        
        {encomendasCliente.length === 0 ? (
          <p className="text-gray-500">Nenhuma encomenda encontrada</p>
        ) : (
          <div className="space-y-4">
            {encomendasCliente.map(encomenda => (
              <div
                key={encomenda.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 transition-colors cursor-pointer"
                onClick={() => onNavigate('encomenda-detalhes', encomenda.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-white ${
                      encomenda.status === 'pago' ? 'bg-green-500' :
                      encomenda.status === 'parcial' ? 'bg-yellow-500' :
                      encomenda.status === 'pendente' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}>
                      {encomenda.status === 'pago' ? 'Pago' :
                       encomenda.status === 'parcial' ? 'Parcial' :
                       encomenda.status === 'pendente' ? 'Pendente' :
                       'Cancelado'}
                    </span>
                    <span className="text-gray-600">
                      Entrega: {new Date(encomenda.dataEntrega).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-gray-900">R$ {encomenda.valorTotal.toFixed(2)}</p>
                </div>
                
                <div className="text-gray-600">
                  <p>{encomenda.items.length} {encomenda.items.length === 1 ? 'item' : 'itens'}</p>
                  {encomenda.valorPendente > 0 && (
                    <p className="text-orange-600">Pendente: R$ {encomenda.valorPendente.toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPendente > 0 && (
        <div className="mt-6">
          <button
            onClick={() => typeof window !== 'undefined' && window.open(`https://wa.me/${cliente.telefone.replace(/\D/g, '')}?text=Olá ${cliente.nome}, tudo bem? Gostaria de lembrar sobre o pagamento pendente de R$ ${totalPendente.toFixed(2)}. Obrigada!`, '_blank')}
            className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Enviar Lembrete de Pagamento
          </button>
        </div>
      )}
    </div>
  );
}
