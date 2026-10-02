import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Hexagon, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', formData);
      login(res.data.token, res.data.employee);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-highlight/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >

        <Link to="/" className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors mb-6">
    <ArrowLeft size={13} /> Back to home
  </Link>
        <Link to="/" className="block text-center mb-8">
          <span className="font-display text-2xl font-bold text-white">
            Work<span className="text-primary-light">Grid</span>
          </span>
        </Link>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-glow">
          <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="font-body text-muted text-sm mb-6">Log in to manage your team's allocations</p>

          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4"
            >
              {error}
            </motion.p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-xs text-muted uppercase tracking-wide">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-3 text-white font-body focus:outline-none focus:border-primary focus:shadow-glow transition-all"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-muted uppercase tracking-wide">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-3 text-white font-body focus:outline-none focus:border-primary focus:shadow-glow transition-all"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-light text-white font-body font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted mt-6 font-body">
            Don't have an account? <Link to="/register" className="text-primary-light hover:underline">Register</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;