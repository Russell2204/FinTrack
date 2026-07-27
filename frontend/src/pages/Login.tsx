import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-primary/25">
            F
          </div>
          <h1 className="text-2xl font-bold text-white">Добро пожаловать</h1>
          <p className="text-[#a6adc8] mt-1">Войдите в свой аккаунт FinTrack</p>
        </div>

        <div className="bg-surface rounded-2xl border border-white/5 p-8 shadow-2xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#bac2de] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-surface-light rounded-xl border border-white/5 text-white placeholder-[#585b70] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#bac2de] mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Минимум 8 символов"
                className="w-full px-4 py-2.5 bg-surface-light rounded-xl border border-white/5 text-white placeholder-[#585b70] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm animate-scale-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-medium hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Вход...
                </span>
              ) : 'Войти'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#a6adc8] mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-primary-light hover:text-primary font-medium transition-colors duration-200">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
