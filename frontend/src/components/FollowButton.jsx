import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const FollowButton = ({ workerId, initialFollowing = false, initialSubscribed = false, showSubscribe = true }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  useEffect(() => {
    if (user?.id && workerId) {
      checkFollowStatus();
    }
  }, [user?.id, workerId]);

  const checkFollowStatus = async () => {
    try {
      const response = await api.get(`/community/follow-status/${workerId}`);
      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
        setIsSubscribed(response.data.isSubscribed);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      alert('Přihlaš se pro následování');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/community/${isFollowing ? 'unfollow' : 'follow'}/${workerId}`);
      if (response.data.success) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      alert('Něco se nepovedlo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      alert('Přihlaš se pro subscription');
      return;
    }

    setShowSubscribeModal(true);
  };

  const confirmSubscribe = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/community/subscribe/${workerId}`);
      if (response.data.success) {
        setIsSubscribed(true);
        setIsFollowing(true);
        setShowSubscribeModal(false);
        alert('Subscription aktivován! 🎉');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Subscription se nezdařil');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!confirm('Opravdu chceš zrušit subscription?')) return;

    setLoading(true);
    try {
      const response = await api.post(`/community/unsubscribe/${workerId}`);
      if (response.data.success) {
        setIsSubscribed(false);
        alert('Subscription zrušen');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      alert('Něco se nepovedlo');
    } finally {
      setLoading(false);
    }
  };

  if (user?.id === workerId) {
    return null; // Don't show follow button on own profile
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Follow Button */}
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`px-6 py-2 rounded-lg font-semibold transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
          isFollowing
            ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
            : 'bg-gradient-to-r from-primary-500 to-gold-500 text-white'
        }`}
      >
        {loading ? '⏳' : isFollowing ? '✓ Sleduješ' : '➕ Sledovat'}
      </button>

      {/* Subscribe Button */}
      {showSubscribe && !isSubscribed && isFollowing && (
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          💎 Subscribe (99 Kč/měs)
        </button>
      )}

      {/* Subscribed Badge */}
      {isSubscribed && (
        <div className="flex items-center space-x-2">
          <div className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500 text-purple-400 font-bold rounded-lg flex items-center space-x-2">
            <span>💎</span>
            <span>VIP Subscriber</span>
          </div>
          <button
            onClick={handleUnsubscribe}
            className="px-4 py-2 bg-white/10 border border-white/20 text-white/60 text-sm rounded-lg hover:bg-white/20 transition"
          >
            Zrušit
          </button>
        </div>
      )}

      {/* Subscribe Confirmation Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-purple-500/30">
            <h2 className="text-3xl font-bold text-white mb-4">💎 VIP Subscription</h2>
            <p className="text-white/80 mb-6">
              Získej exkluzivní přístup k premium obsahu, soukromým albumům a prioritní podpoře!
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">✨</span>
                <div>
                  <div className="text-white font-semibold">Exclusive obsah</div>
                  <div className="text-white/60 text-sm">Přístup k VIP albům a videím</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <div className="text-white font-semibold">Prioritní notifikace</div>
                  <div className="text-white/60 text-sm">Budeš první kdo ví o novém obsahu</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💬</span>
                <div>
                  <div className="text-white font-semibold">VIP chat badge</div>
                  <div className="text-white/60 text-sm">Tvůj nick bude zvýrazněný</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎁</span>
                <div>
                  <div className="text-white font-semibold">Speciální slevy</div>
                  <div className="text-white/60 text-sm">20% sleva na private hovory</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4 mb-6">
              <div className="text-center">
                <div className="text-white/60 text-sm mb-1">Cena</div>
                <div className="text-4xl font-bold text-white">99 Kč<span className="text-lg text-white/60">/měsíc</span></div>
                <div className="text-white/40 text-sm mt-2">Zruš kdykoliv</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                Zrušit
              </button>
              <button
                onClick={confirmSubscribe}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:scale-105 transition disabled:opacity-50"
              >
                {loading ? '⏳ Zpracovávám...' : '💎 Potvrdit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowButton;
