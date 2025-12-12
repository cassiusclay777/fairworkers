import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const Analytics = ({ onClose }) => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('week'); // 'week', 'month', 'year'
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/analytics/${user.id}?period=${period}`);
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Demo data
      setAnalytics({
        earnings: {
          daily: [450, 620, 580, 720, 890, 540, 680],
          labels: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
        },
        streams: {
          count: 15,
          totalViewers: 3420,
          avgViewers: 228,
          totalDuration: 1820 // minutes
        },
        calls: {
          count: 8,
          totalDuration: 420,
          avgDuration: 52.5
        },
        tips: {
          count: 42,
          total: 8500,
          avgTip: 202
        },
        bestTimes: [
          { day: 'Pátek', time: '20:00-22:00', viewers: 380 },
          { day: 'Sobota', time: '19:00-21:00', viewers: 350 },
          { day: 'Čtvrtek', time: '21:00-23:00', viewers: 290 }
        ],
        topFans: [
          { name: 'Jan K.', spent: 3500, rank: 1 },
          { name: 'Petr M.', spent: 2800, rank: 2 },
          { name: 'David S.', spent: 2100, rank: 3 }
        ],
        demographics: {
          age: [
            { range: '18-24', percent: 15 },
            { range: '25-34', percent: 45 },
            { range: '35-44', percent: 30 },
            { range: '45+', percent: 10 }
          ],
          locations: [
            { city: 'Praha', percent: 35 },
            { city: 'Brno', percent: 20 },
            { city: 'Ostrava', percent: 15 },
            { city: 'Plzeň', percent: 10 },
            { city: 'Ostatní', percent: 20 }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    alert('Export do PDF připravuji...');
  };

  const exportToExcel = () => {
    alert('Export do Excel připravuji...');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="text-white text-2xl">⏳ Načítám analytics...</div>
      </div>
    );
  }

  const maxEarnings = Math.max(...analytics.earnings.daily);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">📊 Advanced Analytics</h1>
              <p className="text-white/60">Detailní statistiky a reporty tvých výdělků</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Period Selector */}
              <div className="flex space-x-2">
                {['week', 'month', 'year'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-lg transition ${
                      period === p
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {p === 'week' ? 'Týden' : p === 'month' ? 'Měsíc' : 'Rok'}
                  </button>
                ))}
              </div>

              {/* Export Buttons */}
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/30 transition"
              >
                📄 PDF
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-500/20 border border-green-500 text-green-400 rounded-lg hover:bg-green-500/30 transition"
              >
                📊 Excel
              </button>

              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition text-3xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Earnings Graph */}
          <div className="card mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">💰 Denní výdělky</h2>
            <div className="flex items-end justify-between space-x-2 h-64">
              {analytics.earnings.daily.map((amount, index) => {
                const height = (amount / maxEarnings) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="relative flex-1 w-full flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-primary-500 to-gold-500 rounded-t-lg transition-all duration-500 hover:scale-105 relative group"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                          {amount} Kč
                        </div>
                      </div>
                    </div>
                    <div className="text-white/60 text-sm mt-2">{analytics.earnings.labels[index]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Streams */}
            <div className="card bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30">
              <div className="text-4xl mb-3">🎥</div>
              <div className="text-3xl font-bold text-white mb-1">{analytics.streams.count}</div>
              <div className="text-white/60 mb-3">Live streamů</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Celkem diváků:</span>
                  <span className="text-white font-semibold">{analytics.streams.totalViewers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Ø na stream:</span>
                  <span className="text-white font-semibold">{analytics.streams.avgViewers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Celkem hodin:</span>
                  <span className="text-white font-semibold">{Math.round(analytics.streams.totalDuration / 60)}</span>
                </div>
              </div>
            </div>

            {/* Calls */}
            <div className="card bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
              <div className="text-4xl mb-3">📞</div>
              <div className="text-3xl font-bold text-white mb-1">{analytics.calls.count}</div>
              <div className="text-white/60 mb-3">Privátních hovorů</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Celkem minut:</span>
                  <span className="text-white font-semibold">{analytics.calls.totalDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Ø délka:</span>
                  <span className="text-white font-semibold">{analytics.calls.avgDuration} min</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card bg-gradient-to-br from-gold-500/20 to-yellow-500/20 border-gold-500/30">
              <div className="text-4xl mb-3">💰</div>
              <div className="text-3xl font-bold text-white mb-1">{analytics.tips.count}</div>
              <div className="text-white/60 mb-3">Tipů obdrženo</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Celkem:</span>
                  <span className="text-white font-semibold">{analytics.tips.total} Kč</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Ø tip:</span>
                  <span className="text-white font-semibold">{analytics.tips.avgTip} Kč</span>
                </div>
              </div>
            </div>

            {/* Total Earnings */}
            <div className="card bg-gradient-to-br from-primary-500/20 to-purple-500/20 border-primary-500/30">
              <div className="text-4xl mb-3">💎</div>
              <div className="text-3xl font-bold text-white mb-1">
                {analytics.earnings.daily.reduce((a, b) => a + b, 0)} Kč
              </div>
              <div className="text-white/60 mb-3">Celkový výdělek</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Ø denně:</span>
                  <span className="text-white font-semibold">
                    {Math.round(analytics.earnings.daily.reduce((a, b) => a + b, 0) / analytics.earnings.daily.length)} Kč
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Best Times & Top Fans */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Best Times */}
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-4">⏰ Nejlepší časy pro streaming</h2>
              <div className="space-y-3">
                {analytics.bestTimes.map((time, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl font-bold text-primary-400">#{index + 1}</div>
                      <div>
                        <div className="text-white font-semibold">{time.day}</div>
                        <div className="text-white/60 text-sm">{time.time}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{time.viewers}</div>
                      <div className="text-white/60 text-sm">diváků</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Fans */}
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-4">🏆 Top fanoušci</h2>
              <div className="space-y-3">
                {analytics.topFans.map((fan) => (
                  <div key={fan.rank} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`text-3xl ${
                        fan.rank === 1 ? '🥇' : fan.rank === 2 ? '🥈' : '🥉'
                      }`}>
                        {fan.rank === 1 ? '🥇' : fan.rank === 2 ? '🥈' : '🥉'}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{fan.name}</div>
                        <div className="text-white/60 text-sm">Celkem poslal</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gold-400 font-bold text-xl">{fan.spent} Kč</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Distribution */}
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-4">📊 Věková struktura</h2>
              <div className="space-y-3">
                {analytics.demographics.age.map((age, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60">{age.range} let</span>
                      <span className="text-white font-semibold">{age.percent}%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-gold-500 rounded-full transition-all duration-500"
                        style={{ width: `${age.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Distribution */}
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-4">📍 Lokace diváků</h2>
              <div className="space-y-3">
                {analytics.demographics.locations.map((location, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60">{location.city}</span>
                      <span className="text-white font-semibold">{location.percent}%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${location.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
