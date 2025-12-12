import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const Dashboard = ({ onClose }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    todayEarnings: 0,
    totalStreams: 0,
    totalCalls: 0,
    totalTips: 0,
    activeFollowers: 0,
    averageRating: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.stats);
        setRecentActivity(response.data.recentActivity || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Demo data pro ukázku
      setStats({
        totalEarnings: 45230,
        thisMonthEarnings: 12500,
        todayEarnings: 850,
        totalStreams: 38,
        totalCalls: 124,
        totalTips: 8950,
        activeFollowers: 267,
        averageRating: 4.9
      });
      setRecentActivity([
        { type: 'call', user: 'Jakub K.', amount: 400, time: '15 min ago' },
        { type: 'tip', user: 'Martin P.', amount: 200, time: '1 hour ago' },
        { type: 'stream', viewers: 45, duration: '2h 15min', time: '3 hours ago' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                💎 Dashboard
              </h1>
              <p className="text-white/60">
                Ahoj {user?.display_name || user?.username}, tady je tvůj přehled
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition text-3xl"
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="text-center text-white text-2xl py-20">Načítání...</div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Earnings */}
                <div className="card">
                  <div className="text-white/60 text-sm mb-2">Celkový výdělek</div>
                  <div className="text-3xl font-bold text-primary-400">
                    {stats.totalEarnings.toLocaleString()} Kč
                  </div>
                  <div className="text-green-400 text-sm mt-2">
                    ↑ {stats.thisMonthEarnings.toLocaleString()} Kč tento měsíc
                  </div>
                </div>

                {/* Today Earnings */}
                <div className="card">
                  <div className="text-white/60 text-sm mb-2">Dnes</div>
                  <div className="text-3xl font-bold text-gold-400">
                    {stats.todayEarnings.toLocaleString()} Kč
                  </div>
                  <div className="text-white/40 text-sm mt-2">
                    {stats.totalCalls} hovorů celkem
                  </div>
                </div>

                {/* Streams */}
                <div className="card">
                  <div className="text-white/60 text-sm mb-2">Live streamy</div>
                  <div className="text-3xl font-bold text-white">
                    {stats.totalStreams}
                  </div>
                  <div className="text-white/40 text-sm mt-2">
                    {stats.activeFollowers} aktivních followerů
                  </div>
                </div>

                {/* Rating */}
                <div className="card">
                  <div className="text-white/60 text-sm mb-2">Hodnocení</div>
                  <div className="text-3xl font-bold text-gold-400 flex items-center">
                    ⭐ {stats.averageRating}
                  </div>
                  <div className="text-white/40 text-sm mt-2">
                    {stats.totalTips.toLocaleString()} Kč tipů
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                  <div className="card">
                    <h2 className="text-2xl font-bold text-white mb-6">
                      📊 Nedávná aktivita
                    </h2>
                    <div className="space-y-4">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="text-3xl">
                                {activity.type === 'call' && '📞'}
                                {activity.type === 'tip' && '💰'}
                                {activity.type === 'stream' && '🎥'}
                              </div>
                              <div>
                                <div className="text-white font-semibold">
                                  {activity.type === 'call' && `Privátní hovor - ${activity.user}`}
                                  {activity.type === 'tip' && `Tip od ${activity.user}`}
                                  {activity.type === 'stream' && `Live stream - ${activity.viewers} diváků`}
                                </div>
                                <div className="text-white/40 text-sm">
                                  {activity.time}
                                  {activity.duration && ` • ${activity.duration}`}
                                </div>
                              </div>
                            </div>
                            {activity.amount && (
                              <div className="text-xl font-bold text-primary-400">
                                +{activity.amount} Kč
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-white/40 py-8">
                          Zatím žádná aktivita
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                  <div className="card">
                    <h2 className="text-xl font-bold text-white mb-4">
                      ⚡ Rychlé akce
                    </h2>
                    <div className="space-y-3">
                      <button className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:scale-105 transition">
                        🎥 Spustit Live Stream
                      </button>
                      <button className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-gold-500 text-white font-semibold rounded-lg hover:scale-105 transition">
                        📸 Nahrát obsah
                      </button>
                      <button className="w-full px-4 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition">
                        💬 Zprávy
                      </button>
                      <button className="w-full px-4 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition">
                        ⚙️ Nastavení
                      </button>
                    </div>
                  </div>

                  {/* Earnings Breakdown */}
                  <div className="card">
                    <h2 className="text-xl font-bold text-white mb-4">
                      💰 Zdroje příjmu
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Privátní hovory</span>
                        <span className="text-white font-semibold">
                          {((stats.totalCalls * 400) || 0).toLocaleString()} Kč
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Tipy</span>
                        <span className="text-white font-semibold">
                          {stats.totalTips.toLocaleString()} Kč
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Prémiový obsah</span>
                        <span className="text-white font-semibold">
                          {((stats.totalEarnings - stats.totalTips - (stats.totalCalls * 400)) || 0).toLocaleString()} Kč
                        </span>
                      </div>
                      <div className="pt-3 border-t border-white/10">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-primary-400">CELKEM</span>
                          <span className="text-primary-400 text-xl">
                            {stats.totalEarnings.toLocaleString()} Kč
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
