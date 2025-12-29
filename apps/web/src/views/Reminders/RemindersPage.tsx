import { useState, useEffect } from 'react';
import { Calendar, Bell, CheckCircle, X, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { remindersApi, type Reminder } from '../../lib/reminders';

export function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const remindersData = await remindersApi.list();
      setReminders(remindersData);
      setError(null);
    } catch (e) {
      setError('Falha ao carregar lembretes');
    } finally {
      setLoading(false);
    }
  };

  const getReminderStatus = (reminder: Reminder) => {
    if (reminder.isCompleted) return 'concluido';
    const now = new Date();
    const remindDate = new Date(reminder.remindAt);
    return remindDate < now ? 'atrasado' : 'pendente';
  };

  const lembretesAtivos = reminders.filter(r => !r.isCompleted && new Date(r.remindAt) >= new Date());
  const lembretesConcluidos = reminders.filter(r => r.isCompleted);
  const lembretesAtrasados = reminders.filter(r => !r.isCompleted && new Date(r.remindAt) < new Date());

  const handleMarcarConcluido = async (reminderId: string) => {
    try {
      await remindersApi.complete(reminderId);
      setReminders(reminders.map(r => 
        r.id === reminderId ? { ...r, isCompleted: true } : r
      ));
    } catch (e) {
      setError('Falha ao marcar lembrete como concluído');
    }
  };

  const handleExcluir = async (reminderId: string) => {
    setReminderToDelete(reminderId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reminderToDelete) return;
    
    try {
      await remindersApi.remove(reminderToDelete);
      setReminders(reminders.filter(r => r.id !== reminderToDelete));
      setShowDeleteModal(false);
      setReminderToDelete(null);
    } catch (e) {
      setError('Falha ao excluir lembrete');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setReminderToDelete(null);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await remindersApi.list().then(data => {
        setReminders(data);
        setError(null);
      });
    } catch (e) {
      setError('Falha ao atualizar lembretes');
    } finally {
      setRefreshing(false);
    }
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
          <h1 className="text-gray-900 mb-2">Lembretes Automáticos</h1>
          <p className="text-gray-600">Lembretes criados automaticamente a partir das datas de entrega das encomendas</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {refreshing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Verificar Encomendas
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

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
          
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando...
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Nenhum lembrete encontrado</p>
              <p className="text-gray-400 text-sm">
                Lembretes serão criados automaticamente quando encomendas com datas de entrega forem cadastradas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => {
                const status = getReminderStatus(reminder);
                return (
                  <div
                    key={reminder.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600`}>
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-gray-900">{reminder.message}</p>
                            <p className="text-gray-600">
                              {new Date(reminder.remindAt).toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full ${getStatusColor(status)}`}>
                          {status === 'pendente' ? 'Pendente' :
                           status === 'atrasado' ? 'Atrasado' :
                           'Concluído'}
                        </span>
                        {!reminder.isCompleted && (
                          <button
                            onClick={() => handleMarcarConcluido(reminder.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Marcar como concluído"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleExcluir(reminder.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir lembrete"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold">Confirmar Exclusão</h3>
                <p className="text-gray-600 text-sm">Tem certeza que deseja excluir este lembrete?</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-gray-700 text-sm">
                Esta ação não pode ser desfeita. O lembrete será permanentemente removido do sistema.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Sim, Excluir
              </button>
              <button
                onClick={cancelDelete}
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
