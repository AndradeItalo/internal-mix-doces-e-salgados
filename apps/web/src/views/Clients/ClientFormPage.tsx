import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsApi, type Client } from '../../lib/clients';

export function ClientFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const c: Client = await clientsApi.get(id);
        setName(c.name || '');
        setPhone(c.phone || '');
        setNotes(c.notes || '');
        setError(null);
      } catch (e) {
        setError('Não foi possível carregar o cliente.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (id) {
        await clientsApi.update(id, { name, phone, notes });
      } else {
        await clientsApi.create({ name, phone, notes } as Omit<Client, 'id' | 'createdAt'>);
      }
      navigate('/clients');
    } catch (e) {
      setError('Erro ao salvar cliente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/clients');
  };

  return (
    <div className="p-8">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">
          {id ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
        <p className="text-gray-600">
          {id ? 'Atualize as informações do cliente' : 'Adicione um novo cliente'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        {error && (
          <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-gray-700 mb-2">
              Nome *
            </label>
            <input
              id="nome"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Nome do cliente"
              required
            />
          </div>

          <div>
            <label htmlFor="telefone" className="block text-gray-700 mb-2">
              Telefone (WhatsApp) *
            </label>
            <input
              id="telefone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="(11) 98765-4321"
              required
            />
          </div>

          <div>
            <label htmlFor="observacoes" className="block text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              id="observacoes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Informações adicionais sobre o cliente"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-60"
              disabled={loading}
            >
              <Save className="w-5 h-5" />
              {id ? 'Atualizar' : 'Salvar'} Cliente
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
