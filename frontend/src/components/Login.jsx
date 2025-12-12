import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onClose, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email a heslo jsou povinné');
      return;
    }

    setLoading(true);

    const result = await login(formData.email, formData.password);

    setLoading(false);

    if (result.success) {
      onClose();
      // Redirect based on role
      const redirectPath = result.user.role === 'worker' ? '/dashboard/worker' : '/dashboard/client';
      window.location.href = redirectPath;
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-gold-400 bg-clip-text text-transparent">
          Přihlášení
        </h2>
        <p className="text-white/60 mb-6">Vítejte zpět na FairWorkers</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 mb-2 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500 transition"
              placeholder="vas@email.cz"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 mb-2 text-sm">Heslo</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-white/60">
              <input
                type="checkbox"
                className="mr-2 rounded border-white/10 bg-white/5 focus:ring-primary-500"
              />
              Zapamatovat si mě
            </label>
            <a href="#" className="text-primary-400 hover:text-primary-300 transition">
              Zapomenuté heslo?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Přihlašování...' : 'Přihlásit se'}
          </button>
        </form>

        <p className="mt-6 text-center text-white/60 text-sm">
          Nemáte účet?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-primary-400 hover:text-primary-300 transition"
          >
            Registrovat se
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
