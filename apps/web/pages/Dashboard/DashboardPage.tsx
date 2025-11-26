import { DollarSign, ShoppingBag, TrendingUp, AlertCircle, Package } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockEncomendas, mockVendasRapidas, mockLembretes, mockProdutos } from '../../lib/mockData';

export function DashboardPage() {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const encomendasMes = mockEncomendas.filter(e => {
    const date = new Date(e.dataCriacao);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const vendasMes = mockVendasRapidas.filter(v => {
    const date = new Date(v.data);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalVendasMes = encomendasMes.reduce((acc, e) => acc + e.valorTotal, 0) + 
                         vendasMes.reduce((acc, v) => acc + v.valorTotal, 0);
  
  const totalEncomendas = encomendasMes.length;
  const totalRecebido = encomendasMes.reduce((acc, e) => acc + e.valorPago, 0);
  const totalPendente = encomendasMes.reduce((acc, e) => acc + e.valorPendente, 0);

  const produtosVendidos: { [key: string]: { nome: string; quantidade: number } } = {};
  
  encomendasMes.forEach(encomenda => {
    encomenda.items.forEach(item => {
      if (produtosVendidos[item.produtoId]) {
        produtosVendidos[item.produtoId].quantidade += item.quantidade;
      } else {
        produtosVendidos[item.produtoId] = {
          nome: item.produto,
          quantidade: item.quantidade
        };
      }
    });
  });

  const produtosMaisVendidos = Object.values(produtosVendidos)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5)
    .map(p => ({ nome: p.nome, quantidade: p.quantidade }));

  const vendasTimeline = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const vendasDia = mockVendasRapidas
      .filter(v => v.data === dateStr)
      .reduce((acc, v) => acc + v.valorTotal, 0);
    
    const encomendasDia = mockEncomendas
      .filter(e => e.dataCriacao === dateStr)
      .reduce((acc, e) => acc + e.valorPago, 0);
    
    return {
      dia: date.getDate() + '/' + (date.getMonth() + 1),
      valor: vendasDia + encomendasDia
    };
  });

  const proximasEntregas = mockEncomendas
    .filter(e => new Date(e.dataEntrega) >= new Date() && e.status !== 'cancelado')
    .sort((a, b) => new Date(a.dataEntrega).getTime() - new Date(b.dataEntrega).getTime())
    .slice(0, 5);

  const pagamentosPendentes = mockEncomendas
    .filter(e => e.valorPendente > 0)
    .sort((a, b) => new Date(a.dataEntrega).getTime() - new Date(b.dataEntrega).getTime())
    .slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Total de Vendas (Mês)</p>
          <p className="text-gray-900">R$ {totalVendasMes.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Encomendas (Mês)</p>
          <p className="text-gray-900">{totalEncomendas}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Total Recebido</p>
          <p className="text-gray-900">R$ {totalRecebido.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Total Pendente</p>
          <p className="text-gray-900">R$ {totalPendente.toFixed(2)}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Produtos mais vendidos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 mb-6">Produtos Mais Vendidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={produtosMaisVendidos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#ec4899" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Linha do tempo de vendas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 mb-6">Vendas dos Últimos 7 Dias</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vendasTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#ec4899" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas entregas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 mb-4">Próximas Entregas</h3>
          <div className="space-y-3">
            {proximasEntregas.length === 0 ? (
              <p className="text-gray-500">Nenhuma entrega programada</p>
            ) : (
              proximasEntregas.map(encomenda => (
                <div key={encomenda.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-gray-900">{encomenda.cliente}</p>
                    <p className="text-gray-600">
                      {new Date(encomenda.dataEntrega).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    R$ {encomenda.valorTotal.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagamentos pendentes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 mb-4">Pagamentos Pendentes</h3>
          <div className="space-y-3">
            {pagamentosPendentes.length === 0 ? (
              <p className="text-gray-500">Nenhum pagamento pendente</p>
            ) : (
              pagamentosPendentes.map(encomenda => (
                <div key={encomenda.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-gray-900">{encomenda.cliente}</p>
                    <p className="text-gray-600">
                      Entrega: {new Date(encomenda.dataEntrega).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                    R$ {encomenda.valorPendente.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
