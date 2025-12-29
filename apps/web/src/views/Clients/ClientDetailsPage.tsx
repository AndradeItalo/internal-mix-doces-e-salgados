import { ArrowLeft, Edit, MessageCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { clientsApi, type Client } from '../../lib/clients';

export function ClientDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await clientsApi.get(id);
        setClient(data);
        setError(null);
      } catch (e) {
        setError('Cliente não encontrado');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-8">
        <p className="text-gray-600">{error || 'Cliente não encontrado'}</p>
        <button onClick={() => navigate('/clients')} className="text-orange-600 hover:text-orange-700 mt-4">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/clients')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">{client.name}</h1>
            {client.phone && <p className="text-gray-600">{client.phone}</p>}
          </div>
          <div className="flex gap-3">
            {client.phone && (
              <button
                onClick={() => typeof window !== 'undefined' && window.open(`https://wa.me/${(client.phone ?? '').replace(/\D/g, '')}`, '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </button>
            )}
            <button
              onClick={() => navigate(`/clients/${client.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-5 h-5" />
              Editar
            </button>
          </div>
        </div>
      </div>

      {client.notes && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-900">
            <strong>Observações:</strong> {client.notes}
          </p>
        </div>
      )}
    </div>
  );
}
