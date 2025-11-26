import { useState } from 'react';
import { Plus, Calendar, Bell, CheckCircle, X } from 'lucide-react';
import { mockLembretes, mockClientes, mockEncomendas } from '../../lib/mockData';

export function RemindersPage() {
  const [showModal, setShowModal] = useState(false);
  const [tipo, setTipo] = useState<'entrega' | 'pagamento'>('entrega');
  const [dataProgramada, setDataProgramada] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [encomendaId, setEncomendaId] = useState('');

  const lembretesAtivos = mockLembretes.filter(l => l.status !== 'concluido');
  const lembretesConcluidos = mockLembretes.filter(l => l.status === 'concluido');
  const lembretesAtrasados = mockLembretes.filter(l => l.status === 'atrasado');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Criando lembrete:', {
      tipo,
      dataProgramada,
      mensagem,
      clienteId,
      encomendaId: encomendaId || undefined
    });
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setTipo('entrega');
    setDataProgramada('');
    setMensagem('');
    setClienteId('');
    setEncomendaId('');
  };

  const handleMarcarConcluido = (lembreteId: string) => {
    console.log('Marcando lembrete como concluído:', lembreteId);
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'entrega' ? Calendar : Bell;
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'entrega' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-700';
      case 'atrasado': return 'bg-red-100 text-red-700';
      case 'concluido': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Lembretes</h1>
          <p className="text-gray-600">Gerencie lembretes de entregas e pagamentos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Criar Lembrete
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-gray-600">Lembretes Ativos</p>
          </div>
          <p className="text-gray-900">{lembretesAtivos.length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-gray-600">Lembretes Atrasados</p>
          </div>
          <p className="text-gray-900">{lembretesAtrasados.length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-600">Lembretes Concluídos</p>
          </div>
          <p className="text-gray-900">{lembretesConcluidos.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h3 className="text-gray-900 mb-4">Todos os Lembretes</h3>
          
          {mockLembretes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum lembrete criado</p>
          ) : (
            <div className="space-y-3">
              {mockLembretes.map((lembrete) => {
                const Icon = getTipoIcon(lembrete.tipo);
                return (
                  <div
                    key={lembrete.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTipoColor(lembrete.tipo)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-gray-900">{lembrete.mensagem}</p>
                            <p className="text-gray-600">
                              {lembrete.cliente} • {new Date(lembrete.dataProgramada).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        {lembrete.encomendaId && (
                          <p className="text-gray-600 ml-11">Encomenda #{lembrete.encomendaId}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full ${getStatusColor(lembrete.status)}`}>
                          {lembrete.status === 'pendente' ? 'Pendente' :
                           lembrete.status === 'atrasado' ? 'Atrasado' :
                           'Concluído'}
                        </span>
                        {lembrete.status !== 'concluido' && (
                          <button
                            onClick={() => handleMarcarConcluido(lembrete.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Marcar como concluído"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">Criar Lembrete</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Tipo de Lembrete *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipo('entrega')}
                    className={`px-4 py-3 rounded-lg border transition-colors ${
                      tipo === 'entrega'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Calendar className="w-5 h-5 mx-auto mb-1" />
                    Entrega
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('pagamento')}
                    className={`px-4 py-3 rounded-lg border transition-colors ${
                      tipo === 'pagamento'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Bell className="w-5 h-5 mx-auto mb-1" />
                    Pagamento
                  </button>
                </div>
              </div>

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
                  {mockClientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                  ))}
                </select>
              </div>

              {clienteId && (
                <div>
                  <label htmlFor="encomenda" className="block text-gray-700 mb-2">
                    Encomenda (opcional)
                  </label>
                  <select
                    id="encomenda"
                    value={encomendaId}
                    onChange={(e) => setEncomendaId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Nenhuma encomenda</option>
                    {mockEncomendas
                      .filter(e => e.clienteId === clienteId)
                      .map(encomenda => (
                        <option key={encomenda.id} value={encomenda.id}>
                          Encomenda #{encomenda.id} - {new Date(encomenda.dataEntrega).toLocaleDateString('pt-BR')}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="data" className="block text-gray-700 mb-2">
                  Data Programada *
                </label>
                <input
                  id="data"
                  type="date"
                  value={dataProgramada}
                  onChange={(e) => setDataProgramada(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="mensagem" className="block text-gray-700 mb-2">
                  Mensagem *
                </label>
                <textarea
                  id="mensagem"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Descrição do lembrete"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Criar Lembrete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
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
