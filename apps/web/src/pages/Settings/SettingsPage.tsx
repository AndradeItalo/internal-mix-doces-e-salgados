export function SettingsPage() {
  return null;
}

/*
import { useState } from 'react';
import { Save, Upload, Download, Cake } from 'lucide-react';

export function SettingsPage() {
  const [nomeLoja, setNomeLoja] = useState('Mix Doces e Salgados');
  const [nomeProprietaria, setNomeProprietaria] = useState('Miriam Vicente');
  const [telefone, setTelefone] = useState('(11) 98765-4321');
  const [email, setEmail] = useState('contato@doceriaencanto.com');
  
  const [notifEntregas, setNotifEntregas] = useState(true);
  const [notifPagamentos, setNotifPagamentos] = useState(true);
  const [notifVendas, setNotifVendas] = useState(false);

  const [formasPagamento, setFormasPagamento] = useState({
    pix: true,
    dinheiro: true,
    credito: true,
    debito: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Salvando configurações:', {
      nomeLoja,
      nomeProprietaria,
      telefone,
      email,
      notifEntregas,
      notifPagamentos,
      notifVendas,
      formasPagamento
    });
    alert('Configurações salvas com sucesso!');
  };

  const handleExportData = () => {
    console.log('Exportando dados...');
    alert('Dados exportados com sucesso!');
  };

  const handleBackup = () => {
    console.log('Realizando backup...');
    alert('Backup realizado com sucesso!');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do sistema</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-900 mb-4">Logo e Dados da Loja</h3>
          
          <div className="flex items-center gap-6 mb-6">
            <div className="w-48 h-24 flex items-center justify-center">
              <img src="images/logo-mix-doces.png" alt="Logo Mix Doces" />
            </div>
            <div>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Alterar Logo
              </button>
              <p className="text-gray-500 mt-2">PNG ou JPG (máx. 2MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nomeLoja" className="block text-gray-700 mb-2">
                Nome da Loja
              </label>
              <input
                id="nomeLoja"
                type="text"
                value={nomeLoja}
                onChange={(e) => setNomeLoja(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="nomeProprietaria" className="block text-gray-700 mb-2">
                Nome da Proprietária
              </label>
              <input
                id="nomeProprietaria"
                type="text"
                value={nomeProprietaria}
                onChange={(e) => setNomeProprietaria(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="telefone" className="block text-gray-700 mb-2">
                Telefone
              </label>
              <input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-900 mb-4">Preferências de Notificação</h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="text-gray-900">Notificar Entregas</p>
                <p className="text-gray-600">Receber lembretes de entregas programadas</p>
              </div>
              <input
                type="checkbox"
                checked={notifEntregas}
                onChange={(e) => setNotifEntregas(e.target.checked)}
                className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="text-gray-900">Notificar Pagamentos</p>
                <p className="text-gray-600">Receber lembretes de pagamentos pendentes</p>
              </div>
              <input
                type="checkbox"
                checked={notifPagamentos}
                onChange={(e) => setNotifPagamentos(e.target.checked)}
                className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="text-gray-900">Notificar Vendas</p>
                <p className="text-gray-600">Receber resumo diário de vendas</p>
              </div>
              <input
                type="checkbox"
                checked={notifVendas}
                onChange={(e) => setNotifVendas(e.target.checked)}
                className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-900 mb-4">Formas de Pagamento Aceitas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formasPagamento.pix}
                onChange={(e) => setFormasPagamento({...formasPagamento, pix: e.target.checked})}
                className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-gray-900">Pix</span>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formasPagamento.dinheiro}
                onChange={(e) => setFormasPagamento({...formasPagamento, dinheiro: e.target.checked})}
                className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-gray-900">Dinheiro</span>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formasPagamento.credito}
                onChange={(e) => setFormasPagamento({...formasPagamento, credito: e.target.checked})}
                className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-gray-900">Cartão de Crédito</span>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formasPagamento.debito}
                onChange={(e) => setFormasPagamento({...formasPagamento, debito: e.target.checked})}
                className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-gray-900">Cartão de Débito</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-900 mb-4">Backup e Exportação de Dados</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5" />
              Exportar Dados (CSV)
            </button>

            <button
              type="button"
              onClick={handleBackup}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5" />
              Fazer Backup Completo
            </button>
          </div>

          <p className="text-gray-500 mt-4">
            Faça backup dos seus dados regularmente para não perder informações importantes.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
}

*/
