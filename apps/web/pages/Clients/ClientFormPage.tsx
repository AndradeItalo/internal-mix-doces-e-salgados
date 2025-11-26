import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockClientes } from '../../lib/mockData';

export function ClientFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (id) {
      const cliente = mockClientes.find(c => c.id === id);
      if (cliente) {
        setNome(cliente.nome);
        setTelefone(cliente.telefone);
        setObservacoes(cliente.observacoes || '');
      }
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Salvando cliente:', { nome, telefone, observacoes });
    navigate('/clients');
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-gray-700 mb-2">
              Nome *
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
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
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
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
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Informações adicionais sobre o cliente"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              Salvar Cliente
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
