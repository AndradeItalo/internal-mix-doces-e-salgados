import { useState } from 'react';
import { ArrowLeft, Edit, CheckCircle, XCircle, DollarSign, Package } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockEncomendas } from '../../lib/mockData';

export function OrderDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [valorPagamento, setValorPagamento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [observacaoPagamento, setObservacaoPagamento] = useState('');

  const encomenda = mockEncomendas.find(e => e.id === id);

  if (!encomenda) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Encomenda não encontrada</p>
        <button onClick={() => navigate('/orders')} className="text-orange-600 hover:text-orange-700 mt-4">
          Voltar
        </button>
      </div>
    );
  }

  const handleRegistrarPagamento = () => {
    console.log('Registrando pagamento:', { valorPagamento, formaPagamento, observacaoPagamento });
    setShowPagamentoModal(false);
    setValorPagamento('');
    setObservacaoPagamento('');
  };

  const handleMarcarEntregue = () => {
    console.log('Marcando como entregue');
  };

  const handleCancelar = () => {
    if (confirm('Tem certeza que deseja cancelar esta encomenda?')) {
      console.log('Cancelando encomenda');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-500';
      case 'parcial': return 'bg-yellow-500';
      case 'pendente': return 'bg-orange-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'parcial': return 'Parcialmente Pago';
      case 'pendente': return 'Pagamento Pendente';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="p-8">
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
            <p className="text-gray-600">Encomenda #{encomenda.id}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/orders/${encomenda.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-5 h-5" />
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6">
        <span className={`inline-flex px-4 py-2 rounded-full text-white ${getStatusColor(encomenda.status)}`}>
          {getStatusLabel(encomenda.status)}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-600">Valor Total</p>
          </div>
          <p className="text-gray-900">R$ {encomenda.valorTotal.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-600">Valor Pago</p>
          </div>
          <p className="text-gray-900">R$ {encomenda.valorPago.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-gray-600">Valor Pendente</p>
          </div>
          <p className="text-gray-900">R$ {encomenda.valorPendente.toFixed(2)}</p>
        </div>
      </div>

      {/* Informações */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-gray-900 mb-4">Informações</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 mb-1">Cliente</p>
            <p className="text-gray-900">{encomenda.cliente}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Data de Entrega</p>
            <p className="text-gray-900">{new Date(encomenda.dataEntrega).toLocaleDateString('pt-BR')}</p>
          </div>
          {encomenda.observacoes && (
            <div className="md:col-span-2">
              <p className="text-gray-600 mb-1">Observações</p>
              <p className="text-gray-900">{encomenda.observacoes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Itens */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-gray-900 mb-4">Itens da Encomenda</h3>
        <div className="space-y-3">
          {encomenda.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-900">{item.produto}</p>
                <p className="text-gray-600">
                  {item.quantidade} x R$ {item.valorUnitario.toFixed(2)}
                </p>
              </div>
              <p className="text-gray-900">R$ {item.valorTotal.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de Pagamentos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-gray-900 mb-4">Histórico de Pagamentos</h3>
        {encomenda.pagamentos.length === 0 ? (
          <p className="text-gray-500">Nenhum pagamento registrado</p>
        ) : (
          <div className="space-y-3">
            {encomenda.pagamentos.map((pagamento) => (
              <div key={pagamento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-900">R$ {pagamento.valor.toFixed(2)}</p>
                  <p className="text-gray-600">
                    {pagamento.formaPagamento} • {new Date(pagamento.data).toLocaleDateString('pt-BR')}
                  </p>
                  {pagamento.observacao && (
                    <p className="text-gray-600">{pagamento.observacao}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {encomenda.valorPendente > 0 && (
          <button
            onClick={() => setShowPagamentoModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            Registrar Pagamento
          </button>
        )}
        
        {encomenda.status !== 'cancelado' && (
          <button
            onClick={handleMarcarEntregue}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Marcar como Entregue
          </button>
        )}

        {encomenda.status !== 'cancelado' && (
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
                    max={encomenda.valorPendente}
                    value={valorPagamento}
                    onChange={(e) => setValorPagamento(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={`Máximo: ${encomenda.valorPendente.toFixed(2)}`}
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
    </div>
  );
}
