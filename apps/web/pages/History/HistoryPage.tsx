import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockEncomendas, mockVendasRapidas, mockProdutos } from '../../lib/mockData';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function HistoryPage() {
  const [filtroMes, setFiltroMes] = useState('todos');
  const [filtroProduto, setFiltroProduto] = useState('todos');

  const meses = ['todos', 'Novembro', 'Dezembro'];

  const produtosVendidos: { [key: string]: { nome: string; quantidade: number; total: number } } = {};

  mockEncomendas.forEach(encomenda => {
    encomenda.items.forEach(item => {
      if (produtosVendidos[item.produtoId]) {
        produtosVendidos[item.produtoId].quantidade += item.quantidade;
        produtosVendidos[item.produtoId].total += item.valorTotal;
      } else {
        produtosVendidos[item.produtoId] = {
          nome: item.produto,
          quantidade: item.quantidade,
          total: item.valorTotal
        };
      }
    });
  });

  const produtosMaisVendidos = Object.entries(produtosVendidos)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const vendasPorMes = [
    { mes: 'Jun', vendas: 2500 },
    { mes: 'Jul', vendas: 3200 },
    { mes: 'Ago', vendas: 2800 },
    { mes: 'Set', vendas: 4100 },
    { mes: 'Out', vendas: 3900 },
    { mes: 'Nov', vendas: 4500 },
  ];

  const mesAtual = vendasPorMes[vendasPorMes.length - 1].vendas;
  const mesAnterior = vendasPorMes[vendasPorMes.length - 2].vendas;
  const crescimento = ((mesAtual - mesAnterior) / mesAnterior) * 100;

  const totalVendasEncomendas = mockEncomendas.reduce((acc, e) => acc + e.valorTotal, 0);
  const totalVendasRapidas = mockVendasRapidas.reduce((acc, v) => acc + v.valorTotal, 0);
  const totalGeral = totalVendasEncomendas + totalVendasRapidas;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Histórico</h1>
        <p className="text-gray-600">Análise de vendas e desempenho</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-2">Vendas Totais</p>
          <p className="text-gray-900 mb-1">R$ {totalGeral.toFixed(2)}</p>
          <p className="text-gray-600">{mockEncomendas.length} encomendas</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-2">Crescimento (Mês)</p>
          <div className="flex items-center gap-2 mb-1">
            <p className={`text-gray-900 ${crescimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {crescimento >= 0 ? '+' : ''}{crescimento.toFixed(1)}%
            </p>
            {crescimento >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className="text-gray-600">Em relação ao mês anterior</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-2">Ticket Médio</p>
          <p className="text-gray-900 mb-1">
            R$ {(totalVendasEncomendas / mockEncomendas.length).toFixed(2)}
          </p>
          <p className="text-gray-600">Por encomenda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="mes" className="block text-gray-700 mb-2">
            Filtrar por Mês
          </label>
          <select
            id="mes"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {meses.map(mes => (
              <option key={mes} value={mes}>
                {mes === 'todos' ? 'Todos os Meses' : mes}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="produto" className="block text-gray-700 mb-2">
            Filtrar por Produto
          </label>
          <select
            id="produto"
            value={filtroProduto}
            onChange={(e) => setFiltroProduto(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="todos">Todos os Produtos</option>
            {mockProdutos.map(produto => (
              <option key={produto.id} value={produto.id}>
                {produto.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 mb-6">Vendas por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vendasPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="vendas" stroke="#ec4899" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 mb-6">Produtos Mais Vendidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={produtosMaisVendidos.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#ec4899" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h3 className="text-gray-900 mb-4">Detalhamento por Produto</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 text-gray-700">Produto</th>
                  <th className="text-left py-3 text-gray-700">Quantidade Vendida</th>
                  <th className="text-left py-3 text-gray-700">Total em Vendas</th>
                </tr>
              </thead>
              <tbody>
                {produtosMaisVendidos.map((produto) => (
                  <tr key={produto.id} className="border-b border-gray-100">
                    <td className="py-3 text-gray-900">{produto.nome}</td>
                    <td className="py-3 text-gray-600">{produto.quantidade}</td>
                    <td className="py-3 text-gray-900">R$ {produto.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
