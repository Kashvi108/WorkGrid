import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';


const Navbar = ({ isEmployee = false }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/projects' && location.pathname.startsWith('/projects')) {
      return true;
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };



  // ✅ Employee Navbar: Only "My Work"
  if (isEmployee) {
    return (
      <nav className="sticky top-0 z-40 backdrop-blur-lg bg-background/70 border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-display text-xl font-bold text-white">
            Resource<span className="text-primary-light">Flow</span>
          </span>
          <div className="flex items-center gap-1">
            <Link
              to="/projects"
              className="relative font-body text-sm text-white px-3 py-1.5"
            >
              My Work
              <span className="absolute left-3 right-3 -bottom-[17px] h-[2px] bg-primary shadow-glow rounded-full" />
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="flex items-center gap-2.5 bg-surface border border-border rounded-full pl-1.5 pr-4 py-1.5">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <span className="font-mono text-[11px] font-bold text-primary-light">
                {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="leading-tight">
              <p className="font-body text-xs text-white">{user?.name}</p>
              <p className="font-mono text-[10px] uppercase text-muted">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="font-body text-sm text-muted hover:text-white border border-border hover:border-primary/50 rounded-lg px-4 py-2 transition-colors"
          >
            Log out
          </button>
        </div>
      </nav>
    );
  }

  // ✅ Admin Navbar: Dashboard | Projects | Employees
  return (
    <nav className="sticky top-0 z-40 backdrop-blur-lg bg-background/70 border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span className="font-display text-xl font-bold text-white">
          Resource<span className="text-primary-light">Flow</span>
        </span>
        <div className="flex items-center gap-1">
          <Link
            to="/dashboard"
            className={`relative font-body text-sm px-3 py-1.5 transition-colors ${
              isActive('/dashboard') ? 'text-white' : 'text-muted hover:text-white'
            }`}
          >
            Dashboard
            {isActive('/dashboard') && (
              <span className="absolute left-3 right-3 -bottom-[17px] h-[2px] bg-primary shadow-glow rounded-full" />
            )}
          </Link>
          <Link
            to="/projects"
            className={`relative font-body text-sm px-3 py-1.5 transition-colors ${
              isActive('/projects') ? 'text-white' : 'text-muted hover:text-white'
            }`}
          >
            Projects
            {isActive('/projects') && (
              <span className="absolute left-3 right-3 -bottom-[17px] h-[2px] bg-primary shadow-glow rounded-full" />
            )}
          </Link>
          <Link
            to="/employees"
            className={`relative font-body text-sm px-3 py-1.5 transition-colors ${
              isActive('/employees') ? 'text-white' : 'text-muted hover:text-white'
            }`}
          >
            Employees
            {isActive('/employees') && (
              <span className="absolute left-3 right-3 -bottom-[17px] h-[2px] bg-primary shadow-glow rounded-full" />
            )}
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="flex items-center gap-2.5 bg-surface border border-border rounded-full pl-1.5 pr-4 py-1.5">
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="font-mono text-[11px] font-bold text-primary-light">
              {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="leading-tight">
            <p className="font-body text-xs text-white">{user?.name}</p>
            <p className="font-mono text-[10px] uppercase text-muted">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="font-body text-sm text-muted hover:text-white border border-border hover:border-primary/50 rounded-lg px-4 py-2 transition-colors"
        >
          Log out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;