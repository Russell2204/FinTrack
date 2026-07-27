import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard', label: 'Дашборд', icon: '📊' },
  { to: '/incomes', label: 'Доходы', icon: '💰' },
  { to: '/expenses', label: 'Расходы', icon: '💸' },
  { to: '/income-sources', label: 'Источники', icon: '🏦' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-surface/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-1">
          <Link to="/dashboard" className="flex items-center gap-2 mr-8 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
              F
            </div>
            <span className="text-lg font-bold text-white hidden sm:block">FinTrack</span>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-primary/20 text-primary-light'
                      : 'text-[#a6adc8] hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <span className="mr-1.5">{link.icon}</span>
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <span className="text-sm text-[#a6adc8] hidden sm:block">
              {user.displayName || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#a6adc8] hover:text-danger hover:bg-danger/10 border border-white/5 transition-all duration-200 cursor-pointer"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
