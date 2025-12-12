import React, { useState, useEffect, lazy, Suspense } from 'react';
import api from './utils/axios';
import { useAuth } from './contexts/AuthContext';
import { useTheme, ThemeToggle } from './contexts/ThemeContext';
import Register from './components/Register';
import Login from './components/Login';
import OnlineUsers from './components/OnlineUsers';
import SkeletonLoader from './components/SkeletonLoader';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';

// Lazy load non-critical components for better performance
const Chat = lazy(() => import('./Chat'));
const LiveStream = lazy(() => import('./components/LiveStream'));
const PrivateCall = lazy(() => import('./components/PrivateCall'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Albums = lazy(() => import('./components/Albums'));
const Notifications = lazy(() => import('./components/Notifications'));
const Booking = lazy(() => import('./components/Booking'));
const Wishlist = lazy(() => import('./components/Wishlist'));
const Analytics = lazy(() => import('./components/Analytics'));
const Stories = lazy(() => import('./components/Stories'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const [servicePrice, setServicePrice] = useState(5000);
  const [comparison, setComparison] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [showPrivateCall, setShowPrivateCall] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAlbums, setShowAlbums] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedWorkerForAlbums, setSelectedWorkerForAlbums] = useState(null);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState(null);
  const [selectedWorkerForWishlist, setSelectedWorkerForWishlist] = useState(null);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    calculateEarnings();
    fetchWorkers();
  }, [servicePrice]);

  const fetchWorkers = async () => {
    setLoadingWorkers(true);
    try {
      const response = await api.get('/workers');
      setWorkers(response.data.success ? response.data.workers : []);
    } catch (error) {
      console.log('Backend není spuštěný, používám demo data');
      setWorkers([
        { id: 1, username: 'Petra K.', rating: 4.9, totalEarnings: 45230, servicesCount: 38, reviewsCount: 35 },
        { id: 2, username: 'Lucie M.', rating: 4.8, totalEarnings: 38560, servicesCount: 32, reviewsCount: 29 },
        { id: 3, username: 'Tereza N.', rating: 5.0, totalEarnings: 52100, servicesCount: 42, reviewsCount: 42 },
      ]);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const calculateEarnings = () => {
    const ourCommission = Math.round(servicePrice * 0.15);
    const ourEarnings = Math.round(servicePrice * 0.85);
    const competitorCommission = Math.round(servicePrice * 0.40);
    const competitorEarnings = Math.round(servicePrice * 0.60);

    setComparison({
      ourSystem: {
        commission: ourCommission,
        workerEarnings: ourEarnings,
        commissionRate: 15
      },
      competitor: {
        name: 'Amateri.com',
        commission: competitorCommission,
        workerEarnings: competitorEarnings,
        commissionRate: 40
      },
      advantage: ourEarnings - competitorEarnings
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Skip link pro přístupnost */}
      <a href="#main-content" className="skip-link">
        Přeskočit na hlavní obsah
      </a>

      {/* Sidebar pro přihlášené uživatele */}
      {isAuthenticated && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      )}

      {/* Hlavní obsah */}
      <div id="main-content" className={`flex-1 ${isAuthenticated ? 'md:ml-64' : ''}`}>
        {/* Navbar */}
        <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-xl border-b border-white/10 z-40" role="navigation" aria-label="Hlavní navigace">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {/* Tlačítko pro otevření sidebaru na mobilech */}
              {isAuthenticated && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden text-white/80 hover:text-white transition mr-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <span className="text-3xl">💎</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-gold-400 bg-clip-text text-transparent">
                FairWorkers
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#benefits" className="text-white/80 hover:text-white transition">Výhody</a>
              <a href="#calculator" className="text-white/80 hover:text-white transition">Kalkulačka</a>
              <a href="#workers" className="text-white/80 hover:text-white transition">Profily</a>
              
              {/* Theme toggle */}
              <ThemeToggle />
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Zjednodušený navbar pro přihlášené uživatele */}
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-white/80 hover:text-white transition"
                  >
                    <span className="text-2xl">🔔</span>
                  </button>
                  <span className="text-white/80">Ahoj, {user?.display_name || user?.username}</span>
                  <button onClick={logout} className="btn-secondary">
                    Odhlásit se
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => setShowLogin(true)} className="text-white/80 hover:text-white transition">
                    Přihlásit se
                  </button>
                  <button onClick={() => setShowRegister(true)} className="btn-primary">
                    Začít vydělávat
                  </button>
                </>
              )}
            </div>
            
            {/* Mobile menu button pro nepřihlášené */}
            {!isAuthenticated && (
              <div className="md:hidden">
                <button onClick={() => setShowLogin(true)} className="text-white/80 hover:text-white transition mr-2">
                  Přihlásit se
                </button>
                <button onClick={() => setShowRegister(true)} className="btn-primary text-sm">
                  Začít
                </button>
              </div>
            )}
          </div>
        </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <div className="px-6 py-2 bg-primary-500/20 backdrop-blur-lg rounded-full border border-primary-500/30 text-primary-300 font-semibold text-sm mb-6">
                ✨ Férová platforma pro modelky
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-white via-primary-200 to-gold-300 bg-clip-text text-transparent">
                Vaše práce.<br/>
                Vaše peníze.<br/>
                Pouze 15% provize.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Zatímco konkurence si nechává <span className="text-red-400 font-bold">40%</span>,
              my vám vrátíme <span className="text-primary-400 font-bold">85%</span> vašich výdělků.
              Protože si zasloužíte víc.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button
                onClick={() => setShowRegister(true)}
                className="btn-primary text-lg"
              >
                🚀 Zaregistrovat se zdarma
              </button>
              <button className="btn-secondary text-lg">
                📊 Zjistit více
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto">
              <div className="card text-center">
                <div className="text-4xl font-bold text-primary-400">15%</div>
                <div className="text-white/60 mt-2">Provize</div>
              </div>
              <div className="card text-center">
                <div className="text-4xl font-bold text-gold-400">7 dní</div>
                <div className="text-white/60 mt-2">Na výplatu</div>
              </div>
              <div className="card text-center">
                <div className="text-4xl font-bold text-green-400">24/7</div>
                <div className="text-white/60 mt-2">Podpora</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-gold-400 bg-clip-text text-transparent">
                Kolik skutečně vyděláte?
              </span>
            </h2>
            <p className="text-xl text-white/70">Porovnejte si výdělek s konkurencí</p>
          </div>

          <div className="card">
            {/* Slider */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <label className="text-white/80 text-lg">Cena služby:</label>
                <div className="text-4xl font-bold text-primary-400">{servicePrice.toLocaleString()} Kč</div>
              </div>
              <input
                type="range"
                min="500"
                max="20000"
                step="500"
                value={servicePrice}
                onChange={(e) => setServicePrice(Number(e.target.value))}
                className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-sm text-white/40 mt-2">
                <span>500 Kč</span>
                <span>20 000 Kč</span>
              </div>
            </div>

            {/* Comparison */}
            {comparison && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* FairWorkers */}
                <div className="relative bg-gradient-to-br from-primary-500/20 to-primary-700/20 p-8 rounded-2xl border-2 border-primary-500/50">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full text-sm font-bold">
                    💎 FairWorkers
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-white mb-2">
                        {comparison.ourSystem.workerEarnings.toLocaleString()} Kč
                      </div>
                      <div className="text-white/60">Váš čistý výdělek</div>
                    </div>
                    <div className="pt-4 border-t border-white/10 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/60">Provize:</span>
                        <span className="font-semibold">{comparison.ourSystem.commission.toLocaleString()} Kč ({comparison.ourSystem.commissionRate}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Competitor */}
                <div className="relative bg-gradient-to-br from-red-500/20 to-red-700/20 p-8 rounded-2xl border-2 border-red-500/50">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-full text-sm font-bold">
                    ⚠️ {comparison.competitor.name}
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-white mb-2">
                        {comparison.competitor.workerEarnings.toLocaleString()} Kč
                      </div>
                      <div className="text-white/60">Váš čistý výdělek</div>
                    </div>
                    <div className="pt-4 border-t border-white/10 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/60">Provize:</span>
                        <span className="font-semibold text-red-400">{comparison.competitor.commission.toLocaleString()} Kč ({comparison.competitor.commissionRate}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Advantage */}
            {comparison && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    🎯 S FairWorkers vyděláte o {comparison.advantage.toLocaleString()} Kč více!
                  </div>
                  <div className="text-white/70">
                    To je o {((comparison.advantage / comparison.competitor.workerEarnings) * 100).toFixed(0)}% víc peněz ve vaší kapse.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-gold-400 bg-clip-text text-transparent">
                Proč FairWorkers?
              </span>
            </h2>
            <p className="text-xl text-white/70">Platforma vytvořená pro vaše potřeby</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card hover:scale-105 transition-transform cursor-pointer">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-2xl font-bold mb-3 text-primary-300">Férová provize</h3>
              <p className="text-white/70">Pouze 15% místo 40%. Více peněz pro vás, méně pro nás.</p>
            </div>

            <div className="card hover:scale-105 transition-transform cursor-pointer">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3 text-gold-300">Rychlé výplaty</h3>
              <p className="text-white/70">Peníze na účtu do 7 dní. Žádné čekání.</p>
            </div>

            <div className="card hover:scale-105 transition-transform cursor-pointer">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-2xl font-bold mb-3 text-green-300">Bezpečnost</h3>
              <p className="text-white/70">Panic button, safety checks, anonymita. Vaše bezpečnost je priorita.</p>
            </div>

            <div className="card hover:scale-105 transition-transform cursor-pointer">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold mb-3 text-blue-300">Fond solidarity</h3>
              <p className="text-white/70">0.5% jde do fondu pro podporu pracovnic v nouzi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workers Section */}
      <section id="workers" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-gold-400 bg-clip-text text-transparent">
                Naše modelky
              </span>
            </h2>
            <p className="text-xl text-white/70">Úspěšné ženy, které nám důvěřují</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loadingWorkers ? (
              <SkeletonLoader type="worker-card" count={3} />
            ) : (
              workers.map(worker => (
                <div key={worker.id} className="card hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold">{worker.username}</h3>
                    <div className="flex items-center space-x-1 px-3 py-1 bg-gold-500/20 rounded-full">
                      <span className="text-gold-400">⭐</span>
                      <span className="font-bold text-gold-400">{worker.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-3 text-white/70">
                    <div className="flex justify-between">
                      <span>Celkový výdělek:</span>
                      <span className="font-bold text-primary-400">{(worker.totalEarnings || 0).toLocaleString()} Kč</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Služeb:</span>
                      <span className="font-semibold">{worker.servicesCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hodnocení:</span>
                      <span className="font-semibold">{worker.reviewsCount || 0}</span>
                    </div>
                  </div>

                  {/* Video Call Buttons */}
                  {isAuthenticated && user?.role === 'client' && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                      <button
                        onClick={() => {
                          setSelectedWorker(worker);
                          setShowPrivateCall(true);
                        }}
                        className="w-full px-4 py-2 bg-gradient-to-r from-primary-500 to-gold-500 text-white font-semibold rounded-lg hover:scale-105 transition"
                      >
                        📞 Privátní hovor
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="card bg-gradient-to-br from-primary-500/20 to-gold-500/20 border-2 border-primary-500/30 text-center">
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">
                Připraveni začít?
              </span>
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Zaregistrujte se zdarma a začněte vydělávat s férovou provizí už dnes.
              Bez skrytých poplatků. Bez překvapení.
            </p>
            <button
              onClick={() => setShowRegister(true)}
              className="btn-primary text-xl"
            >
              🚀 Začít vydělávat hned teď
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-3xl">💎</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-gold-400 bg-clip-text text-transparent">
                FairWorkers
              </span>
            </div>
            <p className="text-white/60">© 2024 FairWorkers - Etická platforma pro modelky</p>
            <p className="text-white/40 text-sm">Transparentní • Bezpečné • Férové</p>
          </div>
        </div>
      </footer>

      {/* Register Modal */}
      {showRegister && (
        <Register
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}

      {/* Login Modal */}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {/* Live Stream Modal */}
      <Suspense fallback={<LoadingFallback />}>
        {showLiveStream && (
          <LiveStream
            isStreamer={true}
            onClose={() => setShowLiveStream(false)}
          />
        )}

        {/* Private Call Modal */}
        {showPrivateCall && selectedWorker && (
          <PrivateCall
            otherUserId={selectedWorker.id}
            otherUserName={selectedWorker.username}
            isInitiator={true}
            onClose={() => {
              setShowPrivateCall(false);
              setSelectedWorker(null);
            }}
          />
        )}

        {/* Dashboard Modal */}
        {showDashboard && (
          <Dashboard onClose={() => setShowDashboard(false)} />
        )}

        {/* Albums Modal */}
        {showAlbums && selectedWorkerForAlbums && (
          <Albums
            workerId={selectedWorkerForAlbums}
            isOwner={user?.id === selectedWorkerForAlbums}
            onClose={() => {
              setShowAlbums(false);
              setSelectedWorkerForAlbums(null);
            }}
          />
        )}

        {/* Notifications Panel */}
        <Notifications
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          onNotificationClick={(notification) => {
            // Handle notification click
            if (notification.type === 'call-request') {
              setSelectedWorker({
                id: notification.data.clientId,
                username: notification.data.clientName
              });
              setShowPrivateCall(true);
            } else if (notification.type === 'stream-started') {
              // Could open the stream automatically
              console.log('Stream started:', notification.data);
            }
            setShowNotifications(false);
          }}
        />

        {/* Booking Modal */}
        {showBooking && selectedWorkerForBooking && (
          <Booking
            workerId={selectedWorkerForBooking.id}
            workerName={selectedWorkerForBooking.display_name || selectedWorkerForBooking.username}
            isOwner={user?.id === selectedWorkerForBooking.id}
            onClose={() => {
              setShowBooking(false);
              setSelectedWorkerForBooking(null);
            }}
          />
        )}

        {/* Wishlist Modal */}
        {showWishlist && selectedWorkerForWishlist && (
          <Wishlist
            workerId={selectedWorkerForWishlist.id}
            workerName={selectedWorkerForWishlist.display_name || selectedWorkerForWishlist.username}
            isOwner={user?.id === selectedWorkerForWishlist.id}
            onClose={() => {
              setShowWishlist(false);
              setSelectedWorkerForWishlist(null);
            }}
          />
        )}

        {/* Analytics Modal */}
        {showAnalytics && (
          <Analytics onClose={() => setShowAnalytics(false)} />
        )}

        {/* Stories Modal */}
        {showStories && (
          <Stories onClose={() => setShowStories(false)} />
        )}

        {/* Chat Component */}
        <Chat />

        {/* Online Users Widget */}
        <OnlineUsers />
      </Suspense>

      {/* Bottom Navigation pro mobily */}
      <BottomNav 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      </div>
    </div>
  );
}

export default App;
