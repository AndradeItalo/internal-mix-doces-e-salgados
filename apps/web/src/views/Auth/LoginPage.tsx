import { useState } from 'react';

interface LoginPageProps {
  onLogin: (password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-48">
            <img src="images/logo-mix-doces.png" alt="Logo Mix Doces" />
          </div>
          <h1 className="text-orange-600 mb-2">Mix Doces e Salgados</h1>
          <p className="text-gray-600">Sistema de Gestão de Encomendas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="123"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Use qualquer e-mail e senha para entrar
        </p>
      </div>
    </div>
  );
}
