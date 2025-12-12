import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';

const AIMatchmaking = ({ onClose, onWorkerSelect }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState({
    location: '',
    minRating: 4.0,
    maxPrice: 3000,
    language: '',
    serviceTypes: [],
    verifiedOnly: false
  });
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    if (user?.role === 'client') {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async (customPreferences = null) => {
    try {
      setLoading(true);
      setError('');

      const prefsToUse = customPreferences || preferences;
      const response = await api.get('/ai/matchmaking', {
        params: {
          preferences: JSON.stringify(prefsToUse)
        }
      });

      if (response.data.success) {
        setMatches(response.data.matches);
      } else {
        setError('Nepodařilo se načíst doporučení');
      }
    } catch (err) {
      console.error('AI Matchmaking error:', err);
      setError('Chyba při hledání matchů. Zkuste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyPreferences = () => {
    setShowPreferences(false);
    fetchMatches(preferences);
  };

  const getCompatibilityColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-green-300';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-yellow-300';
    return 'text-red-400';
  };

  const getCompatibilityBadge = (score) => {
    if (score >= 90) return '🎯 Perfektní';
    if (score >= 80) return '⭐ Vynikající';
    if (score >= 70) return '👍 Velmi dobrý';
    if (score >= 60) return '✅ Dobrý';
    return '🔍 Základní';
  };

  if (user?.role !== 'client') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md p-8 text-center border bg-gradient-to-br from-gray-900 to-black border-white/10 rounded-2xl">
          <div className="mb-4 text-6xl">🤖</div>
          <h2 className="mb-4 text-2xl font-bold text-white">AI Matchmaking</h2>
          <p className="mb-6 text-white/60">
            Tato funkce je dostupná pouze pro klienty.
          </p>
          <button
            onClick={onClose}
            className="w-full btn-primary"
          >
            Zavřít
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-primary-400 to-gold-400 bg-clip-text">
                🤖 AI Matchmaking
              </h2>
              <p className="mt-1 text-white/60">
                Inteligentní doporučení na míru
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="px-4 py-2 transition rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
              >
                ⚙️ Preference
              </button>
              <button
                onClick={onClose}
                className="p-2 transition text-white/60 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Panel */}
        {showPreferences && (
          <div className="p-6 border-b bg-white/5 border-white/10">
            <h3 className="mb-4 text-xl font-bold text-white">Nastavení preferencí</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-white/80">Lokalita</label>
                <select
                  value={preferences.location}
                  onChange={(e) => handlePreferenceChange('location', e.target.value)}
                  className="w-full px-3 py-2 text-white border rounded-lg bg-white/5 border-white/10"
                >
                  <option value="">Všechny lokality</option>
                  <option value="Praha">Praha</option>
                  <option value="Brno">Brno</option>
                  <option value="Ostrava">Ostrava</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-white/80">Minimální hodnocení</label>
                <select
                  value={preferences.minRating}
                  onChange={(e) => handlePreferenceChange('minRating', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-white border rounded-lg bg-white/5 border-white/10"
                >
                  <option value={3.0}>3.0+ ⭐</option>
                  <option value={3.5}>3.5+ ⭐⭐</option>
                  <option value={4.0}>4.0+ ⭐⭐⭐</option>
                  <option value={4.5}>4.5+ ⭐⭐⭐⭐</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-white/80">Maximální cena (Kč/h)</label>
                <input
                  type="number"
                  value={preferences.maxPrice}
                  onChange={(e) => handlePreferenceChange('maxPrice', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-white border rounded-lg bg-white/5 border-white/10"
                  min="500"
                  max="10000"
                  step="100"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verifiedOnly"
                  checked={preferences.verifiedOnly}
                  onChange={(e) => handlePreferenceChange('verifiedOnly', e.target.checked)}
                  className="mr-2 rounded border-white/10 bg-white/5 focus:ring-primary-500"
                />
                <label htmlFor="verifiedOnly" className="text-white/80">
                  Pouze ověřené pracovnice
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 transition rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
              >
                Zrušit
              </button>
              <button
                onClick={applyPreferences}
                className="btn-primary"
              >
                Použít preference
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary-500"></div>
              <p className="text-white/60">AI analyzuje vaše preference...</p>
            </div>
          )}

          {error && (
            <div className="py-8 text-center">
              <div className="mb-4 text-6xl">😕</div>
              <p className="mb-4 text-white/60">{error}</p>
              <button
                onClick={fetchMatches}
                className="btn-primary"
              >
                Zkusit znovu
              </button>
            </div>
          )}

          {!loading && !error && matches.length === 0 && (
            <div className="py-12 text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-xl font-bold text-white">Žádné matchy nenalezeny</h3>
              <p className="mb-6 text-white/60">
                Zkuste upravit své preference nebo zkuste později.
              </p>
              <button
                onClick={() => setShowPreferences(true)}
                className="btn-primary"
              >
                Upravit preference
              </button>
            </div>
          )}

          {!loading && !error && matches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Našli jsme {matches.length} perfektních matchů
                  </h3>
                  <p className="text-white/60">
                    Seřazeno podle kompatibility s vašimi preferencemi
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-400">
                    {matches.filter(m => m.recommended).length}
                  </div>
                  <div className="text-sm text-white/60">Doporučené</div>
                </div>
              </div>

              <div className="space-y-4">
                {matches.map((match, index) => (
                  <div
                    key={match.worker.id}
                    className={`bg-white/5 border rounded-xl p-4 hover:bg-white/10 transition cursor-pointer ${
                      match.recommended 
                        ? 'border-primary-500/50 bg-primary-500/10' 
                        : 'border-white/10'
                    }`}
                    onClick={() => onWorkerSelect && onWorkerSelect(match.worker)}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Worker Avatar */}
                      <div className="flex-shrink-0">
                        <img
                          src={match.worker.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.worker.username)}&size=80`}
                          alt={match.worker.display_name}
                          className="object-cover w-16 h-16 rounded-full"
                        />
                        {match.recommended && (
                          <div className="mt-2 text-center">
                            <span className="px-2 py-1 text-xs text-white rounded-full bg-primary-500">
                              Doporučeno
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Worker Info */}
                      <div className="flex-grow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-white">
                              {match.worker.display_name || match.worker.username}
                            </h4>
                            <p className="text-sm text-white/60">
                              {match.worker.location} • {match.worker.hourly_rate} Kč/h
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getCompatibilityColor(match.compatibility.score)}`}>
                              {match.compatibility.score}%
                            </div>
                            <div className="text-sm text-white/60">
                              {getCompatibilityBadge(match.compatibility.score)}
                            </div>
                          </div>
                        </div>

                        {/* Compatibility Reasons */}
                        {match.compatibility.reasons.length > 0 && (
                          <div className="mt-3">
                            <p className="mb-2 text-sm text-white/70">
                              Proč je to dobrý match:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {match.compatibility.reasons.map((reason, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs text-green-400 rounded-full bg-green-500/20"
                                >
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Worker Stats */}
                        <div className="flex mt-3 space-x-6 text-sm">
                          <div className="flex items-center space-x-1">
                            <span className="text-gold-400">⭐</span>
                            <span className="text-white/80">{match.worker.rating || 'Nový'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-primary-400">💼</span>
                            <span className="text-white/80">{match.worker.total_bookings || 0} rezervací</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-green-400">🟢</span>
                            <span className="text-white/80">
                              {match.worker.is_available ? 'Dostupná' : 'Momentálně nedostupná'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/60">
              🤖 AI Matchmaking v1.0 • {matches.length} matchů
            </div>
            <button
              onClick={fetchMatches}
              className="px-4 py-2 transition rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
            >
              🔄 Aktualizovat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMatchmaking;
