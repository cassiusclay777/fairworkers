import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Register = ({ onClose, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    username: '',
    display_name: ''
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

    // Validation
    if (!formData.email || !formData.password) {
      setError('Email a heslo jsou povinné');
      return;
    }

    if (formData.password.length < 8) {
      setError('Heslo musí mít alespoň 8 znaků');
      return;
    }

    // Password complexity validation (matches backend requirements) - simplified
    const passwordRegex = /^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Heslo musí obsahovat alespoň jeden speciální znak (@$!%*?&)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    setLoading(true);

    const result = await register({
      email: formData.email,
      password: formData.password,
      role: formData.role,
      username: formData.username || undefined,
      display_name: formData.display_name || undefined
    });

    setLoading(false);

    if (result.success) {
      onClose();
      window.location.href = formData.role === 'worker' ? '/dashboard/worker' : '/dashboard/client';
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
          Vytvořit účet
        </h2>
        <p className="text-white/60 mb-6">Připojte se k FairWorkers platformě</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selection */}
          <div>
            <label className="block text-white/80 mb-2 text-sm">Registrovat se jako</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'client' })}
                className={`p-3 rounded-lg border transition ${
                  formData.role === 'client'
                    ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                Klient
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'worker' })}
                className={`p-3 rounded-lg border transition ${
                  formData.role === 'worker'
                    ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                Modelka
              </button>
            </div>
          </div>

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
            <label className="block text-white/80 mb-2 text-sm">Uživatelské jméno (volitelné)</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500 transition"
              placeholder="uzivatel123"
            />
          </div>

          <div>
            <label className="block text-white/80 mb-2 text-sm">Zobrazované jméno (volitelné)</label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500 transition"
              placeholder="Jana Nováková"
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
              minLength={8}
            />
            <p className="text-xs text-white/40 mt-1">
              Heslo musí mít alespoň 8 znaků a obsahovat jeden speciální znak (@$!%*?&)
            </p>
          </div>

          <div>
            <label className="block text-white/80 mb-2 text-sm">Potvrdit heslo</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Vytváření účtu...' : 'Vytvořit účet'}
          </button>
        </form>

        <p className="mt-6 text-center text-white/60 text-sm">
          Už máte účet?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-primary-400 hover:text-primary-300 transition"
          >
            Přihlásit se
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
